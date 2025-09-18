<template>
  <div class="exchange-section">
    <div class="section-header">
      <h2 class="section-title">兑换中心</h2>
    </div>
    <div class="exchange-container">
      <div class="exchange-title-area">
        <h3 class="exchange-title">兑换优惠券</h3>
      </div>
      <div class="exchange-input-area">
        <div class="input-wrapper">
          <input type="text" class="exchange-input" placeholder="请输入兑换码" v-model="redeemCode" />
          <button class="exchange-btn" @click="redeem">立即兑换</button>
        </div>
        <p class="exchange-tips">兑换码通常由16位字母和数字组成，区分大小写</p>
      </div>
    </div>
    <div class="coupon-tabs">
      <div class="tab-item active" @click="activeTab = 'all'">全部优惠券</div>
      <div class="tab-item" @click="activeTab = 'unused'">未使用</div>
      <div class="tab-item" @click="activeTab = 'used'">已使用</div>
      <div class="tab-item" @click="activeTab = 'expired'">已过期</div>
    </div>
    <div class="coupon-list">
      <div v-for="coupon in filteredCoupons" :key="coupon.id" class="coupon-card" :class="{ 'available': !coupon.isUsed, 'expired': new Date(coupon.expireTime) < new Date() }">
        <div class="coupon-header">
          <div class="coupon-amount">¥{{ coupon.amount }}</div>
          <div class="coupon-info">
            <div class="coupon-type">{{ coupon.name }}</div>
            <div class="coupon-condition">满¥{{ coupon.minOrderAmount }}可用</div>
          </div>
        </div>
        <div class="coupon-body">
          <div class="coupon-desc">{{ coupon.description }}</div>
        </div>
        <div class="coupon-footer">
          <div class="coupon-expiry">
            <span class="expiry-label">有效期：</span>
            <span class="expiry-date">{{ new Date(coupon.expireTime).toISOString().slice(0, 10) }}</span>
          </div>
          <button class="coupon-action use-btn" @click="goToGoods" v-if="!coupon.isUsed && new Date(coupon.expireTime) >= new Date()">去使用</button>
          <button class="coupon-action expired-btn" v-else-if="new Date(coupon.expireTime) < new Date()">已过期</button>
          <button class="coupon-action use-btn" @click="goToGoods" v-else>已使用</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { nextTick } from 'vue'
import { http } from '@/utils/request'

const userStore = useUserStore()
const router = useRouter()

const couponList = ref<any[]>([])
const redeemCode = ref('')
const activeTab = ref('all')

const fetchCoupons = async () => {
  const res = await http.get('/coupon/my/exchange')
  if (res && res.data) couponList.value = res.data
}
onMounted(fetchCoupons)

const redeem = async () => {
  if (!redeemCode.value) return
  await http.post('/coupon/redeem', { code: redeemCode.value })
  redeemCode.value = ''
  fetchCoupons()
}

const filteredCoupons = () => {
  if (activeTab.value === 'all') return couponList.value
  if (activeTab.value === 'used') return couponList.value.filter(c => c.isUsed)
  if (activeTab.value === 'expired') return couponList.value.filter(c => new Date(c.expireTime) < new Date())
  return couponList.value.filter(c => !c.isUsed && new Date(c.expireTime) >= new Date())
}

const goToGoods = async () => {
  await router.push('/')
  await nextTick()
  setTimeout(() => {
    const goodsSection = document.querySelector('.goods-section')
    if (goodsSection) {
      goodsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, 100)
}
</script>
<style scoped>
.exchange-section { padding: 0; height: 100%; }
.exchange-container { border: 1px solid #e9ecef; border-radius: 20px; overflow: hidden; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); }
.exchange-title-area { background: linear-gradient(135deg, #FFE9D8 0%, #C0F4FF 100%); padding: 30px; border-radius: 0; margin-bottom: 0; }
.exchange-title { font-size: 20px; font-weight: 600; color: #333; margin: 0; }
.exchange-input-area { background: white; padding: 30px; border-radius: 0; margin-bottom: 0; }
.input-wrapper { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; }
.exchange-input { flex: 1; padding: 14px 20px; border: 1px solid #e0e0e0; border-radius: 25px; font-size: 14px; background: #f8f9fa; color: #333; outline: none; transition: all 0.3s ease; }
.exchange-input:focus { border-color: #4A90E2; background: white; }
.exchange-input::placeholder { color: #999; }
.exchange-btn { background: #4A90E2; color: white; border: none; padding: 14px 28px; border-radius: 25px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s ease; white-space: nowrap; }
.exchange-btn:hover { background: #357ABD; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3); }
.exchange-tips { font-size: 13px; color: #666; margin: 0; }
.coupon-tabs { display: flex; gap: 30px; margin-bottom: 25px; border-bottom: 1px solid #e9ecef; padding-bottom: 15px; }
.coupon-tabs .tab-item { padding: 8px 0; color: #999; cursor: pointer; transition: all 0.3s ease; font-size: 16px; position: relative; }
.coupon-tabs .tab-item.active { color: #4A90E2; font-weight: 500; }
.coupon-tabs .tab-item.active::after { content: ''; position: absolute; bottom: -16px; left: 0; width: 100%; height: 3px; background: #4A90E2; border-radius: 2px; }
.coupon-list { display: flex; gap: 20px; flex-wrap: wrap; justify-content: space-between; }
.coupon-card { width: 320px; background: white; border-radius: 16px; border: 2px solid #4A90E2; overflow: hidden; transition: all 0.3s ease; cursor: pointer; display: flex; flex-direction: column; }
.coupon-card.expired { border-color: #e9ecef; background: #f8f9fa; }
.coupon-card:hover { box-shadow: 0 4px 15px rgba(74, 144, 226, 0.2); transform: translateY(-2px); }
.coupon-card.expired:hover { box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); }
.coupon-header { background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%); padding: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
.coupon-card.expired .coupon-header { background: #f1f3f4; }
.coupon-amount { font-size: 36px; font-weight: bold; color: #4A90E2; line-height: 1; }
.coupon-card.expired .coupon-amount { color: #999; }
.coupon-info { text-align: right; display: flex; flex-direction: column; gap: 4px; }
.coupon-type { font-size: 16px; font-weight: 600; color: #333; }
.coupon-card.expired .coupon-type { color: #999; }
.coupon-condition { font-size: 12px; color: #666; font-weight: 400; }
.coupon-card.expired .coupon-condition { color: #999; }
.coupon-body { padding: 20px; flex: 1; }
.coupon-desc { font-size: 13px; color: #666; line-height: 1.4; }
.coupon-card.expired .coupon-desc { color: #999; }
.coupon-footer { padding: 20px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f0f0f0; }
.coupon-expiry { display: flex; align-items: center; gap: 4px; font-size: 13px; }
.expiry-label { color: #999; }
.expiry-date { color: #333; font-weight: 500; }
.coupon-card.expired .expiry-label, .coupon-card.expired .expiry-date { color: #dc3545; }
.coupon-action { padding: 10px 24px; border: none; border-radius: 20px; font-size: 14px; cursor: pointer; transition: all 0.3s ease; white-space: nowrap; font-weight: 500; }
.coupon-action.use-btn { background: #4A90E2; color: white; }
.coupon-action.use-btn:hover { background: #357ABD; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3); }
.coupon-action.expired-btn { background: #e9ecef; color: #999; cursor: not-allowed; }
.coupon-action.expired-btn:hover { background: #e9ecef; color: #999; transform: none; }
</style> 