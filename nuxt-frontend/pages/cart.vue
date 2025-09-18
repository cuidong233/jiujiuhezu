<template>
  <div class="cart-page">
    <AppHeader />
    <div class="cart-main-bg">
      <div class="cart-container">
        <!-- 左侧商品列表 -->
        <div class="cart-list-section">
          <h2 class="cart-title">购物车</h2>
          <table class="cart-table">
            <thead>
              <tr>
                <th>选择</th>
                <th>商品信息</th>
                <th>单价</th>
                <th>数量</th>
                <th>小计</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in cartItems" :key="item.id">
                <td><input type="checkbox" v-model="selectedIds" :value="item.id" /></td>
                <td class="cart-goods-info">
                  <img :src="item.image" class="cart-goods-img" />
                  <div class="cart-goods-meta">
                    <div class="cart-goods-name">{{ item.name }}</div>
                    <div class="cart-goods-spec" v-if="item.skuName">规格：{{ item.skuName }}</div>
                  </div>
                </td>
                <td class="cart-price">￥{{ (item.price || 0).toFixed(2) }}</td>
                <td class="cart-qty">
                  <button @click="updateQty(item, item.quantity-1)">-</button>
                  <span>{{ item.quantity }}</span>
                  <button @click="updateQty(item, item.quantity+1)">+</button>
                </td>
                <td class="cart-subtotal">￥{{ (item.price * item.quantity).toFixed(2) }}</td>
                <td><button class="cart-remove" @click="removeItem(item)">删除</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- 右侧结算区 -->
        <div class="cart-summary-section">
          <div class="summary-title">订单结算</div>
          <div class="summary-row">
            <span>商品总额</span>
            <span>￥{{ totalPrice.toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span>优惠折扣</span>
            <span class="discount">-￥{{ discount.toFixed(2) }}</span>
          </div>
          <div class="summary-row line">
            <span>运费</span>
            <span>￥0.00</span>
          </div>
          <div class="summary-row total">
            <span>应付总额</span>
            <span class="total-price">￥{{ (totalPrice - discount).toFixed(2) }}</span>
          </div>
          <button class="checkout-btn" @click="handleCheckout">去结算 ({{ cartItems.length }})</button>
          <div class="cart-tips">
            <div>
              <div class="tips-title">优惠提示</div>
              <div class="tips-content">
                满￥200减￥20｜满￥500减￥50｜满￥1000减￥120<br/>
                满￥200减￥20｜满￥500减￥50｜满￥1000减￥120 再购￥8094.00 可享受满￥9000减￥500优惠
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { cartApi } from '@/api/common'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'

const router = useRouter()
const userStore = useUserStore()
const userId = computed(() => userStore.user?.id || 1)
const cartItems = ref<any[]>([])
const selectedIds = ref<number[]>([])

const fetchCart = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再查看购物车')
    router.push('/')
    return
  }
  const res = await cartApi.getCartList()
  if (res && res.data && res.data.list) {
    cartItems.value = res.data.list
  }
}
onMounted(fetchCart)

const totalPrice = computed(() => {
  if (!cartItems.value || !Array.isArray(cartItems.value) || cartItems.value.length === 0) return 0
  return cartItems.value.reduce((sum, i) => {
    if (!i || typeof i.price !== 'number' || typeof i.quantity !== 'number') return sum
    return sum + i.price * i.quantity
  }, 0)
})

const discount = computed(() => {
  if (totalPrice.value >= 1000) return 120
  if (totalPrice.value >= 500) return 50
  if (totalPrice.value >= 200) return 20
  return 0
})

const updateQty = async (item: any, qty: number) => {
  if (qty < 1) return
  await cartApi.updateCart(item.id, qty)
  fetchCart()
}
const removeItem = async (item: any) => {
  await cartApi.removeFromCart(item.id)
  fetchCart()
}

const handleCheckout = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再结算')
    return
  }
  if (cartItems.value.length === 0) {
    ElMessage.warning('购物车是空的')
    return
  }
  router.push('/checkout')
}
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7fbff;
}
.cart-main-bg {
  max-width: 1320px;
  width: 100%;
  margin: 48px auto 32px auto;
  border-radius: 32px;
  box-shadow: 0 8px 32px rgba(35,92,220,0.10);
  background: linear-gradient(120deg, #EEF8FB 0%, #F6F3F0 50%, #FBEFEA 100%);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 48px 0 32px 0;
}
.cart-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  gap: 32px;
  align-items: flex-start;
  background: transparent;
  border-radius: 32px;
  box-shadow: none;
  padding: 0;
}
.cart-list-section {
  flex: 2;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(35,92,220,0.08);
  padding: 32px 24px;
}
.cart-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
}
.cart-table {
  width: 100%;
  border-collapse: collapse;
}
.cart-table th, .cart-table td {
  padding: 12px 8px;
  text-align: center;
}
.cart-goods-info {
  display: flex;
  align-items: center;
  gap: 16px;
}
.cart-goods-img {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  object-fit: cover;
  background: #f0f0f0;
  box-shadow: 0 2px 8px rgba(35,92,220,0.06);
}
.cart-goods-meta {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
}
.cart-goods-name {
  font-size: 18px;
  font-weight: 600;
  color: #222;
  margin-bottom: 2px;
}
.cart-goods-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 2px;
}
.cart-goods-spec {
  font-size: 14px;
  color: #888;
}
.cart-price, .cart-subtotal {
  color: #e74c3c;
  font-weight: 600;
}
.cart-qty button {
  width: 28px;
  height: 28px;
  border: none;
  background: #f0f0f0;
  border-radius: 6px;
  font-size: 18px;
  cursor: pointer;
  margin: 0 4px;
}
.cart-remove {
  background: #ff4757;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}
.cart-remove:hover {
  background: #e74c3c;
}
.cart-summary-section {
  flex: 1;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(35,92,220,0.08);
  padding: 28px 24px;
  min-width: 320px;
}
.summary-title {
  font-family: 'Noto Sans SC', Noto Sans SC;
  font-weight: 900;
  font-size: 24px;
  color: #333333;
  line-height: 27px;
  text-align: left;
  font-style: normal;
  text-transform: none;
  margin-bottom: 20px;
  position: relative;
}
.summary-title::after {
  content: '';
  display: block;
  width: 360px;
  height: 2px;
  background: #F0F0F0;
  border-radius: 1px;
  margin-top: 16px;
  margin-bottom: 24px;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Noto Sans SC', Noto Sans SC;
  font-weight: 400;
  font-size: 16px;
  color: #666666;
  line-height: 17px;
  text-align: left;
  font-style: normal;
  text-transform: none;
  margin-bottom: 18px;
}
.summary-row.line {
  position: relative;
  margin-bottom: 32px;
}
.summary-row.line::after {
  content: '';
  display: block;
  width: 360px;
  height: 2px;
  background: #F0F0F0;
  border-radius: 1px;
  margin-top: 16px;
  position: absolute;
  left: 0;
  bottom: -18px;
}
.summary-row.total {
  font-size: 20px;
  font-weight: 700;
  color: #e74c3c;
  margin-top: 32px;
  margin-bottom: 24px;
}
.discount {
  color: #27ae60;
}
.total-price {
  color: #e74c3c;
  font-weight: 700;
}
.checkout-btn {
  width: 100%;
  background: linear-gradient(90deg, #4C7AE0 0%, #235CDC 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 14px 0;
  font-size: 18px;
  font-weight: 600;
  margin: 18px 0 28px 0;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 6px 24px 0 rgba(250, 173, 20, 0.10);
}
.checkout-btn:hover {
  background: linear-gradient(90deg, #235CDC 0%, #4C7AE0 100%);
}
.cart-tips {
  background: #fffbe6;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 14px;
  color: #b26a00;
  margin-top: 24px;
  display: flex;
  align-items: flex-start;
  position: relative;
}
.cart-tips::before {
  content: '';
  display: block;
  width: 6px;
  height: 90%;
  background: #FAAD14;
  border-radius: 4px;
  position: absolute;
  left: 0;
  top: 5%;
}
.tips-title {
  font-family: 'Noto Sans SC', Noto Sans SC;
  font-weight: 400;
  font-size: 16px;
  color: #FAAD14;
  line-height: 17px;
  text-align: left;
  font-style: normal;
  text-transform: none;
  margin-bottom: 4px;
  margin-left: 12px;
}
.tips-content {
  line-height: 1.6;
  margin-left: 12px;
}
.cart-preview-row {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
}
.cart-preview-card {
  background: #f7fbff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(35,92,220,0.06);
  padding: 16px 18px 10px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 180px;
}
.cart-preview-img {
  width: 120px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
  background: #eaeaea;
}
.cart-preview-desc {
  font-size: 15px;
  color: #666;
  text-align: center;
}
</style> 