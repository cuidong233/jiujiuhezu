import { defineStore } from 'pinia'
import { cartApi } from '@/api/common'
import { useUserStore } from '@/stores/user'

export interface CartItem {
  id: number
  name: string
  image: string
  price: number
  spec?: string
  duration?: string  // 商品时长信息
  quantity: number
}

interface CartState {
  items: CartItem[]
  loading: boolean // 新增：加载状态
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
    loading: false
  }),
  actions: {
    async loadCart() {
      // 获取当前用户ID
      const userStore = useUserStore()
      const userId = userStore.user?.id
      if (!userId) {
        this.items = [] // 未登录时清空购物车
        return
      }
      
      this.loading = true
      try {
        const res = await cartApi.getCartList(userId)
        if (res.code === 0 && res.data && Array.isArray(res.data.list)) {
          this.items = res.data.list.map((item: any) => ({
            id: item.goodsId,
            name: item.name || '',
            image: item.image || '',
            price: item.price || 0,
            spec: item.spec,
            duration: item.duration,
            quantity: item.quantity
          }))
        } else {
          this.items = [] // API返回异常时清空
        }
      } catch (e: any) {
        // 静默处理错误，不显示"用户不存在"等错误
        if (!e.message?.includes('用户不存在') && !e.message?.includes('用户未登录')) {
          console.warn('购物车加载使用空数据')
        }
        this.items = [] // 异常时清空
      } finally {
        this.loading = false
      }
    },
    async addToCart(item: Omit<CartItem, 'quantity'>, quantity = 1) {
      const userStore = useUserStore()
      const userId = userStore.user?.id
      if (!userId) return
      try {
        await cartApi.addToCart(userId, item.id, quantity, item.spec)
        await this.loadCart()
      } catch (e) {
        console.error('添加到购物车失败', e)
      }
    },
    async removeFromCart(id: number, spec?: string) {
      const userStore = useUserStore()
      const userId = userStore.user?.id
      if (!userId) return
      try {
        await cartApi.removeFromCart(userId, id, spec)
        await this.loadCart()
      } catch (e) {
        console.error('移除购物车商品失败', e)
      }
    },
    async updateQuantity(id: number, quantity: number, spec?: string) {
      const userStore = useUserStore()
      const userId = userStore.user?.id
      if (!userId) return
      try {
        await cartApi.updateCart(userId, id, quantity, spec)
        await this.loadCart()
      } catch (e) {
        console.error('更新购物车数量失败', e)
      }
    },
    async clearCart() {
      const userStore = useUserStore()
      const userId = userStore.user?.id
      if (!userId) return
      try {
        await cartApi.clearCart(userId)
        await this.loadCart()
      } catch (e) {
        console.error('清空购物车失败', e)
      }
    },
    // 新增：初始化购物车（在用户登录后调用）
    async initCart() {
      await this.loadCart()
    }
    // 🎨 前端UI设计阶段 - 本地存储实现（已注释，用于检查页面功能）
    /*
    addToCart(item: Omit<CartItem, 'quantity'>, quantity = 1) {
      // 安全检查：确保item存在且有效
      if (!item || typeof item.id !== 'number' || !item.name) {
        console.warn('尝试添加无效商品到购物车:', item)
        return
      }
      
      const exist = this.items.find(i => i.id === item.id && i.spec === item.spec)
      if (exist) {
        exist.quantity += quantity
      } else {
        this.items.push({ ...item, quantity })
      }
    },
    removeFromCart(id: number, spec?: string) {
      // 安全检查：确保items数组存在
      if (!this.items) {
        console.warn('购物车数据异常，无法移除商品')
        return
      }
      this.items = this.items.filter(i => !(i.id === id && i.spec === spec))
    },
    updateQuantity(id: number, quantity: number, spec?: string) {
      // 安全检查：确保items数组存在
      if (!this.items) {
        console.warn('购物车数据异常，无法更新数量')
        return
      }
      const exist = this.items.find(i => i.id === id && i.spec === spec)
      if (exist && quantity > 0) exist.quantity = quantity
    },
    clearCart() {
      this.items = []
    }
    */
  },
  getters: {
    totalPrice: state => {
      // 增强安全检查
      if (!state.items || !Array.isArray(state.items) || state.items.length === 0) return 0
      return state.items.reduce((sum, i) => {
        if (!i || typeof i.price !== 'number' || typeof i.quantity !== 'number') return sum
        return sum + i.price * i.quantity
      }, 0)
    },
    totalCount: state => {
      // 增强安全检查
      if (!state.items || !Array.isArray(state.items) || state.items.length === 0) return 0
      return state.items.reduce((sum, i) => {
        if (!i || typeof i.quantity !== 'number') return sum
        return sum + i.quantity
      }, 0)
    }
  }
}) 