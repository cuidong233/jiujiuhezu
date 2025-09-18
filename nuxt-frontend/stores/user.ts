import { defineStore } from 'pinia'
import type { User, LoginParams } from '@/types/api'
import { authApi } from '@/api/auth'
import { orderApi } from '@/api/order'
import { favoriteApi } from '@/api/common'
import { http } from '@/utils/request'

// 定义收藏商品类型
interface FavoriteItem {
  id: number
  name: string
  image: string
  desc: string
  region: string
  quality: string
  devices: string
  download: string
  prices: { label: string; value: string }[]
  hot?: boolean
  addTime: string
}

// 定义订单类型
interface OrderItem {
  id: string
  orderNo?: string  // 订单号（API使用）
  title: string
  amount: string
  time: string
  status: 'pending' | 'shipping' | 'delivered' | 'shipped' | 'completed' | 'expired' | 'cancelled' | string
  statusText: string
  statusClass: string
  payType?: string
  productImage?: string
}

/**
 * 用户状态管理
 */
export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref<User | null>(null)
  // 使用普通的 ref 存储 token
  const token = ref<string | null>(null)
  // Cookie 引用，用于同步
  const tokenCookie = useCookie('token', {
    httpOnly: false,
    secure: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7天
  })
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  
  // 收藏相关状态
  const favorites = ref<FavoriteItem[]>([])
  const favoritesKey = 'user_favorites'

  // 订单相关状态
  const orders = ref<OrderItem[]>([])
  const ordersKey = 'user_orders'

  // 不再使用硬编码的默认订单数据，只使用真实API数据

  // 收藏相关API实现
  const loadFavorites = async () => {
    const userId = user.value?.id
    if (!userId) return
    try {
      const res = await favoriteApi.getFavorites(userId)
      if (res.code === 0 && res.data && Array.isArray(res.data.list)) {
        favorites.value = res.data.list.map((item: any) => ({
          id: item.goodsId,
          name: item.name || '',
          image: item.image || '',
          desc: item.desc || '',
          region: item.region || '',
          quality: item.quality || '',
          devices: item.devices || '',
          download: item.download || '',
          prices: item.prices || [],
          hot: item.hot,
          addTime: item.addTime || ''
        }))
      }
    } catch (e: any) {
      // 静默处理错误，不在控制台显示红色错误
      if (!e.message?.includes('Not Found') && 
          !e.message?.includes('用户不存在') && 
          !e.message?.includes('用户未登录')) {
        console.debug('[收藏] 使用空数据')
      }
      // 使用空数组作为默认值
      favorites.value = []
    }
  }

  const addToFavorites = async (item: Omit<FavoriteItem, 'addTime'>) => {
    const userId = user.value?.id
    if (!userId) return { success: false, message: '未登录' }
    try {
      const res = await favoriteApi.addToFavorites(userId, item.id)
      if (res.code === 0) {
        await loadFavorites()
        return { success: true, message: '添加收藏成功' }
      }
      return { success: false, message: res.msg || '添加收藏失败' }
    } catch (e) {
      return { success: false, message: '添加收藏失败' }
    }
  }

  const removeFromFavorites = async (itemId: number) => {
    const userId = user.value?.id
    if (!userId) return { success: false, message: '未登录' }
    try {
      const res = await favoriteApi.removeFromFavorites(userId, itemId)
      if (res.code === 0) {
        await loadFavorites()
        return { success: true, message: '取消收藏成功' }
      }
      return { success: false, message: res.msg || '取消收藏失败' }
    } catch (e) {
      return { success: false, message: '取消收藏失败' }
    }
  }

  const checkIsFavorite = (itemId: number) => {
    return favorites.value.some(fav => fav.id === itemId)
  }

  const checkIsFavoriteFromAPI = async (itemId: number) => {
    const userId = user.value?.id
    if (!userId) return false
    try {
      const res = await favoriteApi.checkFavorite(userId, itemId)
      return res.code === 0 ? res.data : false
    } catch (e) {
      return false
    }
  }

  // 从本地存储加载订单数据
  const loadOrders = async () => {
    if (process.client) {
      try {
        // 只在登录状态下加载真实订单
        if (token.value && user.value) {
          await fetchOrdersFromAPI()
        } else {
          // 未登录时没有订单
          orders.value = []
        }
      } catch (error) {
        // 静默处理错误
        orders.value = []
      }
    }
  }

  // ✅ 新增：从API获取订单数据
  const fetchOrdersFromAPI = async () => {
    try {
      if (!token.value || !user.value) {
        // 移除调试日志
        orders.value = []
        return
      }
      
      const response = await orderApi.getOrderList({ page: 1, limit: 50 })
      // 移除调试日志
      
      if (response.success && response.data && response.data.list) {
        // 转换API订单格式为前端格式
        const apiOrders = response.data.list.map((order: any) => ({
          id: order.orderNo || order.id,
          orderNo: order.orderNo || order.id,  // 确保有orderNo字段
          title: order.productName || order.goodsName || '未知商品',
          amount: `¥${order.totalAmount?.toFixed(2) || '0.00'}`,
          time: order.createTime || order.createdAt,
          // 使用 deliveryStatus 作为主要状态判断
          status: getOrderStatus(order.deliveryStatus),
          statusText: getOrderStatusText(order.deliveryStatus),
          statusClass: getOrderStatusClass(order.deliveryStatus),
          payType: order.paymentMethod || order.payMethod || '未知',
          productImage: order.productImage || order.goodsImage
        }))
        
        orders.value = apiOrders
      } else {
        orders.value = []
      }
    } catch (error: any) {
      // 静默处理，不在控制台显示错误
      if (!error.message?.includes('用户未登录') && !error.message?.includes('用户不存在')) {
        // 移除调试日志
      }
      orders.value = []
    }
  }

  // ✅ 新增：订单状态转换函数
  const getOrderStatus = (status: number): OrderItem['status'] | string => {
    // 移除调试日志
    // 根据后端实际的状态定义进行映射
    // 0: 待支付
    // 1: 待发货（已支付）
    // 2: 已发货
    // 3: 已送达（但后端可能还认为是待确认状态）
    // 4: 已完成（已确认收货）
    // 5: 已取消
    switch (status) {
      case 0: return 'pending'      // 待支付
      case 1: return 'shipping'     // 待发货
      case 2: return 'delivered'    // 已发货
      case 3: return 'delivered'    // 已送达 - 虽然显示已发货，但后端可能还需要特殊处理
      case 4: return 'completed'    // 已完成
      case 5: return 'cancelled'    // 已取消
      default: 
        // 移除调试日志
        return 'pending'
    }
  }

  const getOrderStatusText = (status: number): string => {
    switch (status) {
      case 0: return '待支付'
      case 1: return '已发货'
      case 2: return '已发货'
      case 3: return '已完成'
      case 4: return '已完成'
      case 5: return '已取消'
      default: return '已过期'
    }
  }

  const getOrderStatusClass = (status: number): string => {
    switch (status) {
      case 0: return 'pending'
      case 1: return 'shipping'
      case 2: return 'delivered'
      case 3: return 'delivered'
      case 4: return 'completed'
      case 5: return 'cancelled'
      default: return 'pending'
    }
  }

  // 保存收藏数据到本地存储
  const saveFavorites = () => {
    if (process.client) {
      try {
        localStorage.setItem(favoritesKey, JSON.stringify(favorites.value))
      } catch (error) {
        // console.error('保存收藏数据失败:', error)
      }
    }
  }

  // 保存订单数据到本地存储（只保存新增的订单，不包括默认订单）
  const saveOrders = () => {
    if (process.client) {
      try {
        // 保存所有订单
        localStorage.setItem(ordersKey, JSON.stringify(orders.value))
      } catch (error) {
        // console.error('保存订单数据失败:', error)
      }
    }
  }

  // 注：订单的创建和更新应该由后端处理，前端只负责显示

  // 获取订单列表
  const getOrders = () => {
    return orders.value
  }

  // 根据状态获取订单
  const getOrdersByStatus = (status?: string) => {
    if (!status || status === '全部') {
      return orders.value
    }
    
    const statusMap: Record<string, string> = {
      '待支付': 'pending',
      '待发货': 'shipped', 
      '已发货': 'shipped',
      '已完成': 'completed',
      '已过期': 'expired'
    }
    
    const targetStatus = statusMap[status] || status
    return orders.value.filter(order => order.status === targetStatus)
  }

  // 清空订单列表
  const clearOrders = () => {
    orders.value = []
    saveOrders()
  }

  // 获取收藏列表
  const getFavorites = () => {
    return favorites.value
  }

  // 清空收藏列表
  const clearFavorites = () => {
    favorites.value = []
    saveFavorites()
  }

  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      if (!token.value) {
        // console.log('❌ 无token，跳过用户信息获取')
        return
      }
      
      // console.log('🔄 开始获取用户信息，token:', token.value.substring(0, 20) + '...')
      // ✅ 真实API调用（已启用）
      const response = await authApi.getUserInfo()
      if (response.success) {
        user.value = response.data
        // console.log('✅ 用户信息获取成功:', user.value)
      } else {
        // console.log('❌ 用户信息获取失败:', response)
      }
    } catch (error: any) {
      // console.error('获取用户信息失败:', error)
      // 只有在明确的401错误时才清除token
      if (error.response?.status === 401) {
        // 清除无效token
        token.value = null
        tokenCookie.value = null
        user.value = null
        if (process.client) {
          localStorage.removeItem('token')
        }
      }
    }
  }

  // 用户登录
  const login = async (params: LoginParams) => {
    try {
      // ✅ 真实API调用（已启用）
      const response = await authApi.login(params)
      if (response.success) {
        // 保存token
        token.value = response.data.token
        tokenCookie.value = response.data.token
        // 获取用户信息
        user.value = response.data.user // 不覆盖 balance
        // 加载该用户的收藏数据
        loadFavorites()
        // 加载该用户的订单数据
        loadOrders()
        // 新增：加载该用户的购物车数据
        const cartStore = useCartStore()
        await cartStore.initCart()
        return { success: true, data: response.data }
      }
      return { success: false, message: response.msg }
    } catch (error: any) {
      return { success: false, message: error.message || '登录失败' }
    }
  }

  // 用户注册 - 后端API暂未实现，使用本地模拟
  const register = async (params: {
    username: string
    password: string
    email: string
    confirmPassword: string
    code?: string
  }) => {
    try {
      // TODO: 待后端实现注册功能
      // const response = await authApi.register(params)
      // if (response.success) {
      //   return { success: true, data: response.data }
      // }
      // return { success: false, message: response.msg }
      
      // 🎨 前端UI设计阶段 - 临时模拟注册成功（已注释，用于检查页面功能）
      /*
      // console.warn('注册功能暂未实现，使用模拟返回')
      return { success: true, data: { message: '注册功能开发中' } }
      */
      
      // ✅ 真实API调用（已启用）- 使用邮箱验证码注册接口
      const response = await authApi.loginWithCode({
        email: params.email,
        code: params.code || ''
      })
      if (response.success) {
        return { success: true, data: response.data }
      }
      return { success: false, message: response.msg }
    } catch (error: any) {
      return { success: false, message: error.message || '注册失败' }
    }
  }

  // 用户登出
  const logout = async () => {
    try {
      if (token.value) {
        await authApi.logout()
      }
    } catch (error) {
      // console.error('登出失败:', error)
    } finally {
      // 清除本地状态
      token.value = null
      tokenCookie.value = null
      user.value = null
      // 清空收藏数据
      favorites.value = []
      // 清空订单数据
      orders.value = []
      // 清理localStorage
      if (process.client) {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
  }

  // 修改密码 - 后端API暂未实现
  const changePassword = async (params: {
    oldPassword: string
    newPassword: string
    confirmPassword: string
  }) => {
    try {
      // TODO: 待后端实现修改密码功能
      // const response = await authApi.changePassword(params)
      // if (response.success) {
      //   return { success: true }
      // }
      // return { success: false, message: response.msg }
      
      // 🎨 前端UI设计阶段 - 临时模拟修改成功（已注释，用于检查页面功能）
      /*
      // console.warn('修改密码功能暂未实现，使用模拟返回')
      return { success: true }
      */
      
      // ✅ 真实API调用（已启用）- 暂时使用模拟返回
      // console.warn('修改密码功能暂未实现，使用模拟返回')
      return { success: true }
    } catch (error: any) {
      return { success: false, message: error.message || '修改密码失败' }
    }
  }

  // 发送邮箱验证码
  const sendEmailCode = async (email: string) => {
    try {
      console.log('📧 [发送验证码] 开始发送验证码到:', email)
      const response = await authApi.getEmailCode(email)
      console.log('📧 [发送验证码] API响应:', response)
      return { success: response.success, message: response.msg }
    } catch (error: any) {
      console.error('📧 [发送验证码] 错误:', error)
      const errorMessage = error.message || '发送验证码失败'
      console.error('📧 [发送验证码] 最终错误信息:', errorMessage)
      return { success: false, message: errorMessage }
    }
  }

  // 重置密码 - 后端API暂未实现
  const resetPassword = async (params: {
    email: string
    code: string
    newPassword: string
    confirmPassword: string
  }) => {
    try {
      // TODO: 待后端实现重置密码功能
      // const response = await authApi.resetPassword(params)
      // if (response.success) {
      //   return { success: true }
      // }
      // return { success: false, message: response.msg }
      
      // 🎨 前端UI设计阶段 - 临时模拟重置成功（已注释，用于检查页面功能）
      /*
      console.warn('重置密码功能暂未实现，使用模拟返回')
        return { success: true }
      */
      
      // ✅ 真实API调用（已启用）- 暂时使用模拟返回
      // console.warn('重置密码功能暂未实现，使用模拟返回')
      return { success: true }
    } catch (error: any) {
      return { success: false, message: error.message || '重置密码失败' }
    }
  }

  // 初始化时获取用户信息
  const init = async () => {
    // console.log('🚀 [UserStore.init] 开始初始化')
    // 只在客户端执行
    if (!process.client) {
      // console.log('⏭️ [UserStore.init] 服务端环境，跳过')
      return Promise.resolve()
    }
    
    // 先尝试从localStorage恢复用户信息
    try {
      const storedUser = localStorage.getItem('user')
      const storedToken = localStorage.getItem('token')
      
      // 移除调试日志
      
      // 打印存储的用户信息
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          // 移除调试日志
        } catch (e) {
          // 移除调试日志
        }
      }
      
      // 同步token：localStorage、内存和cookie保持一致
      if (storedToken) {
        // console.log('🔄 [UserStore.init] 从localStorage恢复token')
        token.value = storedToken
        tokenCookie.value = storedToken
      } else if (tokenCookie.value) {
        // 移除调试日志
        token.value = tokenCookie.value
        localStorage.setItem('token', tokenCookie.value)
      }
      
      // 恢复用户信息
      if (storedUser && !user.value) {
        try {
          user.value = JSON.parse(storedUser)
        } catch (e) {
          localStorage.removeItem('user')
        }
      }
    } catch (error) {
      // 移除调试日志
    }
    
    // 获取最终的token值
    const finalToken = token.value
    // 移除调试日志
    
    // 如果有token但没有用户信息，尝试从API获取
    if (finalToken && !user.value) {
      // 移除调试日志
      // 解析token看看内容
      try {
        const tokenParts = finalToken.split('.')
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]))
          // 移除调试日志
        }
      } catch (e) {
        // 移除调试日志
      }
      
      try {
        const res = await http.get('/auth/me')
        // 移除调试日志
        if (res.code === 0 && res.data) {
          user.value = res.data
          localStorage.setItem('user', JSON.stringify(res.data))
          // 移除调试日志
        } else {
          // 移除调试日志
        }
      } catch (error: any) {
        // 移除调试日志
        // 如果是401错误，说明token无效，需要清除
        if (error.message && error.message.includes('401')) {
          // 移除调试日志
          token.value = null
          tokenCookie.value = null
          user.value = null
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
    }
    
    // 加载其他数据 - 只在确认登录成功后加载
    if (user.value && user.value.id && finalToken) {
      // 移除调试日志
      // 延迟200ms确保所有状态都已经更新
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // 使用Promise.allSettled，即使某个请求失败也不影响其他
      const results = await Promise.allSettled([
        loadFavorites().catch(() => { /* 静默处理 */ }),
        loadOrders().catch(() => { /* 静默处理 */ }),
        (async () => {
          const cartStore = useCartStore()
          await cartStore.initCart()
        })().catch(() => { /* 静默处理 */ })
      ])
      
      // 可选：检查结果但不显示错误
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const names = ['收藏', '订单', '购物车']
          // 移除调试日志
        }
      })
    } else {
      // 移除调试日志
    }
    
    // 移除调试日志
  }

  // 新增：直接设置用户信息和token
  const setUser = (userInfo: any, tokenValue?: string) => {
    user.value = userInfo
    if (tokenValue) {
      token.value = tokenValue
      tokenCookie.value = tokenValue
    }
  }


  // 辅助函数：根据订单状态获取文本和类名
  const getStatusText = (status: OrderItem['status']) => {
    switch (status) {
      case 'pending':
        return '待支付'
      case 'shipped':
        return '已发货'
      case 'completed':
        return '已完成'
      case 'expired':
        return '已过期'
      case 'cancelled':
        return '已取消'
      default:
        return '未知状态'
    }
  }

  const getStatusClass = (status: OrderItem['status']) => {
    switch (status) {
      case 'pending':
        return 'pending'
      case 'shipped':
        return 'shipped'
      case 'completed':
        return 'completed'
      case 'expired':
        return 'expired'
      case 'cancelled':
        return 'cancelled'
      default:
        return 'expired'
    }
  }

  return {
    // 状态
    user,  // 移除 readonly，允许修改
    token, // 导出 token
    isLoggedIn,
    favorites: readonly(favorites),
    orders: readonly(orders),
    
    // 方法
    login,
    register,
    logout,
    changePassword,
    sendEmailCode,
    resetPassword,
    fetchUserInfo,
    init,
    setUser,
    
    // 收藏相关方法
    addToFavorites,
    removeFromFavorites,
    checkIsFavorite,
    checkIsFavoriteFromAPI,
    getFavorites,
    clearFavorites,
    loadFavorites,
    
    // 订单相关方法
    getOrders,
    getOrdersByStatus,
    clearOrders,
    loadOrders
  }
}) 