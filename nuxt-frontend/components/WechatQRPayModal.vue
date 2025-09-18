<template>
  <div class="qr-pay-modal" v-if="visible">
    <div class="modal-overlay" @click="$emit('close')"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>微信扫码支付</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="qr-container">
          <canvas ref="qrCanvas"></canvas>
          <div v-if="loading" class="loading">生成二维码中...</div>
        </div>
        <div class="pay-info">
          <p class="amount">支付金额：<span>￥{{ amount }}</span></p>
          <p class="tips">请使用微信扫描二维码完成支付</p>
          <div v-if="checking" class="status-checking">
            <span class="checking-icon">⏳</span>
            <span>正在检查支付状态...</span>
          </div>
        </div>
        <div class="pay-steps">
          <div class="step">
            <span class="step-num">1</span>
            <span>打开微信</span>
          </div>
          <div class="step">
            <span class="step-num">2</span>
            <span>扫描二维码</span>
          </div>
          <div class="step">
            <span class="step-num">3</span>
            <span>确认支付</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue'
import QRCode from 'qrcode'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  codeUrl: {
    type: String,
    default: ''
  },
  amount: {
    type: [String, Number],
    default: 0
  },
  orderId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'success'])

const qrCanvas = ref(null)
const loading = ref(false)
const checking = ref(false)

// 生成二维码
const generateQR = async (url) => {
  if (!url || !qrCanvas.value) return
  
  loading.value = true
  try {
    await QRCode.toCanvas(qrCanvas.value, url, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
  } catch (err) {
    console.error('生成二维码失败:', err)
  } finally {
    loading.value = false
  }
}

// 监听codeUrl变化
watch(() => props.codeUrl, async (newUrl) => {
  if (newUrl && props.visible) {
    await nextTick()
    generateQR(newUrl)
  }
})

// 监听visible变化
watch(() => props.visible, async (newVal) => {
  if (newVal && props.codeUrl) {
    await nextTick()
    generateQR(props.codeUrl)
  }
})

// 轮询检查支付状态
let checkTimer = null
const startCheckStatus = () => {
  if (checkTimer) return
  
  console.log('🔄 开始轮询微信支付状态，订单号:', props.orderId)
  
  checkTimer = setInterval(async () => {
    checking.value = true
    try {
      // 调用微信支付查询接口
      const response = await $fetch(`/api/wechat/pay/query/${props.orderId}`, {
        method: 'GET',
        // 添加超时设置
        timeout: 5000
      })
      
      console.log('📊 查询支付状态响应:', response)
      
      // 检查订单是否已支付
      if (response && response.code === 0 && response.data) {
        const paymentData = response.data
        
        // 微信支付API v3返回的数据结构
        if (paymentData.data && paymentData.data.trade_state === 'SUCCESS') {
          console.log('✅ 微信支付成功！')
          console.log('📝 交易详情:', {
            订单号: paymentData.data.out_trade_no,
            微信交易号: paymentData.data.transaction_id,
            支付时间: paymentData.data.success_time,
            支付金额: paymentData.data.amount?.total / 100 + '元'
          })
          emit('success')
          stopCheckStatus()
        } else if (paymentData.trade_state === 'SUCCESS') {
          // 兼容直接返回的格式
          console.log('✅ 微信支付成功！')
          emit('success')
          stopCheckStatus()
        } else if (paymentData.data?.trade_state) {
          console.log('⏳ 支付状态:', paymentData.data.trade_state)
        }
      }
    } catch (error) {
      // 只在非404错误时打印错误信息（404表示订单不存在是正常的）
      if (error.status !== 404) {
        console.error('检查微信支付状态失败:', error)
      }
      // 如果是网络错误或服务器错误，不中断轮询
      // 只有在组件关闭时才停止轮询
    } finally {
      checking.value = false
    }
  }, 3000) // 每3秒检查一次
}

const stopCheckStatus = () => {
  if (checkTimer) {
    clearInterval(checkTimer)
    checkTimer = null
  }
}

// 组件挂载时开始轮询
watch(() => props.visible, (newVal) => {
  if (newVal) {
    startCheckStatus()
  } else {
    stopCheckStatus()
  }
})

// 组件卸载时清理定时器
onUnmounted(() => {
  stopCheckStatus()
})
</script>

<style scoped>
.qr-pay-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 0;
  width: 420px;
  max-width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 30px 24px;
}

.qr-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  margin-bottom: 20px;
}

.loading {
  position: absolute;
  color: #07c160;
  font-size: 14px;
}

.pay-info {
  text-align: center;
  margin-bottom: 30px;
}

.amount {
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
}

.amount span {
  color: #ff6600;
  font-size: 24px;
  font-weight: bold;
}

.tips {
  color: #666;
  font-size: 14px;
}

.pay-steps {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
  border-top: 1px solid #f0f0f0;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-num {
  width: 24px;
  height: 24px;
  background: #07c160;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.step span:last-child {
  font-size: 12px;
  color: #666;
}

.status-checking {
  margin-top: 15px;
  padding: 10px;
  background: #f0f9ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  animation: pulse 2s infinite;
}

.checking-icon {
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}
</style>