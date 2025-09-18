<template>
  <div class="modal-mask">
    <div class="order-pay-modal">
      <div class="modal-header">
        <div class="modal-title">订单支付</div>
        <div class="modal-subtitle">请选择支付方式完成付款</div>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      <div class="modal-content">
        <div class="order-info-bar">
          <img class="shop-logo" :src="shopLogo" alt="logo" />
          <div class="shop-info">
            <div class="shop-name">{{ shopName }}</div>
            <div class="shop-desc">{{ shopDesc }}</div>
            <div class="order-id">订单号：#{{ orderId }}</div>
          </div>
          <div class="order-amount">￥{{ price }}</div>
        </div>
        <div class="pay-section">
          <div class="pay-title">选择支付方式</div>
          <div class="pay-methods">
            <div :class="['pay-method', payType==='wechat' ? 'active' : '']" @click="payType='wechat'">
              <img class="pay-icon" src="/images/weixin.png" alt="微信支付" />
              <div class="pay-label">微信支付</div>
              <div class="pay-desc">推荐微信用户使用</div>
              <div v-if="payType==='wechat'" class="pay-checked"></div>
            </div>
            <div :class="['pay-method', payType==='alipay' ? 'active' : '']" @click="payType='alipay'">
              <img class="pay-icon" src="/images/zhifu2.png" alt="支付宝" />
              <div class="pay-label">支付宝支付</div>
              <div class="pay-desc">推荐已安装支付宝的用户使用</div>
              <div v-if="payType==='alipay'" class="pay-checked"></div>
            </div>
            <div :class="['pay-method', payType==='binance' ? 'active' : '']" @click="payType='binance'">
              <img class="pay-icon" src="/images/zhifu3.png" alt="币安支付" />
              <div class="pay-label">币安支付</div>
              <div class="pay-desc">支持USDT等加密货币支付</div>
              <div v-if="payType==='binance'" class="pay-checked"></div>
            </div>
          </div>
        </div>
        <div class="pay-bottom">
          <button class="btn-pay" @click="handlePay" :disabled="paying">
            <span v-if="!paying">确认支付￥{{ price }}</span>
            <span v-else>支付中...</span>
          </button>
          <div class="pay-countdown">
            支付剩余时间：<span class="countdown">{{ countdownText }}</span>
          </div>
          <div class="pay-tip">
            点击支付即表示您已同意 <a href="#" class="pay-link">《支付服务协议》</a>
          </div>
        </div>
      </div>
    </div>
    <PaySuccessModal
      v-if="showSuccessModal"
      :orderId="props.orderId || 'DEFAULT_ORDER'"
      :payType="payType"
      :amount="props.price || 0"
      @close="handleSuccessClose"
    />
    <WechatQRPayModal
      :visible="showQRModal"
      :codeUrl="wechatCodeUrl"
      :amount="props.price"
      :orderId="props.orderId"
      @close="showQRModal = false"
      @success="handleWechatPaySuccess"
    />
    <AlipayQRPayModal
      :visible="showAlipayQRModal"
      :payUrl="alipayCodeUrl"
      :amount="props.price"
      :orderId="props.orderId"
      @close="showAlipayQRModal = false"
      @success="handleAlipayPaySuccess"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import PaySuccessModal from './PaySuccessModal.vue'
import WechatQRPayModal from './WechatQRPayModal.vue'
import AlipayQRPayModal from './AlipayQRPayModal.vue'
import { useUserStore } from '@/stores/user'
import { paymentApi } from '@/api/payment' // 引入支付API

const props = defineProps({
  shopLogo: { type: String, default: '/images/shop-logo.png' },
  shopName: { type: String, default: '某旗舰店' },
  shopDesc: { type: String, default: '' },
  orderId: { type: String, default: '' },
  price: { type: [String, Number], default: '' },
  countdown: { type: Number, default: 900 }, // 秒
})

const emits = defineEmits(['close','timeout','paySuccess'])

const userStore = useUserStore()
const payType = ref('wechat') // wechat | alipay | binance
const remain = ref(props.countdown)
const showSuccessModal = ref(false)
const paying = ref(false) // 支付中状态
const showQRModal = ref(false) // 显示二维码弹窗
const wechatCodeUrl = ref('') // 微信支付二维码链接
const showAlipayQRModal = ref(false) // 显示支付宝二维码弹窗
const alipayCodeUrl = ref('') // 支付宝支付二维码链接

const countdownText = computed(() => {
  const m = String(Math.floor(remain.value/60)).padStart(2,'0')
  const s = String(remain.value%60).padStart(2,'0')
  return `${m}:${s}`
})

let timer: any = null

onMounted(() => {
  timer = setInterval(() => {
    if(remain.value>0) remain.value--
    else {
      clearInterval(timer)
      // emit取消事件
      emits('timeout')
    }
  }, 1000)
})

onUnmounted(() => { 
  timer && clearInterval(timer) 
})

async function handlePay() {
  if (paying.value) return // 防止重复点击
  
  paying.value = true
  console.log('🚀 开始支付流程')
  console.log('💳 支付方式:', payType.value)
  console.log('💰 支付金额:', props.price)
  console.log('📝 订单ID:', props.orderId)
  
  try {
    if(payType.value === 'wechat') {
      console.log('💚 调用微信支付...')
      
      // ✅ 真实API调用 - 微信支付
      const response = await paymentApi.getPaymentUrl({
        orderId: props.orderId,
        payType: '2',  // 后端微信支付类型为2
        amount: props.price
      })
      
      console.log('微信支付响应:', response)
      
      if (response.success && response.data) {
        // 检查返回的数据
        if (response.data.codeUrl) {
          // Native支付返回二维码链接
          console.log('📱 显示微信支付二维码:', response.data.codeUrl)
          wechatCodeUrl.value = response.data.codeUrl
          showQRModal.value = true
          paying.value = false
          return
        } else if (response.data.payUrl) {
          // H5支付返回支付链接
          console.log('🌐 跳转到微信H5支付')
          window.location.href = response.data.payUrl
          return
        } else {
          throw new Error('支付响应格式错误')
        }
      } else {
        throw new Error(response.msg || '获取微信支付链接失败')
      }
      
    } else if(payType.value === 'alipay') {
      console.log('💙 调用支付宝支付...')
      console.log('📝 请求参数:', {
        orderId: props.orderId,
        payType: '4',
        amount: props.price
      })
      
      // ✅ 真实API调用（已启用）
      const response = await paymentApi.getPaymentUrl({
        orderId: props.orderId,
        payType: '4',  // 后端支付宝类型为4
        amount: props.price
      })
      
      console.log('📥 支付宝API响应:', response)
      console.log('📥 response.data 类型:', typeof response.data)
      console.log('📥 response.data 内容:', response.data)
      
      if (response.success && response.data) {
        // 检查响应数据类型
        if (typeof response.data === 'string') {
          // 直接使用返回的字符串作为二维码内容
          console.log('📱 获取到支付链接，显示二维码弹窗:', response.data)
          alipayCodeUrl.value = response.data
          showAlipayQRModal.value = true
          paying.value = false
          return
        } else if (typeof response.data === 'object') {
          // 如果返回的是对象，按优先级提取数据
          console.log('📦 响应数据是对象，尝试提取URL')
          
          // 优先使用qrCode字段（预创建订单返回的二维码内容）
          if (response.data.qrCode) {
            console.log('📱 获取到二维码内容:', response.data.qrCode)
            alipayCodeUrl.value = response.data.qrCode
            showAlipayQRModal.value = true
            paying.value = false
            return
          } 
          // 其次使用payUrl字段（网页支付链接，也可以生成二维码）
          else if (response.data.payUrl) {
            console.log('📱 获取到支付链接，生成二维码:', response.data.payUrl)
            alipayCodeUrl.value = response.data.payUrl
            showAlipayQRModal.value = true
            paying.value = false
            return
          }
          // 兼容其他可能的字段名
          else if (response.data.codeUrl) {
            console.log('📱 获取到codeUrl:', response.data.codeUrl)
            alipayCodeUrl.value = response.data.codeUrl
            showAlipayQRModal.value = true
            paying.value = false
            return
          } 
          else if (response.data.url) {
            console.log('📱 获取到url:', response.data.url)
            alipayCodeUrl.value = response.data.url
            showAlipayQRModal.value = true
            paying.value = false
            return
          } 
          else {
            console.error('❌ 响应对象中没有找到支付链接:', response.data)
            throw new Error('响应中未找到支付链接')
          }
        } else {
          console.error('❌ 未知的响应数据类型:', typeof response.data)
          throw new Error('响应数据格式错误')
        }
      } else {
        console.error('❌ API响应失败:', response)
        throw new Error(response.msg || '获取支付链接失败')
      }
      
    } else if(payType.value === 'binance') {
      console.log('💰 使用币安支付...')
      
      // 调用币安支付接口
      const response = await paymentApi.getPaymentUrl({
        orderId: props.orderId,
        payType: '3',  // 币安支付类型为3
        amount: props.price
      })
      
      if (response.success && response.data) {
        // 跳转到币安支付页面
        window.location.href = response.data
        return
      } else {
        throw new Error(response.msg || '获取币安支付链接失败')
      }
    } else {
      console.log('🔧 不支持的支付方式')
      throw new Error('请选择支付方式')
    }
    
    console.log('🎉 支付完成，准备显示成功弹窗...')
    
    // 确保支付状态先重置
    paying.value = false
    
    // 立即显示成功弹窗
    console.log('📱 设置showSuccessModal为true')
    showSuccessModal.value = true
    console.log('📱 showSuccessModal当前值:', showSuccessModal.value)
    
    // 触发支付成功事件
    const paymentInfo = {
      orderId: props.orderId || 'DEFAULT_ORDER',
      payType: payType.value,
      amount: props.price || 0
    }
    console.log('📤 触发支付成功事件:', paymentInfo)
    emits('paySuccess', paymentInfo)
    
    // 等待一下再检查弹窗状态
    setTimeout(() => {
      console.log('⏰ 1秒后检查弹窗状态:', showSuccessModal.value)
    }, 1000)
    
  } catch (error: any) {
    console.error('❌ 支付失败:', error)
    console.error('❌ 错误详情:', {
      message: error.message,
      response: error.response,
      stack: error.stack
    })
    
    // 显示具体错误信息
    const errorMessage = error.response?.data?.msg || 
                        error.response?.data?.message || 
                        error.response?.data?.errors?.[0]?.msg ||
                        error.message || 
                        '支付失败，请重试'
    alert(errorMessage)
    paying.value = false
  }
}

// 🎨 前端UI设计阶段 - 模拟支付过程（已注释，用于检查页面功能）
/*
const simulatePayment = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('💳 模拟支付处理中...')
      resolve(true)
    }, 2000)
  })
}
*/

function handleBalanceClose() {
  showBalanceModal.value = false
}

function handleSuccessClose() {
  showSuccessModal.value = false
  emits('close')
}

function handleWechatPaySuccess() {
  showQRModal.value = false
  showSuccessModal.value = true
  emits('paySuccess', {
    orderId: props.orderId,
    payType: 'wechat',
    amount: props.price
  })
}

function handleAlipayPaySuccess() {
  showAlipayQRModal.value = false
  showSuccessModal.value = true
  emits('paySuccess', {
    orderId: props.orderId,
    payType: 'alipay',
    amount: props.price
  })
}
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
.order-pay-modal {
  width: 420px;
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
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
.order-info-bar {
  display: flex;
  align-items: center;
  padding: 18px 24px 18px 24px;
  border-bottom: 1px solid #e3eaf2;
  background: #fff;
}
.shop-logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 16px;
  border: 1.5px dashed #b3c6e6;
  background: #fff;
}
.shop-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.shop-name {
  font-size: 18px;
  font-weight: 900;
  color: #222;
}
.shop-desc {
  font-size: 14px;
  color: #888;
}
.order-id {
  font-size: 13px;
  color: #b3b3b3;
  margin-top: 2px;
}
.order-amount {
  font-size: 26px;
  color: #ff4d4f;
  font-weight: 900;
  margin-left: 12px;
}
.pay-section {
  padding: 18px 24px 0 24px;
}
.pay-title {
  font-size: 18px;
  font-weight: 900;
  color: #222;
  margin-bottom: 12px;
}
.pay-methods {
  display: flex;
  gap: 18px;
  margin-bottom: 18px;
}
.pay-method {
  flex: 1;
  background: #f8fbff;
  border: 2px solid #e3eaf2;
  border-radius: 16px;
  padding: 18px 0 12px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  position: relative;
  transition: border 0.2s, box-shadow 0.2s;
}
.pay-method.active {
  border-color: #2196F3;
  box-shadow: 0 2px 8px rgba(33,150,243,0.10);
}
.pay-icon {
  width: 38px;
  height: 38px;
  margin-bottom: 8px;
}
.pay-label {
  font-size: 17px;
  font-weight: 700;
  color: #222;
  margin-bottom: 2px;
}
.pay-desc {
  font-size: 13px;
  color: #b3b3b3;
}
.pay-checked {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: #2196F3;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pay-checked::after {
  content: '';
  display: block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
}
.pay-title-other {
  margin-top: 18px;
  margin-bottom: 10px;
}
.pay-others {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.pay-other-item {
  display: flex;
  align-items: center;
  background: #f8fbff;
  border-radius: 12px;
  padding: 10px 16px;
  margin-bottom: 0;
}
.pay-other-icon {
  width: 32px;
  height: 32px;
  margin-right: 12px;
}
.pay-other-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.pay-other-label {
  font-size: 15px;
  color: #222;
  font-weight: 600;
}
.pay-other-desc {
  color: #b3b3b3;
  font-size: 13px;
}
.pay-bottom {
  padding: 24px 24px 18px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.btn-pay {
  width: 100%;
  background: linear-gradient(90deg, #2196F3 0%, #2575FC 100%);
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 16px 0;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 6px;
  box-shadow: 0 2px 8px rgba(33,150,243,0.10);
  transition: background 0.2s;
}
.btn-pay:disabled {
  background: #b3c6e6;
  cursor: not-allowed;
}
.pay-countdown {
  color: #ff4d4f;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 2px;
}
.countdown {
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 1px;
}
.pay-tip {
  color: #888;
  font-size: 13px;
  margin-top: 2px;
}
.pay-link {
  color: #2196F3;
  text-decoration: underline;
}
.pay-other-item.active {
  border: 2px solid #2196F3;
  background: #f0f7ff;
}
.pay-other-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: #2196F3;
  cursor: pointer;
}
</style> 