<template>
  <div class="checkout-page">
    <AppHeader />
    <div class="checkout-content">
      <div class="checkout-container">
        <!-- 左侧订单信息 -->
        <div class="order-info">
          <div class="order-card">
            <div class="order-header">
              <img src="https://via.placeholder.com/64x64?text=N" class="order-logo" />
              <div class="order-header-main">
                <div class="order-title-row">
                  <span class="brand">NETFLIX</span>
                  <span class="price-tag">￥29/月</span>
                </div>
                <div class="order-meta">
                  <span>商品属性：Netflix一个月</span>
                  <span>订单号：1471461548159010</span>
                </div>
              </div>
            </div>
            <div class="order-divider"></div>
            <div class="section-title">核对您的套餐</div>
            <div class="plan-main">
              <div class="plan-box">
                <div class="plan-title">月付套餐</div>
                <div class="plan-features">
                  <div>基础清晰度（720p）</div>
                  <div>无广告体验</div>
                  <div>1台设备同时观看</div>
                  <div>每月自动续订</div>
                </div>
              </div>
              <div class="plan-options">
                <div class="option-group">
                  <div class="option-title">地区选择</div>
                  <div class="option-list">
                    <label><input type="checkbox" /> 美国（内容最全）</label>
                    <label><input type="checkbox" /> 英国（更新最快）</label>
                    <label><input type="checkbox" /> 日本（动漫最多）</label>
                  </div>
                </div>
                <div class="option-group">
                  <div class="option-title">清晰度选择</div>
                  <div class="option-list">
                    <label><input type="checkbox" /> 高清（1080p）</label>
                    <label><input type="checkbox" /> 超高清（4K）</label>
                  </div>
                </div>
              </div>
            </div>
            <div class="section-title" style="margin-top:32px;">Disney+ 年度订阅</div>
            <div class="disney-section">
              <img src="https://via.placeholder.com/100x100?text=Disney+" class="disney-img" />
              <div class="disney-info">
                <div class="disney-price-row">
                  <span class="disney-title">￥180</span>
                  <span class="disney-discount">立减￥10</span>
                </div>
                <div class="disney-desc">海量迪士尼、皮克斯、漫威、星球大战和国家地理内容</div>
                <button class="disney-btn">加购</button>
              </div>
            </div>
          </div>
        </div>
        <!-- 右侧价格明细 -->
        <div class="order-summary">
          <div class="summary-card">
            <div class="summary-title">价格明细</div>
            <div class="summary-list">
              <div class="summary-row"><span>Netflix 月付</span><span>￥29</span></div>
              <div class="summary-row"><span>Netflix 月付加购</span><span>￥29</span></div>
              <div class="summary-row"><span>Disney+ 年度订阅</span><span>￥0</span></div>
              <div class="summary-row"><span>折扣</span><span class="discount">-￥0</span></div>
              <div class="summary-row total"><span>合计</span><span class="total-price">￥58</span></div>
            </div>
            <div class="coupon-row">
              <input class="coupon-input" placeholder="点击输入优惠码" />
              <button class="coupon-btn">应用</button>
            </div>
            <div class="coupon-tip">输入优惠码可享受额外折扣</div>
            <div class="pay-methods">
              <div class="pay-method" :class="{selected: payMethod==='balance'}" @click="payMethod='balance'">
                <span class="pay-icon">🎫</span> 余额支付 <span v-if="payMethod==='balance'" class="check">✔</span>
              </div>
              <div class="pay-method" :class="{selected: payMethod==='alipay'}" @click="payMethod='alipay'">
                <span class="pay-icon">💳</span> 支付宝支付 <span v-if="payMethod==='alipay'" class="check">✔</span>
              </div>
            </div>
            <div class="privacy-tip">隐私政策/用户协议遵照政策</div>
            <div class="summary-actions">
              <button class="gift-btn">购买后赠送AI体验卡（价值￥99）</button>
              <button class="pay-btn" @click="handlePay">{{ payMethod==='balance' ? '余额支付' : '支付宝支付' }}</button>
              <div class="pay-tip">*点击支付即表示您同意我们的服务协议和隐私政策</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <AppFooter />
    <BalanceNotEnoughModal
      v-if="showBalanceModal"
      :balance="userStore.user?.balance ?? 0"
      :needAmount="needAmount"
      @close="showBalanceModal = false"
    />
    <PaySuccessModal v-if="showPaySuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import BalanceNotEnoughModal from '@/components/BalanceNotEnoughModal.vue'
import PaySuccessModal from '@/components/PaySuccessModal.vue'
import { cartApi, commonApi } from '@/api/common'
import { orderApi } from '@/api/order'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const showBalanceModal = ref(false)
const showPaySuccess = ref(false)
const needAmount = ref(0)
const payMethod = ref<'balance' | 'alipay'>('balance')
const cartItems = ref<any[]>([])
const addressList = ref<any[]>([])
const couponList = ref<any[]>([])
const selectedCoupon = ref<any>(null)

const fetchCheckoutData = async () => {
  // 检查登录状态
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再结算')
    router.push('/')
    return
  }
  // 获取购物车结算商品
  const cartRes = await cartApi.getCartList(userStore.user?.id || 1)
  if (cartRes && cartRes.data) cartItems.value = cartRes.data
  // 获取用户地址（如有接口）
  // const addrRes = await commonApi.getAddressList(userStore.user?.id || 1)
  // if (addrRes && addrRes.data) addressList.value = addrRes.data
  // 获取可用优惠券（如有接口）
  // const couponRes = await commonApi.getCouponList(userStore.user?.id || 1)
  // if (couponRes && couponRes.data) couponList.value = couponRes.data
}
onMounted(fetchCheckoutData)

const totalPrice = computed(() => cartItems.value.reduce((sum, i) => sum + (i.price * i.quantity), 0))
const discount = computed(() => selectedCoupon.value ? selectedCoupon.value.amount : 0)
const finalAmount = computed(() => totalPrice.value - discount.value)

function handlePay() {
  if (payMethod.value === 'balance') {
    const balance = userStore.user?.balance ?? 0
    if (balance < finalAmount.value) {
      showBalanceModal.value = true
      return
    }
    // 提交订单API
    orderApi.createOrder({ items: cartItems.value, payType: 'balance', couponId: selectedCoupon.value?.id }).then(() => {
      showPaySuccess.value = true
    })
  } else {
    // 支付宝支付逻辑，提交订单API
    orderApi.createOrder({ items: cartItems.value, payType: 'alipay', couponId: selectedCoupon.value?.id }).then(() => {
      showPaySuccess.value = true
    })
  }
}
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7fbff;
}
.checkout-content {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 600px;
  padding: 40px 0 32px 0;
}
.checkout-container {
  display: flex;
  gap: 40px;
  width: 1100px;
  max-width: 100vw;
  align-items: stretch;
}
.order-info {
  flex: 2;
  display: flex;
  flex-direction: column;
}
.order-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(35,92,220,0.08);
  padding: 32px 32px 36px 32px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.order-header {
  display: flex;
  align-items: flex-start;
  gap: 18px;
}
.order-logo {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  object-fit: cover;
  background: #f0f0f0;
  margin-top: 2px;
}
.order-header-main {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 4px;
}
.order-title-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
.brand {
  font-size: 32px;
  font-weight: 900;
  color: #e50914;
  letter-spacing: 2px;
}
.price-tag {
  background: #2979ff;
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  border-radius: 20px;
  padding: 2px 20px;
  margin-left: 8px;
}
.order-meta {
  font-family: 'Noto Sans SC', 'Noto Sans SC', sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: #000;
  line-height: 42px;
  text-align: left;
  font-style: normal;
  text-transform: none;
  margin-top: 2px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.order-divider {
  border-bottom: 2px solid #e5e5e5;
  margin: 18px 0 18px 0;
}
.section-title {
  font-size: 22px;
  font-weight: 900;
  margin: 18px 0 18px 0;
  color: #222;
}
.plan-main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.plan-box {
  background: #eaf3ff;
  border: 2px solid #2979ff;
  border-radius: 16px;
  padding: 22px 28px 18px 28px;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.plan-title {
  font-family: 'Noto Sans SC', 'Noto Sans SC', sans-serif;
  font-weight: 900;
  font-size: 20px;
  color: #636363;
  line-height: 22px;
  margin-bottom: 10px;
}
.plan-features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 24px;
  font-size: 16px;
  color: #444;
}
.plan-options {
  display: flex;
  gap: 24px;
  margin-top: 0;
}
.option-group {
  flex: 1;
  background: #eaf3ff;
  border: 2px solid #2979ff;
  border-radius: 16px;
  padding: 18px 22px 12px 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.option-title {
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 10px;
}
.option-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 15px;
}
.disney-section {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  margin-top: 12px;
}
.disney-img {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  object-fit: cover;
  background: #e0e0e0;
}
.disney-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 2px;
}
.disney-price-row {
  display: flex;
  align-items: center;
  gap: 14px;
}
.disney-title {
  font-family: 'Noto Sans SC', 'Noto Sans SC', sans-serif;
  font-weight: 900;
  color: #000;
  line-height: 28px;
  text-align: left;
  font-style: normal;
  text-transform: none;
}
.disney-discount {
  background: #ffecb3;
  color: #e67c22;
  font-size: 15px;
  border-radius: 8px;
  padding: 2px 10px;
  margin-left: 8px;
  font-weight: 700;
}
.disney-desc {
  font-size: 15px;
  color: #666;
  margin: 2px 0 2px 0;
}
.disney-btn {
  background: #ff9800;
  color: #fff;
  border: none;
  border-radius: 16px;
  padding: 6px 22px;
  font-size: 16px;
  font-weight: 700;
  margin-top: 4px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(255,152,0,0.08);
}
.order-summary {
  flex: 1.1;
  display: flex;
  flex-direction: column;
}
.summary-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(35,92,220,0.08);
  padding: 32px 28px 24px 28px;
  height: 100%;
  display: flex;
  flex-direction: column;
  /* min-width: 340px; 移除宽度限制以便自适应高度 */
}
.summary-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 18px;
  color: #222;
}
.summary-list {
  margin-bottom: 18px;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  margin-bottom: 8px;
}
.summary-row span:first-child {
  font-family: 'Noto Sans SC', 'Noto Sans SC', sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: #B3B3B3;
  line-height: 15px;
  text-align: left;
  font-style: normal;
  text-transform: none;
}
.summary-row.total {
  font-size: 20px;
  font-weight: 700;
  color: #2979ff;
  margin-top: 10px;
}
.discount {
  color: #e74c3c;
}
.total-price {
  font-family: 'Noto Sans SC', 'Noto Sans SC', sans-serif;
  font-weight: 900;
  color: #000;
  line-height: 28px;
  text-align: left;
  font-style: normal;
  text-transform: none;
  font-size: 28px;
}
.coupon-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
.coupon-input {
  flex: 1;
  border: 1.5px solid #b3d2f7;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 15px;
}
.coupon-btn {
  background: #2979ff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 6px 18px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
.coupon-tip {
  font-size: 13px;
  color: #888;
  margin-bottom: 14px;
}
.pay-methods {
  margin-bottom: 14px;
}
.pay-method {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f7fbff;
  border: 1.5px solid #b3d2f7;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 16px;
  margin-bottom: 8px;
  cursor: pointer;
  position: relative;
}
.pay-method.selected {
  border: 2px solid #2979ff;
  background: #e3f0ff;
  font-weight: 700;
}
.pay-icon {
  font-size: 20px;
}
.check {
  color: #2979ff;
  font-size: 18px;
  margin-left: auto;
}
.privacy-tip {
  font-size: 12px;
  color: #aaa;
  margin-bottom: 12px;
}
.summary-actions {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: stretch;
}
.gift-btn {
  width: 100%;
  background: #ff9800;
  color: #fff;
  border: none;
  border-radius: 16px;
  padding: 14px 0;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 0;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(255,152,0,0.08);
}
.pay-btn {
  width: 100%;
  background: #2979ff;
  color: #fff;
  border: none;
  border-radius: 16px;
  padding: 18px 0;
  font-size: 22px;
  font-weight: 900;
  margin-bottom: 0;
  cursor: pointer;
}
.pay-tip {
  font-size: 13px;
  color: #aaa;
  text-align: center;
  margin-top: 2px;
}
</style> 