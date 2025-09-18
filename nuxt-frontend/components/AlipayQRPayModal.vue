<template>
  <div class="qr-pay-modal" v-if="visible">
    <div class="modal-overlay" @click="$emit('close')"></div>
    <div class="modal-content">
      <div class="modal-header">
        <div class="header-title">
          <div class="alipay-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#1677ff"/>
            </svg>
          </div>
          <h3>支付宝扫码支付</h3>
        </div>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="qr-container">
          <div class="qr-wrapper">
            <canvas ref="qrCanvas"></canvas>
            <div v-if="loading" class="loading">
              <div class="loading-spinner"></div>
              <span>生成二维码中...</span>
            </div>
          </div>
        </div>
        <div class="pay-info">
          <p class="amount">支付金额：<span>￥{{ amount }}</span></p>
          <p class="order-info">订单号：{{ orderId }}</p>
          <p class="tips">请使用支付宝扫描二维码完成支付</p>
        </div>
        <div class="pay-steps">
          <div class="step">
            <span class="step-num">1</span>
            <span>打开支付宝</span>
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
        <div class="security-tip">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#1677ff">
            <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8S12.4 0 8 0zm1 12H7V7h2v5zm0-6H7V4h2v2z"/>
          </svg>
          <span>支付宝安全保障，请放心支付</span>
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
  payUrl: {
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

// 生成二维码
const generateQR = async (url) => {
  if (!url || !qrCanvas.value) return
  
  loading.value = true
  try {
    let qrData = url
    
    // 处理不同格式的数据
    if (url.startsWith('data:image')) {
      // 如果是base64图片数据，不能直接用作二维码
      console.error('收到图片数据而非支付链接，无法生成二维码')
      throw new Error('数据格式错误')
    }
    
    // 支付宝二维码内容通常以 https://qr.alipay.com 开头
    // 或者是完整的支付链接
    console.log('生成支付宝二维码，内容:', qrData)
    
    await QRCode.toCanvas(qrCanvas.value, qrData, {
      width: 220,
      margin: 2,
      color: {
        dark: '#1677ff',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    })
    
    console.log('✅ 支付宝二维码生成成功')
  } catch (err) {
    console.error('生成支付宝二维码失败:', err)
    // 如果二维码生成失败，显示错误信息
    if (qrCanvas.value) {
      const ctx = qrCanvas.value.getContext('2d')
      ctx.clearRect(0, 0, qrCanvas.value.width, qrCanvas.value.height)
      qrCanvas.value.width = 220
      qrCanvas.value.height = 220
      ctx.fillStyle = '#f5f5f5'
      ctx.fillRect(0, 0, 220, 220)
      ctx.fillStyle = '#999'
      ctx.font = '14px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('二维码生成失败', 110, 100)
      ctx.fillText('请刷新重试', 110, 120)
    }
  } finally {
    loading.value = false
  }
}

// 监听payUrl变化
watch(() => props.payUrl, async (newUrl) => {
  if (newUrl && props.visible) {
    await nextTick()
    generateQR(newUrl)
  }
})

// 监听visible变化
watch(() => props.visible, async (newVal) => {
  if (newVal && props.payUrl) {
    await nextTick()
    generateQR(props.payUrl)
  }
})

// 轮询检查支付状态
let checkTimer = null
const startCheckStatus = () => {
  if (checkTimer) return
  
  checkTimer = setInterval(async () => {
    try {
      // 调用后端接口检查订单状态 - 使用正确的订单号参数
      const response = await $fetch(`/api/order/${props.orderId}`, {
        method: 'GET'
      })
      
      // 检查订单是否已支付
      if (response && response.data) {
        const order = response.data
        // 检查多种可能的支付状态字段
        if (order.payment_status === 'paid' || 
            order.status === 'paid' || 
            order.paymentStatus === 1 ||
            order.paymentStatus === '1') {
          console.log('✅ 支付宝支付成功，订单已支付')
          emit('success')
          stopCheckStatus()
        }
      }
    } catch (error) {
      console.error('检查支付宝支付状态失败:', error)
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
  width: 450px;
  max-width: 90%;
  box-shadow: 0 12px 48px rgba(22, 119, 255, 0.15);
  border: 1px solid rgba(22, 119, 255, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f4ff;
  background: linear-gradient(135deg, #f8fbff 0%, #f0f7ff 100%);
  border-radius: 12px 12px 0 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.alipay-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
  border-radius: 8px;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1677ff;
  font-weight: 600;
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
  background: rgba(22, 119, 255, 0.1);
  color: #1677ff;
}

.modal-body {
  padding: 30px 24px;
}

.qr-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
}

.qr-wrapper {
  position: relative;
  padding: 20px;
  background: linear-gradient(135deg, #fafcff 0%, #f0f7ff 100%);
  border-radius: 12px;
  border: 2px dashed #d6e7ff;
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #1677ff;
  font-size: 14px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e6f4ff;
  border-top: 3px solid #1677ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.pay-info {
  text-align: center;
  margin-bottom: 30px;
}

.amount {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
}

.amount span {
  color: #1677ff;
  font-size: 24px;
  font-weight: bold;
}

.order-info {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.tips {
  color: #666;
  font-size: 14px;
}

.pay-steps {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
  border-top: 1px solid #f0f4ff;
  border-bottom: 1px solid #f0f4ff;
  margin-bottom: 20px;
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
  background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.step span:last-child {
  font-size: 12px;
  color: #666;
}

.security-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(22, 119, 255, 0.05);
  border-radius: 8px;
  font-size: 13px;
  color: #1677ff;
}

.security-tip svg {
  flex-shrink: 0;
}
</style>