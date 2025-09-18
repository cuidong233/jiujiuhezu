<template>
  <div class="wallet-section">
    <div class="section-header">
      <h2 class="section-title">我的钱包</h2>
    </div>
    <div class="balance-card">
      <div class="balance-content">
        <div class="balance-label">可用余额</div>
        <div class="balance-amount">¥ {{ balance.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) ?? '0.00' }}</div>
        <button class="recharge-btn" @click="openRechargeModal">去充值</button>
      </div>
    </div>
    <div class="balance-details">
      <div class="details-header">
        <h3 class="details-title">余额明细</h3>
      </div>
      <div class="transaction-list">
        <div class="transaction-item" v-for="item in transactions" :key="item.id">
          <div class="transaction-info">
            <div class="transaction-title">{{ item.type }}</div>
            <div class="transaction-time">{{ item.created_at }}</div>
          </div>
          <div class="transaction-amount" :class="{ positive: item.amount > 0, negative: item.amount < 0 }">
            {{ item.amount > 0 ? '+' : '' }}{{ (item.amount || 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) }}
          </div>
        </div>
      </div>
    </div>
    <WalletRechargeModal v-if="showRechargeModal" @close="closeRechargeModal" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { http } from '@/utils/request'

const showRechargeModal = ref(false)
const balance = ref(0)
const transactions = ref<any[]>([])

const fetchWallet = async () => {
  try {
    const res = await http.get('/wallet/info')
    if (res && res.data) balance.value = res.data.balance
    const txRes = await http.get('/wallet/transactions')
    if (txRes && txRes.data) transactions.value = txRes.data
  } catch (error) {
    console.error('获取钱包信息失败:', error)
  }
}

const openRechargeModal = () => {
  showRechargeModal.value = true
}

const closeRechargeModal = () => {
  showRechargeModal.value = false
}

onMounted(fetchWallet)
</script>
<style scoped>
.wallet-section { padding: 0; height: 100%; }
.profile-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.profile-container {
  flex: 1;
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 60px;
  justify-content: center;
  align-items: flex-start;
}
.profile-content {
  width: 900px;
  background: linear-gradient(137deg, #EEF8FB 0%, #F6F3F0 45%, #FBEFEA 100%);
  border-radius: 60px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
}
.balance-card { background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%); border-radius: 20px; padding: 40px; margin-bottom: 30px; position: relative; overflow: hidden; }
.balance-card::before { content: ''; position: absolute; top: 0; right: 0; width: 200px; height: 200px; background: rgba(255, 255, 255, 0.1); border-radius: 50%; transform: translate(50%, -50%); }
.balance-content { position: relative; z-index: 2; text-align: center; }
.balance-label { color: white; font-size: 16px; margin-bottom: 10px; opacity: 0.9; }
.balance-amount { color: white; font-size: 48px; font-weight: bold; margin-bottom: 30px; letter-spacing: 2px; }
.recharge-btn { background: white; color: #4A90E2; border: none; padding: 12px 30px; border-radius: 25px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); }
.recharge-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15); }
.balance-details { margin-top: 30px; }
.details-header { margin-bottom: 20px; }
.details-title { font-size: 18px; color: #333; margin: 0; font-weight: 600; display: flex; align-items: center; gap: 8px; }
.details-title::before { content: '⚙'; color: #4A90E2; font-size: 16px; }
.transaction-list { border-radius: 12px; overflow: hidden; }
.transaction-item { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: #f8f9fa; border-bottom: 1px solid #e9ecef; transition: background 0.2s ease; }
.transaction-item:hover { background: #f1f3f4; }
.transaction-item:last-child { border-bottom: none; }
.transaction-info { display: flex; flex-direction: column; gap: 4px; }
.transaction-title { font-size: 16px; color: #333; font-weight: 500; }
.transaction-time { font-size: 13px; color: #999; }
.transaction-amount { font-size: 16px; font-weight: bold; }
.transaction-amount.positive { color: #28a745; }
.transaction-amount.negative { color: #dc3545; }
</style> 