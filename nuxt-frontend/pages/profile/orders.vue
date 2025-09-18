<template>
  <div class="orders-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载订单中...</div>
    </div>

    <!-- Main Content -->
    <div v-else class="orders-section">
      <div class="section-header">
        <h2 class="section-title">我的订单</h2>
        <div class="header-right">
          <NotificationBell />
          <div class="order-stats">
            <div class="stat-item">
              <span class="stat-count">{{ orderStats.total }}</span>
              <span class="stat-label">全部</span>
            </div>
            <div class="stat-item">
              <span class="stat-count">{{ orderStats.shipping }}</span>
              <span class="stat-label">待发货</span>
            </div>
            <div class="stat-item">
              <span class="stat-count">{{ orderStats.delivered }}</span>
              <span class="stat-label">已发货</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <div 
          v-for="tab in filterTabs" 
          :key="tab.key"
          :class="['filter-tab', { active: currentFilter === tab.key }]"
          @click="changeFilter(tab.key)"
        >
          {{ tab.label }}
          <span v-if="tab.count > 0" class="tab-badge">{{ tab.count }}</span>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="displayOrders.length === 0" class="empty-state">
        <div class="empty-icon">📦</div>
        <div class="empty-text">{{ getEmptyText() }}</div>
        <div class="empty-desc">{{ getEmptyDesc() }}</div>
        <button class="go-shopping-btn" @click="goShopping">
          {{ currentFilter === 'all' ? '去购物' : '查看全部订单' }}
        </button>
      </div>

      <!-- Orders List -->
      <div v-else class="orders-list">
        <div 
          v-for="order in displayOrders" 
          :key="order.id" 
          class="order-card"
        >
          <!-- Order Header -->
          <div class="order-header">
            <div class="order-meta">
              <span class="order-number">订单号: {{ order.orderNo || order.id }}</span>
              <span class="order-date">
                <svg class="icon-clock" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                下单时间: {{ formatDate(order.createdAt || order.createTime || order.time) }}
              </span>
            </div>
            <div class="order-status" :class="getOrderStatusClass(order)">
              {{ getOrderStatusText(order) }}
            </div>
          </div>

          <!-- Order Content -->
          <div class="order-content">
            <!-- Product Info -->
            <div class="product-info">
              <div class="product-title">{{ order.goodsName || order.title || order.productName || '商品' }}</div>
              <div class="product-details">
                <div class="detail-row" v-if="order.productType || order.category">
                  <span class="detail-label">商品类型:</span>
                  <span class="detail-value">{{ order.productType || order.category || '虚拟商品' }}</span>
                </div>
                <div class="detail-row" v-if="order.specifications || order.spec">
                  <span class="detail-label">规格:</span>
                  <span class="detail-value">{{ order.specifications || order.spec || '标准版' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">数量:</span>
                  <span class="detail-value">{{ order.quantity || 1 }}</span>
                </div>
                <div class="detail-row" v-if="order.payMethod">
                  <span class="detail-label">支付方式:</span>
                  <span class="detail-value">{{ formatPayMethod(order.payMethod) }}</span>
                </div>
                <div class="detail-row" v-if="order.paidAt || order.payTime">
                  <span class="detail-label">支付时间:</span>
                  <span class="detail-value">{{ formatDate(order.paidAt || order.payTime) }}</span>
                </div>
              </div>
            </div>

            <!-- Price Info -->
            <div class="price-info">
              <div class="total-price">¥{{ formatPrice(order.totalAmount || order.amount) }}</div>
              <div class="unit-price" v-if="order.price">
                单价: ¥{{ formatPrice(order.price) }}
              </div>
            </div>
          </div>

          <!-- Order Actions -->
          <div class="order-actions">
            <!-- 待发货状态：显示取消订单 -->
            <button 
              v-if="canCancelShipping(order)" 
              class="action-btn secondary"
              @click="handleCancel(order)"
            >
              取消订单
            </button>
            
            <!-- 查看回执单按钮（代充商品） -->
            <button 
              v-if="hasReceipts(order)" 
              class="action-btn warning"
              @click="handleViewReceipts(order)"
            >
              查看回执单
            </button>
            
            <!-- 已发货状态：显示查看发货信息 -->
            <button 
              v-if="isDelivered(order) && !hasReceipts(order)" 
              class="action-btn primary"
              @click="handleViewDeliveryInfo(order)"
            >
              查看发货信息
            </button>
            
            <!-- 所有状态都显示查看详情 -->
            <button 
              class="action-btn secondary"
              @click="handleViewDetail(order)"
            >
              查看详情
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPage > 1" class="pagination">
        <button 
          :disabled="pagination.page <= 1" 
          @click="changePage(pagination.page - 1)"
          class="page-btn"
        >
          上一页
        </button>
        
        <div class="page-numbers">
          <button
            v-for="pageNum in getPageNumbers()"
            :key="pageNum"
            :class="['page-number', { active: pageNum === pagination.page }]"
            @click="changePage(pageNum)"
          >
            {{ pageNum }}
          </button>
        </div>
        
        <button 
          :disabled="pagination.page >= pagination.totalPage" 
          @click="changePage(pagination.page + 1)"
          class="page-btn"
        >
          下一页
        </button>
        
        <div class="page-info">
          第 {{ pagination.page }} 页，共 {{ pagination.totalPage }} 页，{{ pagination.total }} 条记录
        </div>
      </div>
    </div>


    <!-- Order Detail Modal -->
    <div v-if="showDetailModal" class="modal-mask" @click.self="closeDetailModal">
      <div class="detail-modal">
        <div class="modal-header">
          <h3 class="modal-title">订单详情</h3>
          <button class="modal-close" @click="closeDetailModal">×</button>
        </div>
        <div class="modal-body" v-if="selectedOrder">
          <div class="detail-section">
            <h4>订单信息</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">订单号:</span>
                <span class="value">{{ selectedOrder.orderNo || selectedOrder.id }}</span>
              </div>
              <div class="detail-item">
                <span class="label">商品名称:</span>
                <span class="value">{{ selectedOrder.goodsName || selectedOrder.title }}</span>
              </div>
              <div class="detail-item">
                <span class="label">订单状态:</span>
                <span class="value status" :class="getOrderStatusClass(selectedOrder)">
                  {{ getOrderStatusText(selectedOrder) }}
                </span>
              </div>
              <div class="detail-item">
                <span class="label">下单时间:</span>
                <span class="value">{{ formatDate(selectedOrder.createdAt || selectedOrder.createTime || selectedOrder.time) }}</span>
              </div>
              <div class="detail-item" v-if="selectedOrder.paidAt || selectedOrder.payTime">
                <span class="label">支付时间:</span>
                <span class="value">{{ formatDate(selectedOrder.paidAt || selectedOrder.payTime) }}</span>
              </div>
              <div class="detail-item" v-if="selectedOrder.payMethod">
                <span class="label">支付方式:</span>
                <span class="value">{{ formatPayMethod(selectedOrder.payMethod) }}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h4>商品信息</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">商品价格:</span>
                <span class="value">¥{{ formatPrice(selectedOrder.price || selectedOrder.amount) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">购买数量:</span>
                <span class="value">{{ selectedOrder.quantity || 1 }}</span>
              </div>
              <div class="detail-item">
                <span class="label">订单总额:</span>
                <span class="value highlight">¥{{ formatPrice(selectedOrder.totalAmount || selectedOrder.amount) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Receipt Modal -->
    <ReceiptModal
      v-if="showReceiptModal"
      :orderNo="selectedOrder?.orderNo || selectedOrder?.id"
      :productName="selectedOrder?.productName || selectedOrder?.goodsName"
      :isViewing="true"
      @close="closeReceiptModal"
      @success="handleReceiptSuccess"
    />

    <!-- Delivery Info Modal -->
    <div v-if="showDeliveryModal" class="modal-mask" @click.self="closeDeliveryModal">
      <div class="delivery-modal">
        <div class="modal-header">
          <h3 class="modal-title">发货信息</h3>
          <button class="modal-close" @click="closeDeliveryModal">×</button>
        </div>
        <div class="modal-body">
          <div v-if="deliveryInfo" class="delivery-content">
            <!-- 订单基本信息 -->
            <div class="info-section">
              <h4>订单信息</h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">订单号:</span>
                  <span class="value">{{ deliveryInfo.order?.orderNo }}</span>
                </div>
                <div class="info-item">
                  <span class="label">商品名称:</span>
                  <span class="value">{{ deliveryInfo.order?.productName }}</span>
                </div>
                <div class="info-item">
                  <span class="label">发货状态:</span>
                  <span class="value status">{{ getDeliveryStatusText(deliveryInfo.order?.deliveryStatus) }}</span>
                </div>
                <div class="info-item" v-if="deliveryInfo.order?.deliveredAt">
                  <span class="label">发货时间:</span>
                  <span class="value">{{ formatDate(deliveryInfo.order?.deliveredAt) }}</span>
                </div>
              </div>
            </div>
            
            <!-- CDK信息 -->
            <div v-if="deliveryInfo.deliveryRecords?.length > 0" class="info-section">
              <h4>CDK信息</h4>
              <div class="cdk-list">
                <div v-for="(record, index) in deliveryInfo.deliveryRecords" :key="index" class="cdk-item">
                  <div class="cdk-header">
                    <span class="cdk-index">#{{ index + 1 }}</span>
                    <span class="cdk-status" :class="record.deliveryStatus === 1 ? 'success' : 'failed'">
                      {{ record.deliveryStatus === 1 ? '发货成功' : '发货失败' }}
                    </span>
                  </div>
                  <div v-if="record.cdkCode" class="cdk-code-wrapper">
                    <input 
                      :value="record.cdkCode" 
                      readonly 
                      class="cdk-code"
                      :ref="`cdkInput${index}`"
                    />
                    <button 
                      class="copy-btn" 
                      @click="copyCDK(record.cdkCode, index)"
                    >
                      {{ copiedIndex === index ? '已复制' : '复制' }}
                    </button>
                  </div>
                  <div v-else-if="record.deliveryContent" class="delivery-text">
                    {{ parseDeliveryContent(record.deliveryContent) }}
                  </div>
                </div>
              </div>
              <div class="cdk-tips">
                <span class="tips-icon">💡</span>
                <span>请妥善保存您的CDK信息，避免泄露给他人</span>
              </div>
            </div>
            
            <!-- 无发货记录 -->
            <div v-else class="empty-delivery">
              <div class="empty-icon">📧</div>
              <div class="empty-text">商品信息已通过邮件发送</div>
              <div class="empty-desc">
                我们已将完整的商品信息和使用说明发送到您的邮箱<br>
                请检查收件箱和垃圾邮件文件夹
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Toast -->
    <div v-if="errorMessage" class="error-toast">
      <div class="toast-content">
        <span class="toast-icon">⚠️</span>
        <span class="toast-text">{{ errorMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { orderApi } from '@/api/order'
import type { Order, PageParams, PageResponse } from '@/types/api'
import { getUserIdentifier } from '@/utils/session'
import ReceiptModal from '@/components/ReceiptModal.vue'

// Define component meta
definePageMeta({
  layout: 'default'
  // 移除 middleware: 'auth'，因为中间件文件不存在
})

const router = useRouter()
const userStore = useUserStore()

// Reactive state
const loading = ref(true)
const errorMessage = ref('')
const orders = ref<any[]>([])
const currentFilter = ref<string>('all')
const showDetailModal = ref(false)
const showDeliveryModal = ref(false)
const showReceiptModal = ref(false)
const selectedOrder = ref<any>(null)
const deliveryInfo = ref<any>(null)
const receiptInfo = ref<any>(null)
const copiedIndex = ref<number>(-1)


// Pagination state
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPage: 0
})

// Filter tabs configuration - 只显示已支付订单的两个状态
const filterTabs = ref([
  { key: 'all', label: '全部', count: 0 },
  { key: 'shipping', label: '待发货', count: 0 },
  { key: 'delivered', label: '已发货', count: 0 }
])

// Computed properties
const displayOrders = computed(() => {
  if (currentFilter.value === 'all') {
    return orders.value
  }
  return orders.value.filter(order => {
    const status = getOrderDisplayStatus(order)
    return status === currentFilter.value
  })
})

const orderStats = computed(() => {
  const stats = {
    total: orders.value.length,
    shipping: 0,
    delivered: 0
  }
  
  orders.value.forEach(order => {
    const status = getOrderDisplayStatus(order)
    if (status === 'shipping') {
      stats.shipping++
    } else if (status === 'delivered') {
      stats.delivered++
    }
  })
  
  return stats
})

// Methods
const fetchOrders = async (page = 1) => {
  // 必须登录才能查看订单
  if (!userStore.isLoggedIn) {
    await router.push('/login')
    return
  }

  loading.value = true
  errorMessage.value = ''
  
  try {
    const params: PageParams & { 
      status?: number,
      userEmail?: string,
      paymentStatus?: number 
    } = {
      page,
      limit: pagination.value.limit,
      paymentStatus: 1  // 只获取已支付的订单
      // 不需要传userEmail，API会自动使用登录用户的ID
    }
    
    // Add status filter if not 'all'
    if (currentFilter.value !== 'all') {
      params.status = getApiStatusValue(currentFilter.value)
      // 移除调试日志
    }
    
    const response = await orderApi.getOrderList(params)
    
    // 添加详细日志查看API响应
    // 移除调试日志
    
    // 移除调试日志
    
    // 修改判断逻辑：检查code是否为0或success为true
    if ((response.code === 0 || response.success) && response.data) {
      orders.value = response.data.list || []
      pagination.value = {
        page: response.data.page || 1,
        limit: response.data.limit || 10,
        total: response.data.total || 0,
        totalPage: response.data.totalPage || 1
      }
      updateFilterCounts()
      // 如果是第一页，更新所有统计
      if (page === 1) {
        fetchAllOrderStats()
      }
    } else if (response.msg === '查询成功' && response.data) {
      // 处理返回"查询成功"但没有设置success的情况
      orders.value = response.data.list || []
      pagination.value = {
        page: response.data.page || 1,
        limit: response.data.limit || 10,
        total: response.data.total || 0,
        totalPage: response.data.totalPage || 1
      }
      updateFilterCounts()
      // 如果是第一页，更新所有统计
      if (page === 1) {
        fetchAllOrderStats()
      }
    } else {
      throw new Error(response.msg || '获取订单列表失败')
    }
  } catch (error: any) {
    // 移除调试日志
    errorMessage.value = error.message || '获取订单失败，请稍后重试'
    showErrorToast()
  } finally {
    loading.value = false
  }
}

// 根据订单的各个状态字段，获取订单的综合显示状态
const getOrderDisplayStatus = (order: any): string => {
  // 只处理已支付的订单，已支付订单只有两个状态
  if (order.paymentStatus === 1) {
    // 已支付，根据发货状态判断
    if (order.deliveryStatus === 0 || order.deliveryStatus === 1) {
      return 'shipping'  // 待发货
    } else if (order.deliveryStatus === 2 || order.deliveryStatus === 3) {
      return 'delivered'  // 已发货/已送达
    }
  }
  
  return 'shipping'  // 默认显示待发货
}

const normalizeOrderStatus = (status: number | string | undefined): string => {
  // 处理字符串类型
  if (typeof status === 'string') {
    // 如果已经是标准状态字符串，直接返回
    const validStatuses = ['pending', 'shipping', 'delivered', 'completed', 'cancelled', 'expired', 'shipped']
    if (validStatuses.includes(status)) {
      // shipped 映射到 delivered (已发货)
      if (status === 'shipped') {
        return 'delivered'
      }
      return status
    }
    // 尝试转换为数字
    const numStatus = parseInt(status)
    if (!isNaN(numStatus)) {
      status = numStatus
    } else {
      // 无法识别的字符串状态，返回pending作为默认值
      // 移除调试日志
      return 'pending'
    }
  }
  
  // 处理undefined或null
  if (status === undefined || status === null) {
    // 移除调试日志
    return 'pending'
  }
  
  // 处理数字类型
  switch (status) {
    case 0: return 'pending'      // 待支付
    case 1: return 'shipping'     // 待发货  
    case 2: return 'delivered'    // 已发货
    case 3: return 'delivered'    // 已送达
    case 4: return 'completed'    // 已完成
    case 5: return 'cancelled'    // 已取消
    case 6: return 'expired'      // 已过期（明确的过期状态）
    default: 
      // 移除调试日志
      return 'pending'  // 未知状态默认显示为待支付，而不是已过期
  }
}

const getApiStatusValue = (filterStatus: string): number => {
  switch (filterStatus) {
    case 'pending': return 0
    case 'shipping': return 1
    case 'delivered': return 2
    case 'completed': return 4
    case 'cancelled': return 5
    default: return 0
  }
}

// 获取订单状态的显示文本
const getOrderStatusText = (order: any): string => {
  const status = getOrderDisplayStatus(order)
  
  const statusMap: Record<string, string> = {
    shipping: '待发货', 
    delivered: '已发货'
  }
  
  return statusMap[status] || '待发货'
}

// 获取订单状态的CSS类名
const getOrderStatusClass = (order: any): string => {
  const status = getOrderDisplayStatus(order)
  
  const classMap: Record<string, string> = {
    shipping: 'status-shipping',
    delivered: 'status-delivered'
  }
  
  return classMap[status] || 'status-shipping'
}

// 兼容旧的函数（用于处理已经标准化的状态字符串）
const getStatusText = (status: number | string | undefined): string => {
  // 直接调用normalizeOrderStatus处理所有逻辑
  const normalizedStatus = normalizeOrderStatus(status)
  
  const statusMap: Record<string, string> = {
    pending: '待支付',
    shipping: '待发货', 
    delivered: '已发货',
    completed: '已完成',
    cancelled: '已取消',
    expired: '已过期'
  }
  
  const text = statusMap[normalizedStatus]
  if (!text) {
    // 移除调试日志
    return '未知状态'
  }
  return text
}

const getStatusClass = (status: number | string | undefined): string => {
  // 直接调用normalizeOrderStatus处理所有逻辑
  const normalizedStatus = normalizeOrderStatus(status)
  
  const classMap: Record<string, string> = {
    pending: 'status-pending',
    shipping: 'status-shipping',
    delivered: 'status-delivered', 
    completed: 'status-completed',
    cancelled: 'status-cancelled',
    expired: 'status-expired'
  }
  
  const cssClass = classMap[normalizedStatus]
  if (!cssClass) {
    // 移除调试日志
    return 'status-pending' // 默认使用pending样式而不是expired
  }
  return cssClass
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '未知时间'
  try {
    const date = new Date(dateStr)
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      // 移除调试日志
      return dateStr
    }
    
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    // 格式化时间
    const timeStr = date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    // 添加相对时间提示，处理负数和未来日期
    if (days < 0) {
      // 未来的日期（可能是时区问题）
      const futureDays = Math.abs(days)
      if (futureDays === 1) {
        return `${timeStr} (明天)`
      } else {
        return `${timeStr} (${futureDays}天后)`
      }
    } else if (days === 0) {
      return `${timeStr} (今天)`
    } else if (days === 1) {
      return `${timeStr} (昨天)`
    } else if (days < 7) {
      return `${timeStr} (${days}天前)`
    } else if (days < 30) {
      const weeks = Math.floor(days / 7)
      return `${timeStr} (${weeks}周前)`
    } else if (days < 365) {
      const months = Math.floor(days / 30)
      return `${timeStr} (${months}个月前)`
    } else {
      const years = Math.floor(days / 365)
      return `${timeStr} (${years}年前)`
    }
  } catch (error) {
    // 移除调试日志
    return dateStr
  }
}

const formatPrice = (price: number | string): string => {
  if (!price) return '0.00'
  const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[¥,]/g, '')) : price
  return numPrice.toFixed(2)
}

const formatPayMethod = (method: string): string => {
  const methodMap = {
    'wechat': '微信支付',
    'alipay': '支付宝',
    'binance': '币安支付',
    'balance': '余额支付',
    '2': '微信支付',
    '4': '支付宝',
    '3': '币安支付'
  }
  return methodMap[method] || method || '未知支付方式'
}

const changeFilter = async (filter: string) => {
  if (currentFilter.value === filter) return
  
  currentFilter.value = filter
  pagination.value.page = 1
  await fetchOrders(1)
}

const changePage = async (page: number) => {
  if (page < 1 || page > pagination.value.totalPage) return
  pagination.value.page = page
  await fetchOrders(page)
}

const getPageNumbers = (): number[] => {
  const current = pagination.value.page
  const total = pagination.value.totalPage
  const pages: number[] = []
  
  // Always show first page
  if (total > 0) pages.push(1)
  
  // Add pages around current page
  for (let i = Math.max(2, current - 2); i <= Math.min(total - 1, current + 2); i++) {
    if (!pages.includes(i)) pages.push(i)
  }
  
  // Always show last page
  if (total > 1 && !pages.includes(total)) pages.push(total)
  
  return pages.sort((a, b) => a - b)
}

// 获取所有状态的订单统计（不依赖当前页面数据）
const fetchAllOrderStats = async () => {
  try {
    const userStore = useUserStore()
    const user = userStore.user
    
    if (!user?.id) return
    
    // 只获取已支付订单的统计
    const params: any = { page: 1, limit: 100, paymentStatus: 1 }
    
    try {
      const response = await orderApi.getOrderList(params)
      if ((response.code === 0 || response.success || response.msg === '查询成功') && response.data) {
        const allPaidOrders = response.data.list || []
        
        // 统计待发货和已发货数量
        let shippingCount = 0
        let deliveredCount = 0
        
        allPaidOrders.forEach((order: any) => {
          if (order.deliveryStatus === 0 || order.deliveryStatus === 1) {
            shippingCount++
          } else if (order.deliveryStatus === 2 || order.deliveryStatus === 3) {
            deliveredCount++
          }
        })
        
        // 更新筛选标签计数
        filterTabs.value[0].count = allPaidOrders.length  // 全部
        filterTabs.value[1].count = shippingCount  // 待发货
        filterTabs.value[2].count = deliveredCount  // 已发货
      }
    } catch {
      // 错误处理
    }
  } catch (error) {
    // 移除调试日志
  }
}

// 仅更新当前筛选条件的数量（保留用于快速更新）
const updateFilterCounts = () => {
  // 更新当前筛选条件的总数
  const currentTab = filterTabs.value.find(tab => tab.key === currentFilter.value)
  if (currentTab) {
    currentTab.count = pagination.value.total || 0
  }
}

// Order action methods
const canCancelShipping = (order: any): boolean => {
  // 已支付但未发货的订单可以申请取消
  // paymentStatus: 1=已支付, deliveryStatus: 0=待发货
  return order.paymentStatus === 1 && order.deliveryStatus === 0
}

const isDelivered = (order: any): boolean => {
  // 已支付且已发货/已送达的订单
  // paymentStatus: 1=已支付
  // deliveryStatus: 2=已发货, 3=已送达
  return order.paymentStatus === 1 && (order.deliveryStatus === 2 || order.deliveryStatus === 3)
}

const hasReceipts = (order: any): boolean => {
  // 检查订单是否有回执单（代充商品）
  // 可以通过产品类型或其他标识判断
  return order.deliveryRequiresReceipt || order.hasReceipt || false
}

const canDelete = (order: any): boolean => {
  // 不允许删除任何订单
  return false
}


const handleCancel = async (order: any) => {
  // 对于待发货状态，给出额外提示
  const confirmMessage = '订单已在处理中，确定要取消吗？取消后可能需要等待商家确认。'
  
  if (!confirm(confirmMessage)) return
  
  const orderId = order.orderNo || order.id
  
  try {
    const response = await orderApi.cancelOrder(orderId)
    
    // 处理不同的响应格式
    if (response.success || response.code === 0 || response.code === 200) {
      await fetchOrders(pagination.value.page)
      showSuccessMessage('订单取消申请已提交')
    } else {
      // 根据不同的错误信息给出更友好的提示
      let errorMsg = response.msg || response.message || '取消订单失败'
      
      if (errorMsg.includes('不能取消') || errorMsg.includes('无法取消')) {
        errorMsg = '该订单当前状态不允许取消，请联系客服处理'
      } else if (errorMsg.includes('已发货')) {
        errorMsg = '订单已发货，无法取消'
      } else if (errorMsg.includes('已完成')) {
        errorMsg = '订单已完成，无法取消'
      }
      
      throw new Error(errorMsg)
    }
  } catch (error: any) {
    // 移除调试日志
    errorMessage.value = error.message || '取消订单失败，请稍后重试'
    showErrorToast()
  }
}

const handleViewDeliveryInfo = async (order: any) => {
  try {
    const orderNo = order.orderNo || order.id
    const response = await orderApi.getDeliveryInfo(orderNo)
    
    if (response.success || response.code === 200 || response.code === 0) {
      // 显示发货信息弹窗
      deliveryInfo.value = response.data
      showDeliveryModal.value = true
    } else {
      errorMessage.value = response.msg || response.message || '获取发货信息失败'
      showErrorToast()
    }
  } catch (error: any) {
    errorMessage.value = error.message || '获取发货信息失败，请稍后重试'
    showErrorToast()
  }
}

const handleViewReceipts = async (order: any) => {
  selectedOrder.value = order
  showReceiptModal.value = true
}

const handleReceiptSuccess = () => {
  // 刷新订单列表
  fetchOrders(pagination.value.page)
}

const closeReceiptModal = () => {
  showReceiptModal.value = false
  receiptInfo.value = null
}

const closeDeliveryModal = () => {
  showDeliveryModal.value = false
  deliveryInfo.value = null
  copiedIndex.value = -1
}

const getReceiptStatusClass = (status: number): string => {
  switch (status) {
    case 0: return 'status-pending'
    case 1: return 'status-completed'
    default: return 'status-pending'
  }
}

const getReceiptStatusText = (status: number): string => {
  switch (status) {
    case 0: return '待填写'
    case 1: return '已完成'
    default: return '未知'
  }
}

const parseReceiptFields = (fields: any): any[] => {
  if (!fields) return []
  if (typeof fields === 'string') {
    try {
      return JSON.parse(fields)
    } catch {
      return []
    }
  }
  return Array.isArray(fields) ? fields : []
}

const formatFieldLabel = (key: string): string => {
  const labelMap: Record<string, string> = {
    account: '账号',
    password: '密码',
    email: '邮箱',
    phone: '手机号',
    name: '姓名',
    region: '地区',
    server: '服务器',
    character: '角色名'
  }
  return labelMap[key] || key
}

const getDeliveryStatusText = (status: number): string => {
  const statusMap: Record<number, string> = {
    0: '待发货',
    1: '部分发货',
    2: '已发货',
    3: '已送达'
  }
  return statusMap[status] || '未知'
}

const parseDeliveryContent = (content: string): string => {
  try {
    const parsed = JSON.parse(content)
    return parsed.cdkCode || content
  } catch {
    return content
  }
}

const copyCDK = async (cdk: string, index: number) => {
  try {
    await navigator.clipboard.writeText(cdk)
    copiedIndex.value = index
    showSuccessMessage('CDK已复制到剪贴板')
    setTimeout(() => {
      copiedIndex.value = -1
    }, 2000)
  } catch (error) {
    // 降级方案
    const input = document.createElement('input')
    input.value = cdk
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    copiedIndex.value = index
    showSuccessMessage('CDK已复制到剪贴板')
    setTimeout(() => {
      copiedIndex.value = -1
    }, 2000)
  }
}

const handleViewDetail = (order: any) => {
  selectedOrder.value = order
  showDetailModal.value = true
}

const handleDelete = async (order: any) => {
  if (!confirm('确定要删除这个订单吗？删除后无法恢复。')) return
  
  try {
    // TODO: Implement delete order API when backend is ready
    // const response = await orderApi.deleteOrder(order.orderNo || order.id)
    // if (response.success) {
    //   await fetchOrders(pagination.value.page)
    //   showSuccessMessage('订单已删除')
    // }
    
    // Temporary mock implementation
    showSuccessMessage('删除订单功能开发中')
  } catch (error: any) {
    errorMessage.value = error.message || '删除订单失败'
    showErrorToast()
  }
}


const closeDetailModal = () => {
  showDetailModal.value = false
  selectedOrder.value = null
}

const goShopping = () => {
  if (currentFilter.value === 'all') {
    router.push('/')
  } else {
    currentFilter.value = 'all'
    fetchOrders(1)
  }
}

const getEmptyText = (): string => {
  const textMap = {
    all: '暂无订单',
    shipping: '暂无待发货订单', 
    delivered: '暂无已发货订单'
  }
  return textMap[currentFilter.value] || '暂无相关订单'
}

const getEmptyDesc = (): string => {
  const descMap = {
    all: '您还没有任何订单',
    shipping: '您还没有待发货的订单',
    delivered: '您还没有已发货的订单'
  }
  return descMap[currentFilter.value] || '暂无相关订单数据'
}

const showSuccessMessage = (message: string) => {
  // Simple success message implementation
  const toast = document.createElement('div')
  toast.className = 'success-toast'
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">✅</span>
      <span class="toast-text">${message}</span>
    </div>
  `
  document.body.appendChild(toast)
  
  setTimeout(() => {
    document.body.removeChild(toast)
  }, 3000)
}

const showErrorToast = () => {
  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}


// Lifecycle hooks
onMounted(() => {
  fetchOrders()
  // 页面加载时获取所有状态的统计
  fetchAllOrderStats()
})

// Watch for authentication changes
watch(() => userStore.isLoggedIn, (isLoggedIn) => {
  if (!isLoggedIn) {
    router.push('/login')
  }
})

// 移除这个watch，避免循环刷新
// watch(orders, () => {
//   startCountdown()
// })
</script>

<style scoped>
.orders-container {
  min-height: 100vh;
  background: #f8fafb;
  padding: 20px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4A90E2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 16px;
  color: #999;
}

.orders-section {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e9ecef;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.order-stats {
  display: flex;
  gap: 30px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-count {
  font-size: 20px;
  font-weight: 700;
  color: #4A90E2;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.filter-tabs {
  display: flex;
  gap: 2px;
  margin-bottom: 30px;
  background: #fff;
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.filter-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.filter-tab.active {
  background: #4A90E2;
  color: white;
  box-shadow: 0 2px 8px rgba(74,144,226,0.3);
}

.filter-tab:hover:not(.active) {
  background: #f0f7ff;
  color: #4A90E2;
}

.tab-badge {
  background: rgba(255,255,255,0.9);
  color: #4A90E2;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.filter-tab.active .tab-badge {
  background: rgba(255,255,255,0.95);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  background: white;
  border-radius: 16px;
  margin: 20px 0;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-text {
  font-size: 18px;
  color: #333;
  font-weight: 600;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 30px;
}

.go-shopping-btn {
  background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 16px rgba(74,144,226,0.3);
}

.go-shopping-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74,144,226,0.4);
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border: 1px solid #f0f0f0;
  transition: transform 0.2s, box-shadow 0.2s;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.order-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-number {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.order-date {
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.order-countdown {
  font-size: 14px;
  color: #ff4d4f;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 12px;
  padding: 4px 8px;
  background: #fff1f0;
  border-radius: 4px;
  border: 1px solid #ffccc7;
}

.icon-timer {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.icon-clock {
  vertical-align: middle;
  opacity: 0.7;
}

.order-status {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  min-width: 80px;
}

.status-pending {
  background: #fff3cd;
  color: #faad14;
  border: 1px solid #ffeaa7;
}

.status-shipping {
  background: #e6f7ff;
  color: #1890FF;
  border: 1px solid #91d5ff;
}

.status-delivered {
  background: #f0f9ff;
  color: #0ea5e9;
  border: 1px solid #7dd3fc;
}

.status-completed {
  background: #eaffea;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.status-cancelled {
  background: #f5f5f5;
  color: #999;
  border: 1px solid #d9d9d9;
}

.status-expired {
  background: #fff1f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

.order-content {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-row {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.detail-label {
  color: #666;
  min-width: 80px;
}

.detail-value {
  color: #333;
  font-weight: 500;
}

.price-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  min-width: 120px;
}

.total-price {
  font-size: 20px;
  font-weight: 700;
  color: #ff4d4f;
  margin-bottom: 4px;
}

.unit-price {
  font-size: 14px;
  color: #666;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  min-width: 80px;
}

.action-btn.warning {
  background: linear-gradient(135deg, #ffa500 0%, #ff8c00 100%);
  color: white;
}

.action-btn.warning:hover {
  background: linear-gradient(135deg, #ff8c00 0%, #ff7700 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 165, 0, 0.3);
}

.action-btn.primary {
  background: #4A90E2;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: #357ABD;
  transform: translateY(-1px);
}

.action-btn.secondary {
  background: white;
  color: #4A90E2;
  border: 1px solid #4A90E2;
}

.action-btn.secondary:hover:not(:disabled) {
  background: #4A90E2;
  color: white;
}

.action-btn.danger {
  background: white;
  color: #ff4d4f;
  border: 1px solid #ff4d4f;
}

.action-btn.danger:hover:not(:disabled) {
  background: #ff4d4f;
  color: white;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 40px;
  padding: 20px;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: #4A90E2;
  color: #4A90E2;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-number {
  width: 40px;
  height: 40px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-number:hover {
  border-color: #4A90E2;
  color: #4A90E2;
}

.page-number.active {
  background: #4A90E2;
  color: white;
  border-color: #4A90E2;
}

.page-info {
  margin-left: 20px;
  color: #666;
  font-size: 14px;
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.detail-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: between;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.modal-close {
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
}

.modal-body {
  padding: 24px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.detail-item .label {
  color: #666;
  font-size: 14px;
  min-width: 100px;
}

.detail-item .value {
  color: #333;
  font-weight: 500;
  text-align: right;
  flex: 1;
}

.detail-item .value.highlight {
  color: #ff4d4f;
  font-size: 16px;
  font-weight: 600;
}

.detail-item .value.status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.error-toast,
.success-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 3000;
  animation: slideIn 0.3s ease;
}

.toast-content {
  background: white;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  border-left: 4px solid #ff4d4f;
}

.success-toast .toast-content {
  border-left-color: #52c41a;
}

.toast-icon {
  font-size: 18px;
}

.toast-text {
  color: #333;
  font-weight: 500;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .orders-container {
    padding: 16px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .order-stats {
    width: 100%;
    justify-content: space-around;
    gap: 16px;
  }
  
  .filter-tabs {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .filter-tab {
    flex: none;
    min-width: calc(50% - 4px);
  }
  
  .order-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .price-info {
    align-items: flex-start;
  }
  
  .order-actions {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .pagination {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .page-info {
    width: 100%;
    text-align: center;
    margin: 8px 0 0 0;
  }
  
  .detail-modal {
    width: 95%;
    max-height: 90vh;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .detail-item .value {
    text-align: left;
  }
}

/* Delivery Modal Styles */
.delivery-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 700px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.delivery-content {
  padding: 8px;
}

.info-section {
  margin-bottom: 24px;
  background: #f8fafb;
  border-radius: 12px;
  padding: 20px;
}

.info-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e9ecef;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-item .label {
  color: #666;
  font-size: 14px;
  min-width: 80px;
}

.info-item .value {
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.info-item .value.status {
  padding: 4px 12px;
  border-radius: 12px;
  background: #e6f7ff;
  color: #1890FF;
  font-size: 13px;
}

.cdk-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cdk-item {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
}

.cdk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.cdk-index {
  font-size: 14px;
  font-weight: 600;
  color: #666;
}

.cdk-status {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 600;
}

.cdk-status.success {
  background: #eaffea;
  color: #52c41a;
}

.cdk-status.failed {
  background: #fff1f0;
  color: #ff4d4f;
}

.cdk-code-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
}

.cdk-code {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  font-weight: 600;
  background: #f8fafb;
  color: #333;
  letter-spacing: 1px;
}

.cdk-code:focus {
  outline: none;
  border-color: #4A90E2;
  background: white;
}

.copy-btn {
  padding: 10px 20px;
  background: #4A90E2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.copy-btn:hover {
  background: #357ABD;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(74,144,226,0.3);
}

.delivery-text {
  padding: 12px;
  background: #f8fafb;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.cdk-tips {
  margin-top: 20px;
  padding: 16px;
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #8c6800;
}

.tips-icon {
  font-size: 20px;
}

.empty-delivery {
  text-align: center;
  padding: 60px 20px;
}

.empty-delivery .empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.8;
}

.empty-delivery .empty-text {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.empty-delivery .empty-desc {
  font-size: 14px;
  color: #666;
}

@media (max-width: 768px) {
  .delivery-modal {
    width: 95%;
    max-height: 90vh;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .cdk-code-wrapper {
    flex-direction: column;
    align-items: stretch;
  }
  
  .copy-btn {
    width: 100%;
  }
}
</style>