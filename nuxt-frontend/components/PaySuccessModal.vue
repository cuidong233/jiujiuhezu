<template>
  <div class="modal-mask" @click.self="handleClose">
    <!-- 回执单模态框 -->
    <ReceiptModal 
      v-if="showReceiptModal"
      :orderNo="safeOrderId"
      :productName="productName"
      @close="handleReceiptClose"
      @success="handleReceiptSuccess"
    />
    
    <!-- 支付成功模态框 -->
    <div v-else class="pay-success-modal">
      <div class="success-header">
        <div class="success-circle">
          <svg width="80" height="80" viewBox="0 0 96 96" fill="none">
            <circle cx="48" cy="48" r="48" fill="#fff"/>
            <path d="M30 50l14 14 22-28" stroke="#2196F3" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="success-title">支付成功！</div>
        <div class="success-desc">{{ isRechargeService ? '请填写回执信息以完成订单' : '感谢您的购买，订单已处理完成' }}</div>
      </div>
      
      <div class="success-info">
        <div class="info-row">
          <span class="info-label">订单编号</span>
          <span class="info-value info-link">#{{ safeOrderId }}</span>
        </div>
        <div class="info-divider"></div>
        <div class="info-row">
          <span class="info-label">支付金额</span>
          <span class="info-value info-amount">￥{{ safeAmount }}</span>
        </div>
        <div class="info-divider"></div>
        <div class="info-row">
          <span class="info-label">支付方式</span>
          <span class="info-value info-paytype">{{ safePayTypeName }}</span>
        </div>
        <div class="info-divider"></div>
        <div class="info-row">
          <span class="info-label">支付时间</span>
          <span class="info-value info-time">{{ safeTime }}</span>
        </div>
        <div class="info-divider"></div>
        <div class="info-row">
          <span class="info-label">订单状态</span>
          <span class="info-value info-status">已支付，商品信息已发送邮箱</span>
        </div>
      </div>
      
      <div class="success-actions">
        <button v-if="isRechargeService && !receiptFilled" class="order-btn" @click="handleFillReceipt">
          填写回执单
        </button>
        <button v-else class="order-btn" @click="handleGoToOrders">
          前往查看订单
        </button>
        <button class="home-btn" @click="handleGoToHome">
          返回首页
        </button>
      </div>
      
      <div class="success-tip">
        📧 订单详情和商品信息已发送到您的邮箱，请注意查收
        <br>如有任何问题，请联系客服 
        <span class="kefu-phone">400-123-4567</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import ReceiptModal from './ReceiptModal.vue'

// 定义props
const props = defineProps({
  orderId: { 
    type: String, 
    default: 'N/A'
  },
  payType: { 
    type: String, 
    default: 'balance'
  },
  amount: { 
    type: [String, Number], 
    default: 0
  },
  productName: {
    type: String,
    default: ''
  },
  productType: {
    type: String,
    default: ''
  }
})

// 定义events
const emits = defineEmits(['close'])

// 状态管理
const showReceiptModal = ref(false)
const receiptFilled = ref(false)

// 判断是否为代充服务
const isRechargeService = computed(() => {
  // 根据产品类型或名称判断是否为代充服务
  return props.productType === 'recharge' || 
         props.productName?.includes('代充') || 
         props.productName?.includes('充值')
})

onMounted(() => {
  // 如果是代充服务，自动显示回执单
  if (isRechargeService.value && !receiptFilled.value) {
    setTimeout(() => {
      showReceiptModal.value = true
    }, 1500)
  }
})

// 安全的计算属性
const safeOrderId = computed(() => {
  return props.orderId || 'N/A'
})

const safeAmount = computed(() => {
  try {
    const num = typeof props.amount === 'string' ? parseFloat(props.amount || '0') : (props.amount || 0)
    return isNaN(num) ? '0.00' : num.toFixed(2)
  } catch {
    return '0.00'
  }
})

const safePayTypeName = computed(() => {
  const typeMap = {
    'alipay': '支付宝支付',
    'balance': '余额支付',
    'other': '其他支付'
  }
  return typeMap[props.payType as keyof typeof typeMap] || '未知支付方式'
})

const safeTime = computed(() => {
  try {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hour = String(now.getHours()).padStart(2, '0')
    const minute = String(now.getMinutes()).padStart(2, '0')
    const second = String(now.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  } catch {
    return '获取时间失败'
  }
})

// 事件处理
const handleClose = () => {
  if (!showReceiptModal.value) {
    emits('close')
  }
}

const handleGoToHome = () => {
  console.log('点击返回首页')
  emits('close')
  try {
    navigateTo('/')
  } catch (error) {
    console.error('跳转首页失败:', error)
    window.location.href = '/'
  }
}

const handleGoToOrders = () => {
  console.log('点击查看订单')
  emits('close')
  try {
    navigateTo('/profile/orders')
  } catch (error) {
    console.error('跳转订单页失败:', error)
    window.location.href = '/profile/orders'
  }
}

const handleFillReceipt = () => {
  showReceiptModal.value = true
}

const handleReceiptClose = () => {
  showReceiptModal.value = false
}

const handleReceiptSuccess = () => {
  receiptFilled.value = true
  showReceiptModal.value = false
}
</script>
<style scoped>
.modal-mask {
  position: fixed;
  z-index: 3000;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}
.pay-success-modal {
  width: 400px;
  background: #fff;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 6px 24px rgba(33,150,243,0.10);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 24px;
}
.success-header {
  width: 100%;
  background: linear-gradient(120deg, #2196F3 0%, #1976D2 100%);
  border-radius: 22px 22px 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0 18px 0;
}
.success-circle {
  width: 80px;
  height: 80px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  box-shadow: 0 2px 8px rgba(33,150,243,0.10);
}
.success-title {
  font-size: 28px;
  font-weight: 900;
  color: #fff;
  margin-bottom: 8px;
}
.success-desc {
  font-size: 16px;
  color: #e3f2fd;
  margin-bottom: 0;
}
.success-info {
  width: 88%;
  background: #fff;
  border-radius: 12px;
  margin: 24px 0 0 0;
  padding: 0 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  color: #222;
  padding: 14px 0 14px 0;
}
.info-divider {
  width: 100%;
  height: 1px;
  background: #eee;
  margin: 0 0 0 0;
}
.info-label {
  color: #888;
  font-size: 14px;
  font-weight: 500;
}
.info-value {
  color: #222;
  font-size: 15px;
  font-weight: 600;
  text-align: right;
}
.info-link {
  color: #2196F3;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
}
.info-amount {
  color: #e74c3c;
  font-size: 17px;
  font-weight: 900;
}
.info-paytype {
  color: #222;
  font-weight: 600;
  display: flex;
  align-items: center;
}
.info-time {
  color: #222;
  font-weight: 600;
}
.info-status {
  color: #00c853;
  font-weight: 900;
  font-size: 15px;
}
.success-actions {
  width: 88%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 28px 0 0 0;
}
.order-btn {
  width: 100%;
  background: linear-gradient(135deg, #2575FC 0%, #6A11CB 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 900;
  padding: 14px 0;
  cursor: pointer;
  margin-bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(33,150,243,0.08);
}
.home-btn {
  width: 100%;
  background: #fff;
  color: #2196F3;
  border: 2px solid #2196F3;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 900;
  padding: 14px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0;
}
.success-tip {
  width: 88%;
  margin: 24px 0 0 0;
  font-size: 13px;
  color: #888;
  text-align: center;
}
.kefu-link {
  color: #2196F3;
  margin: 0 2px;
  text-decoration: none;
  cursor: pointer;
}
.kefu-phone {
  color: #2196F3;
  font-weight: 700;
}
</style> 