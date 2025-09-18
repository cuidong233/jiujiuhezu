<template>
  <div class="modal-mask">
    <div class="wallet-recharge-modal">
      <div class="modal-header">
        <div class="modal-title">充值</div>
        <div class="modal-subtitle">为您的余额充值吧！</div>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      <div class="modal-content">
        <div class="section-label">充值</div>
        <div class="amount-options">
          <div v-for="(item, idx) in options" :key="item.value" :class="['amount-option', {active: selectedIdx===idx}]" @click="selectOption(idx)">
            <div class="amount-main">¥{{ item.value }}</div>
          </div>
          <div :class="['amount-option', 'custom-option', {active: selectedIdx===-1}]" @click="selectOption(-1)"><span>自定义</span></div>
        </div>
        <div class="custom-amount-row" v-if="selectedIdx === -1">
          <input v-model.number="inputValue" type="number" min="1" placeholder="请输入充值金额" />
        </div>
        <div class="section-label pay-label">选择支付方式</div>
        <div class="pay-methods">
          <div :class="['pay-method', payType==='alipay' ? 'active' : '']" @click="payType='alipay'">
            <div class="pay-method-content">
              <img class="pay-icon" src="/images/zhifu2.png" alt="支付宝" />
              <span>支付宝</span>
            </div>
          </div>
          <div :class="['pay-method', payType==='wechat' ? 'active' : '']" @click="payType='wechat'">
            <div class="pay-method-content">
              <img class="pay-icon" src="/images/weixin.png" alt="微信支付" />
              <span>微信支付</span>
            </div>
          </div>
          <div :class="['pay-method', payType==='binance' ? 'active' : '']" @click="selectBinancePay">
            <div class="pay-method-content">
              <span style="font-size: 24px; margin-right: 12px;">₮</span>
              <span>USDT充值</span>
            </div>
          </div>
        </div>
        
        <!-- 币安汇率显示 -->
        <div v-if="payType === 'binance'" class="binance-rate-info">
          <div class="rate-header">
            <span class="rate-title">实时汇率</span>
            <button class="rate-refresh" @click="fetchExchangeRate" :disabled="rateLoading">
              {{ rateLoading ? '刷新中...' : '刷新' }}
            </button>
          </div>
          <div class="rate-content">
            <div class="rate-item">
              <span class="rate-label">USDT/CNY：</span>
              <span class="rate-value">¥{{ exchangeRate.sell }}</span>
            </div>
            <div class="rate-item">
              <span class="rate-label">充值金额：</span>
              <span class="rate-value">{{ usdtAmount }} USDT</span>
            </div>
            <div class="rate-source">数据来源：{{ exchangeRate.source }}</div>
          </div>
        </div>
        <button class="btn-confirm" @click="handleRecharge">立即充值</button>
      </div>
      <div class="modal-bottom-blank"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { http } from '@/utils/request'

const emits = defineEmits(['close'])
const options = [
  { value: 50 },
  { value: 100 },
  { value: 200 },
  { value: 500 },
]
const selectedIdx = ref(0)
const inputValue = ref<number | null>(null)
const payType = ref('alipay')
const rateLoading = ref(false)

// 币安汇率数据
const exchangeRate = ref({
  buy: 7.35,
  sell: 7.25,
  mid: 7.30,
  spread: 0.10,
  source: 'Binance P2P'
})

// 计算USDT金额
const usdtAmount = computed(() => {
  const amount = selectedIdx.value >= 0 ? options[selectedIdx.value].value : (inputValue.value || 0)
  return (amount / exchangeRate.value.sell).toFixed(2)
})

// 获取币安汇率
async function fetchExchangeRate() {
  rateLoading.value = true
  try {
    const res = await http.get('/binance/rate/usdt-cny')
    if (res && res.data) {
      exchangeRate.value = res.data
    }
  } catch (error) {
    console.error('获取汇率失败:', error)
  } finally {
    rateLoading.value = false
  }
}

// 选择币安支付
function selectBinancePay() {
  payType.value = 'binance'
  // 首次选择时自动获取汇率
  if (!exchangeRate.value.timestamp) {
    fetchExchangeRate()
  }
}

function selectOption(idx:number) {
  selectedIdx.value = idx
  if(idx!==-1) inputValue.value = null
}

async function handleRecharge() {
  const amount = selectedIdx.value >= 0 ? options[selectedIdx.value].value : inputValue.value
  
  if (!amount || amount <= 0) {
    alert('请选择或输入充值金额')
    return
  }

  try {
    if (payType.value === 'binance') {
      // 币安支付
      const res = await http.post('/binance/pay/create', {
        orderNo: 'ORD' + Date.now(),
        amount: amount,
        currency: 'USDT',
        description: '钱包充值'
      })
      
      if (res && res.data) {
        // 跳转到币安支付页面
        window.open(res.data, '_blank')
      }
    } else if (payType.value === 'wechat') {
      // 微信支付
      const res = await http.post('/wechat/pay/create', {
        orderNo: 'WALLET_' + Date.now(), // 生成充值订单号
        amount: Number(amount),
        description: '钱包充值',
        payType: 'native' // 使用扫码支付
      })
      
      if (res && res.data) {
        // 跳转到微信支付页面
        window.location.href = res.data
      }
    } else {
      // 支付宝支付
      const res = await http.post('/payment/alipay/create', {
        amount: amount,
        description: '钱包充值'
      })
      
      if (res && res.data) {
        window.location.href = res.data
      }
    }
    
    emits('close')
  } catch (error) {
    console.error('充值失败:', error)
    alert('充值失败，请稍后重试')
  }
}

// 组件挂载时获取汇率
onMounted(() => {
  fetchExchangeRate()
})
</script>
<style scoped>
.modal-mask {
  position: fixed;
  z-index: 2000;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}
.wallet-recharge-modal {
  width: 820px;
  background: #fff;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(33,150,243,0.12);
  display: flex;
  flex-direction: column;
}
.modal-header {
  background: linear-gradient(135deg, #2196F3 0%, #2575FC 100%);
  padding: 32px 32px 18px 32px;
  position: relative;
  text-align: center;
}
.modal-title {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}
.modal-subtitle {
  color: #e3f0ff;
  font-size: 16px;
  margin-bottom: 0;
}
.modal-close {
  position: absolute;
  top: 18px;
  right: 24px;
  background: none;
  border: none;
  font-size: 28px;
  color: #fff;
  cursor: pointer;
  line-height: 1;
  padding: 0 4px;
  border-radius: 4px;
  transition: background 0.2s;
}
.modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 32px 0 32px;
  gap: 18px;
}
.section-label {
  font-size: 20px;
  color: #222;
  font-weight: 700;
  margin-bottom: 18px;
  align-self: flex-start;
}
.amount-options {
  display: flex;
  gap: 18px;
  width: 100%;
  justify-content: flex-start;
  margin-bottom: 8px;
}
.amount-option {
  background: #fff;
  border: 2px solid #2196F3;
  border-radius: 18px;
  padding: 16px 28px;
  min-width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  font-size: 20px;
  font-weight: 700;
  color: #222;
  transition: border 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(33,150,243,0.04);
  justify-content: center;
}
.amount-option.active {
  background: #f0f7ff;
  border-color: #2575FC;
  color: #2575FC;
}
.custom-amount-row {
  width: 100%;
  margin-bottom: 8px;
}
.custom-amount-row input {
  width: 100%;
  border: none;
  border-radius: 22px;
  background: #f8f9fa;
  font-size: 18px;
  padding: 16px 18px;
  color: #222;
  outline: none;
  box-shadow: 0 1px 4px rgba(33,150,243,0.04);
}
.pay-label {
  margin-top: 18px;
  margin-bottom: 8px;
}
.pay-methods {
  width: 100%;
  display: flex;
  gap: 18px;
  margin-bottom: 18px;
  justify-content: flex-start;
  flex-wrap: wrap;
}
.pay-method {
  width: 200px;
  height: 56px;
  background: #fff;
  border: 2px solid #2196F3;
  border-radius: 14px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 17px;
  font-weight: 700;
  color: #222;
  transition: border 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(33,150,243,0.04);
  position: relative;
}
.pay-method-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.pay-method.active {
  background: #f0f7ff;
  border-color: #2575FC;
  color: #2575FC;
}
.pay-icon {
  width: 28px;
  height: 28px;
  margin-right: 12px;
  margin-left: 6px;
  flex-shrink: 0;
}
.pay-method span {
  flex: none;
  text-align: center;
  display: block;
  font-size: 17px;
}
.btn-confirm {
  width: 60%;
  background: linear-gradient(90deg, #2196F3 0%, #2575FC 100%);
  color: #fff;
  border: none;
  border-radius: 22px;
  padding: 0;
  height: 44px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  margin: -8px auto 0 auto;
  box-shadow: 0 2px 8px rgba(33,150,243,0.10);
  transition: background 0.2s;
  display: block;
}
.btn-confirm:disabled {
  background: #b3c6e6;
  cursor: not-allowed;
}
.custom-option {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  min-width: 100px;
}
.custom-option span {
  width: 100%;
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-bottom-blank {
  width: 100%;
  height: 48px;
  background: #fff;
  border-bottom-left-radius: 32px;
  border-bottom-right-radius: 32px;
}

/* 币安汇率信息样式 */
.binance-rate-info {
  width: 100%;
  background: #f0f7ff;
  border: 2px solid #2196F3;
  border-radius: 14px;
  padding: 16px;
  margin: 10px 0;
}

.rate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.rate-title {
  font-size: 16px;
  font-weight: 600;
  color: #222;
}

.rate-refresh {
  background: #2196F3;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.rate-refresh:hover {
  background: #1976D2;
}

.rate-refresh:disabled {
  background: #b3c6e6;
  cursor: not-allowed;
}

.rate-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rate-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.rate-label {
  color: #666;
}

.rate-value {
  font-weight: 600;
  color: #2196F3;
}

.rate-source {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
  text-align: right;
}
</style> 