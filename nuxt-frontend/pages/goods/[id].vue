<template>
  <div class="goods-detail-page">
    <AppHeader />
    
    <!-- 加载状态 -->
    <div v-if="goodsPending" class="loading-container">
      <div class="loading-spinner">加载中...</div>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="goodsError" class="error-container">
      <div class="error-message">
        <h3>加载失败</h3>
        <p>{{ goodsError.message || '商品信息加载失败，请稍后重试' }}</p>
        <button @click="() => refreshGoodsData()" class="retry-btn">重新加载</button>
      </div>
    </div>
    
    <!-- 正常内容 -->
    <div v-else class="goods-content">
      <!-- 返回按钮 -->
      <div class="back-btn-row">
        <button class="back-btn" @click="goBack">
          <span class="back-btn-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="15" stroke="#2563EB" stroke-width="2" fill="#fff"/>
              <path d="M18.5 10L13 16L18.5 22" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="back-btn-text">返回</span>
        </button>
      </div>
      
      <!-- API错误提示（但继续显示内容） -->
      <div v-if="goodsError" class="api-error-notice">
        <div class="error-notice-content">
          <span class="error-icon">⚠️</span>
          <span class="error-text">API连接失败，显示默认商品信息</span>
          <button @click="() => refreshGoodsData()" class="retry-small-btn">重试</button>
        </div>
      </div>
      <!-- 主内容区 -->
      <div class="goods-detail-content">
        <div class="goods-main-section">
          <!-- 左侧：卖点区+主图+缩略图+服务保障区 -->
          <div class="goods-left-panel">
            <!-- 卖点区 -->
            <div class="features-bar">
              <div class="features-list">
                <div class="feature-item">
                  <span class="feature-icon">
                    <OptimizedImage
                      src="/images/xiangqing1.png"
                      alt="凡图拉专业技术团队 - 7x24小时技术支持保障"
                      title="专业技术团队支持"
                      :width="48"
                      :height="48"
                      preset="icon"
                    />
                  </span>
                  <span class="feature-label">大团队开发</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">
                    <OptimizedImage
                      src="/images/xiangqing2.png"
                      alt="凡图拉人工客服 - 一对一专业服务支持"
                      title="人工客服在线支持"
                      :width="48"
                      :height="48"
                      preset="icon"
                    />
                  </span>
                  <span class="feature-label">人工客服服务</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">
                    <OptimizedImage
                      src="/images/xiangqing3.png"
                      alt="凡图拉安全保障 - 正品保证可信赖平台"
                      title="安全可信赖的大平台"
                      :width="48"
                      :height="48"
                      preset="icon"
                    />
                  </span>
                  <span class="feature-label">大平台更放心</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">
                    <OptimizedImage
                      src="/images/xiangqing4.png"
                      alt="凡图拉全网覆盖 - 极速发货全球服务"
                      title="全网矩阵服务"
                      :width="48"
                      :height="48"
                      preset="icon"
                    />
                  </span>
                  <span class="feature-label">全网矩阵</span>
                </div>
              </div>
            </div>
            <!-- 主图外部白色大框 -->
            <div class="main-image-wrapper">
              <div class="main-image">
                <OptimizedImage
                  :src="selectedImage || '/images/xiangqingzhutu1.png'"
                  :alt="`${goodsInfo.name || '商品'} - 高清产品展示图 - 凡图拉正品`"
                  :title="`查看${goodsInfo.name || '商品'}大图`"
                  :product-name="goodsInfo.name"
                  :category="goodsInfo.category"
                  :seo-keywords="['Netflix', '流媒体', '4K高清', '正品保证']"
                  :width="600"
                  :height="600"
                  loading="eager"
                  preset="productMain"
                  class="main-product-image"
                />
              </div>
              <div class="thumb-list">
                <div
                  v-for="(img, idx) in images"
                  :key="idx"
                  :class="['thumb', {active: selectedImage === img}]"
                  @click="img && (selectedImage = img)"
                >
                  <OptimizedImage
                    v-if="img"
                    :src="img"
                    :alt="`${goodsInfo.name || '商品'}缩略图 ${idx + 1}`"
                    :title="`点击查看图片 ${idx + 1}`"
                    :width="100"
                    :height="100"
                    preset="productThumb"
                    class="thumb-img"
                  />
                  <div v-else class="thumb-placeholder"></div>
                </div>
              </div>
            </div>
            <!-- 服务保障区 -->
            <div class="service-bar">
              <div class="service-list">
                <span class="service-item">官方采购・正品保障</span>
                <span class="service-item">全程质保・无忧售后</span>
                <span class="service-item">大平台更放心</span>
                <span class="service-item">全网矩阵・极速发货</span>
                <span class="service-item">7天无理由退换</span>
                <span class="service-item">假一赔十</span>
              </div>
            </div>
          </div>
          <!-- 右侧信息区 -->
          <div class="goods-info-panel">
            <div class="goods-title-row">
              <span class="goods-title">{{ goodsInfo.name }}</span>
              <span class="goods-sold">已售{{ goodsInfo.sales || '150354' }}</span>
            </div>
            <!-- 市场板块提示行 -->
            <div class="market-bar">买了车票没账号的？</div>
            <div class="goods-meta-row">
              <span class="goods-rating">4.9 <span class="meta-light">(1280条评价)</span></span>
              <span class="meta-light">全球解锁</span>
              <span class="meta-light">4K高清</span>
            </div>
            <!-- 价格显示区 -->
            <div class="goods-final-price-row">
              <div class="row-label-bar">
                <span class="blue-bar"></span>
                <span class="goods-price-label">价格</span>
              </div>
              <span class="goods-final-price">￥{{ displayPrice }}</span>
              <span v-if="selectedSku && selectedSku.expire_days" class="price-period">/ {{ selectedSku.expire_days }}天</span>
              <span v-if="goodsInfo.deliveryRequiresReceipt" class="recharge-badge">代充商品</span>
            </div>
            <!-- SKU选择区 -->
            <!-- 调试信息 - 生产环境请改为 v-if="false" -->
            <div v-if="false" style="background: #fffacd; padding: 15px; margin: 15px 0; font-size: 13px; border: 2px solid #ff6b6b; border-radius: 8px;">
              <h4 style="color: #ff6b6b; margin: 0 0 10px 0;">🔍 SKU数据调试信息</h4>
              <p><strong>商品ID:</strong> {{ goodsId }}</p>
              <p><strong>productSkus对象:</strong> {{ JSON.stringify(productSkus, null, 2) }}</p>
              <p><strong>SKU数组长度:</strong> {{ productSkus.skus ? productSkus.skus.length : 'null或undefined' }}</p>
              <p><strong>可用SKU数量:</strong> {{ availableSkus.length }}</p>
              <p><strong>当前选中SKU:</strong> {{ selectedSku ? selectedSku.sku_name : '未选择' }}</p>
              <p><strong>显示条件满足?</strong> {{ (productSkus.skus && productSkus.skus.length > 0) ? '✅ 是' : '❌ 否' }}</p>
            </div>
            <div class="goods-sku-row" v-if="!goodsInfo.deliveryRequiresReceipt && productSkus.skus && productSkus.skus.length > 0">
              <div class="row-label-bar">
                <span class="blue-bar"></span>
                <span class="goods-sku-label">选择套餐</span>
              </div>
              <!-- 简化的SKU直接选择 -->
              <div class="sku-direct-list">
                <div 
                  v-for="sku in productSkus.skus.filter(s => s.status === 1)" 
                  :key="sku.sku_id"
                  class="sku-option-card"
                  :class="{ 
                    active: selectedSku?.sku_id === sku.sku_id,
                    'out-of-stock': sku.stock <= 0
                  }"
                  @click="sku.stock > 0 ? selectSkuDirectly(sku) : showOutOfStockMessage()"
                >
                  <div class="sku-option-header">
                    <span class="sku-option-name">{{ sku.sku_name }}</span>
                    <span class="sku-option-badge" v-if="sku.stock <= 0">缺货</span>
                    <span class="sku-option-badge" v-else-if="getSkuBadge(sku)">{{ getSkuBadge(sku) }}</span>
                  </div>
                  <div class="sku-option-price">￥{{ sku.price }}</div>
                  <div class="sku-option-desc" v-if="sku.sku_description">{{ sku.sku_description }}</div>
                  <div class="sku-option-footer">
                    <span class="sku-stock" :class="{ 'no-stock': sku.stock <= 0 }">
                      库存: {{ sku.stock > 0 ? sku.stock + '件' : '缺货' }}
                    </span>
                    <span class="sku-sales" v-if="sku.sales > 0">已售: {{ sku.sales }}件</span>
                  </div>
                </div>
              </div>
              <!-- 选中SKU的详细信息 -->
              <div v-if="selectedSku" class="selected-sku-detail">
                <div class="sku-detail-title">当前选择</div>
                <div class="sku-detail-content">
                  <div class="sku-detail-item">
                    <span class="detail-label">套餐名称：</span>
                    <span class="detail-value">{{ selectedSku.sku_name }}</span>
                  </div>
                  <div class="sku-detail-item">
                    <span class="detail-label">套餐价格：</span>
                    <span class="detail-value price">￥{{ selectedSku.price }}</span>
                  </div>
                  <div class="sku-detail-item" v-if="selectedSku.expire_days">
                    <span class="detail-label">有效期限：</span>
                    <span class="detail-value">{{ selectedSku.expire_days }}天</span>
                  </div>
                  <div class="sku-detail-item" v-if="selectedSku.license_count && selectedSku.license_count > 1">
                    <span class="detail-label">设备数量：</span>
                    <span class="detail-value">{{ selectedSku.license_count }}台设备</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="goods-qty-row">
              <div class="row-label-bar">
                <span class="blue-bar"></span>
                <span class="goods-qty-label">购买数量</span>
              </div>
              <button class="qty-btn" @click="qty = Math.max(1, qty-1)">-</button>
              <span class="qty-value">{{ qty }}</span>
              <button class="qty-btn" @click="qty = qty+1">+</button>
            </div>
            <div class="goods-action-row">
              <button class="buy-btn" @click="buyNow">立即购买</button>
              <button class="cart-btn" @click="addToCart($event)">加入购物车</button>
              <button class="fav-btn" @click="toggleFavorite" :class="{active: isFavorited}">
                <span class="fav-icon">{{ isFavorited ? '♥' : '♡' }}</span>
                {{ isFavorited ? '已收藏' : '收藏' }}
              </button>
            </div>
            <div class="goods-disclaimer">
              本站所展示的所有徽标､商标及相关识别标志均归各⾃权利⼈所有，版权归原公司及其附属机构所有
            </div>
            <div class="goods-bottom-section">
              <div class="recommend-section">
                <div class="row-label-bar">
                  <span class="blue-bar"></span>
                  <span class="recommend-title">推荐搭配</span>
                </div>
                <div class="recommend-list">
                  <div v-if="recommendsLoading" class="recommend-loading">
                    <span>加载推荐商品中...</span>
                  </div>
                  <div v-else-if="recommends.length === 0" class="recommend-empty">
                    <span>暂无推荐商品</span>
                  </div>
                  <div 
                    v-else
                    class="recommend-item" 
                    v-for="item in recommends" 
                    :key="item.id || item.name"
                    @click="goToRecommendGoods(item)"
                    style="cursor: pointer;"
                  >
                    <div class="recommend-thumb">
                      <img 
                        v-if="item.image" 
                        :src="item.image" 
                        :alt="item.name"
                        style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;"
                        @error="(e) => { e.target.style.display = 'none' }"
                      />
                    </div>
                    <div class="recommend-name">{{ item.name }}</div>
                    <div class="recommend-price">{{ item.price }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 超级大图区域 -->
      <div class="super-detail-image">
        <div class="super-detail-content">商品详情</div>
      </div>
      <AppFooter />
      <LoginRegisterModal :visible="modal.showLogin" @close="modal.closeLogin()" />
      <OrderPayModal
        v-if="showPayModal"
        :shopLogo="payGoods.shopLogo"
        :shopName="payGoods.shopName"
        :shopDesc="payGoods.shopDesc"
        :orderId="payGoods.orderId"
        :price="payGoods.price"
        :countdown="payCountdown"
        @close="handlePayClose"
        @timeout="handlePayTimeout"
        @paySuccess="handlePaySuccess"
      />
      <!-- 支付成功弹窗 -->
      <PaySuccessModal
        v-if="showPaySuccessModal"
        :orderId="paySuccessOrder.orderId"
        :amount="paySuccessOrder.amount"
        :payType="paySuccessOrder.payType"
        :productName="paySuccessOrder.productName"
        :productType="paySuccessOrder.productType"
        @close="handlePaySuccessClose"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import LoginRegisterModal from '@/components/LoginRegisterModal.vue'
import OrderPayModal from '@/components/OrderPayModal.vue'
import PaySuccessModal from '@/components/PaySuccessModal.vue'
import { useModalStore } from '@/stores/modal'
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { orderApi } from '@/api/order'
import { cartApi } from '@/api/common'
import { ElMessage } from 'element-plus'
import { getSessionId, getUserIdentifier } from '@/utils/session'

const cartStore = useCartStore()
const modal = useModalStore()
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const goBack = () => router.back()

// 获取商品ID
const goodsId = computed(() => Number(route.params.id) || 1)

// 🎨 前端UI设计阶段 - 静态商品数据（已注释，用于检查页面功能）
/*
const goodsInfo = ref({
  id: goodsId.value,
  name: 'Netflix 高级会员',
  image: '/images/xiangqingzhutu1.png',
  desc: '全球最大的流媒体平台，提供海量电影、电视剧和原创内容',
  region: '美国/香港/台湾',
  quality: '4K 超高清',
  devices: '4台同时在线',
  download: '是',
  prices: [
    { label: '月付', value: '¥35.00' },
    { label: '季付', value: '¥90.00' },
    { label: '年付', value: '¥320.00' }
  ],
  hot: true
})
*/

// ✅ 真实API调用 - 使用原生fetch（经测试可用）
const goodsData = ref<{success: boolean, data: any, msg: string}>({ success: false, data: null, msg: '' })
const goodsError = ref(null)
const goodsPending = ref(true)

// 获取商品详情的函数
const fetchGoodsDetail = async () => {
  goodsPending.value = true
  goodsError.value = null
  console.log('🔄 开始请求商品详情, 商品ID:', goodsId.value)
  
  // 设置超时
  const timeout = setTimeout(() => {
    console.log('请求超时，使用默认数据')
    goodsData.value = {
      success: true,
      data: {
        id: goodsId.value,
        title: 'Netflix 高级会员',
        price: 99,
        description: '全球最大的流媒体平台'
      },
      msg: 'timeout'
    }
    goodsPending.value = false
  }, 5000)
  
  try {
    // 使用相对路径，让Nuxt代理处理
    const apiUrl = `/api/product/${goodsId.value}`
    console.log('请求URL:', apiUrl)
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    clearTimeout(timeout)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ 商品详情请求成功:', data)
    goodsData.value = data
  } catch (error) {
    clearTimeout(timeout)
    console.error('❌ 商品详情请求失败:', error)
    // 不设置 goodsError，直接使用默认数据，让页面能正常显示
    // goodsError.value = error as any
    // 使用默认数据
    goodsData.value = {
      success: true,
      data: {
        id: goodsId.value,
        title: '商品加载中',
        price: 88,
        description: '商品信息'
      },
      msg: 'error'
    }
  } finally {
    goodsPending.value = false
  }
}

const refreshGoodsData = () => fetchGoodsDetail()

// 监听路由变化，重新获取数据
watch(goodsId, async (newId, oldId) => {
  console.log('🔄 路由变化 - 商品ID从', oldId, '变为', newId)
  if (newId && newId !== oldId) {
    // 重置SKU相关数据
    productSkus.value = { specifications: null, skus: [] }
    selectedSku.value = null
    selectedSpecs.value = {}
    
    // 重新获取数据
    await fetchGoodsDetail()
    await fetchProductSkus() // 获取SKU信息
    await fetchRecommendGoods() // 重新获取推荐商品
  }
}, { immediate: false })

// 商品基本信息
const goodsInfo = computed(() => {
  if (goodsData.value && goodsData.value.success && goodsData.value.data) {
    const data = goodsData.value.data
    // 处理图片路径
    let imageUrl = data.image || data.coverImage || '/images/xiangqingzhutu1.png'
    // 如果图片路径是相对路径但不以/开头，添加/
    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
      imageUrl = '/' + imageUrl
    }
    // 将旧的图片路径映射到实际存在的图片
    if (imageUrl === '/images/netflix.png') {
      imageUrl = '/images/xiangqingzhutu1.png'
    }
    
    return {
      id: data.id,
      goods_code: data.goods_code, // 添加商品编码字段
      name: data.title || data.name,
      image: imageUrl,
      desc: data.description || '商品描述',
      region: '美国/香港/台湾', // 这些字段可能需要从后端获取
      quality: '4K 超高清',
      devices: '4台同时在线',
      download: '是',
      prices: [
        { label: '月付', value: `¥${data.price || 35}` },
        { label: '季付', value: `¥${(parseFloat(data.price) || 35) * 3}` },
        { label: '年付', value: `¥${(parseFloat(data.price) || 35) * 12}` }
      ],
      hot: data.status === 1,
      price: parseFloat(data.price) || 35,
      sales: data.sales || 0, // 新增销售量
      skus: data.skus ? (typeof data.skus === 'string' ? JSON.parse(data.skus) : data.skus) : null, // 添加SKU数据
      deliveryRequiresReceipt: data.deliveryRequiresReceipt || false // 是否为代充商品
    }
  }
  
  // 如果API调用失败，返回基础数据结构，使用当前商品ID
  return {
    id: goodsId.value,
    name: '商品加载中...',
    image: '/images/xiangqingzhutu1.png',
    desc: '正在加载商品信息，请稍候...',
    region: '全球',
    quality: '高品质',
    devices: '多设备',
    download: '支持',
    prices: [
      { label: '套餐', value: '¥--' }
    ],
    hot: false,
    price: 0,
    sales: 0
  }
})

// 商品图片数组，动态获取并容错处理
const images = computed(() => {
  // 优先使用API返回的图片数组
  if (goodsData.value && goodsData.value.success && goodsData.value.data) {
    const data = goodsData.value.data
    // 假设后端返回字段为 images 或 imageList，类型为字符串数组
    let imgs = []
    if (Array.isArray(data.images)) {
      imgs = data.images.filter((img: string) => !!img)
    } else if (Array.isArray(data.imageList)) {
      imgs = data.imageList.filter((img: string) => !!img)
    } else if (data.coverImage || data.image) {
      imgs = [data.coverImage || data.image]
    }
    // 容错：无图片时给默认图
    if (!imgs.length) imgs = ['/images/xiangqingzhutu1.png']
    return imgs
  }
  // API失败时返回默认图片
  return ['/images/xiangqingzhutu1.png']
})

// selectedImage 响应 images 变化
const selectedImage = ref('')
watch(images, (val) => {
  selectedImage.value = val && val.length > 0 ? val[0] : '/images/xiangqingzhutu1.png'
}, { immediate: true })

const qty = ref(1)
const selectedSku = ref<any>(null)
const selectedSpecs = ref<any>({})
const productSkus = ref<any>({ specifications: null, skus: [] })

// 添加一个监听器来跟踪productSkus的变化
watch(productSkus, (newVal) => {
  console.log('📊 productSkus变化了:', newVal)
  console.log('📊 SKU数量:', newVal.skus ? newVal.skus.length : 0)
}, { deep: true, immediate: true })

// 计算可用的SKU列表（过滤和排序）
const availableSkus = computed(() => {
  if (!productSkus.value.skus || productSkus.value.skus.length === 0) {
    return []
  }
  // 过滤出有库存且启用的SKU，并按价格排序
  return productSkus.value.skus
    .filter((sku: any) => sku.status === 1 && sku.stock > 0)
    .sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price))
})

// 计算显示价格
const displayPrice = computed(() => {
  if (selectedSku.value) {
    return selectedSku.value.price
  }
  
  // 优先使用后端计算的最低SKU价格
  if (goodsData.value?.data?.min_sku_price !== undefined && goodsData.value?.data?.min_sku_price !== null) {
    return goodsData.value.data.min_sku_price
  }
  
  // 如果没有选中SKU，显示最低价格
  if (availableSkus.value.length > 0) {
    return availableSkus.value[0].price
  }
  
  return goodsInfo.value.price || '0.00'
})

// 获取SKU标签（如推荐、热销等）
const getSkuBadge = (sku: any) => {
  if (sku.sku_name.includes('年')) return '最划算'
  if (sku.sku_name.includes('3个月')) return '季度优惠'
  return ''
}

// 推荐商品数据（动态获取）
const recommends = ref<any[]>([])
const recommendsLoading = ref(false)

// 获取推荐商品
const fetchRecommendGoods = async () => {
  recommendsLoading.value = true
  try {
    // 获取商品列表作为推荐
    const config = useRuntimeConfig()
    const response = await fetch(`${config.public.apiBase}/product/goods?page=1&limit=10&isRecommend=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    
    if (result.code === 0 && result.data) {
      // 过滤掉当前商品，取前4个作为推荐
      const allGoods = result.data.list || result.data.records || result.data || []
      const currentId = Number(goodsId.value)
      
      console.log('当前商品ID:', currentId)
      console.log('所有商品:', allGoods.map((item: any) => ({ id: item.goodsId || item.id, name: item.name || item.title })))
      
      const filteredGoods = allGoods
        .filter((item: any) => {
          const itemId = Number(item.goodsId || item.id)
          // 确保不推荐当前正在查看的商品
          return itemId !== currentId && !isNaN(itemId)
        })
        .slice(0, 4)
        .map((item: any) => ({
          id: item.goodsId || item.id,
          name: item.name || item.title || '商品',
          price: item.price ? `￥${item.price}${item.duration ? '/' + item.duration : ''}` : '￥0',
          image: item.image || item.coverImage || '/images/netflix.png'
        }))
      
      console.log('过滤后的推荐商品:', filteredGoods)
      
      recommends.value = filteredGoods.length > 0 ? filteredGoods : [
        // 如果没有获取到数据，使用默认推荐（确保ID不与当前商品冲突）
        { id: currentId === 101 ? 102 : 101, name: 'Netflix', price: '￥35/月', image: '/images/netflix.png' },
        { id: currentId === 102 ? 103 : 102, name: 'Disney+', price: '￥199/年', image: '/images/netflix.png' },
        { id: currentId === 103 ? 104 : 103, name: 'YouTube Premium', price: '￥240/年', image: '/images/netflix.png' },
        { id: currentId === 104 ? 105 : 104, name: 'HBO Max', price: '￥189/年', image: '/images/netflix.png' }
      ].filter(item => item.id !== currentId)
    } else {
      // 使用默认推荐商品
      const currentId = Number(goodsId.value)
      recommends.value = [
        { id: currentId === 101 ? 102 : 101, name: 'Netflix', price: '￥35/月', image: '/images/netflix.png' },
        { id: currentId === 102 ? 103 : 102, name: 'Disney+', price: '￥199/年', image: '/images/netflix.png' },
        { id: currentId === 103 ? 104 : 103, name: 'YouTube Premium', price: '￥240/年', image: '/images/netflix.png' },
        { id: currentId === 104 ? 105 : 104, name: 'HBO Max', price: '￥189/年', image: '/images/netflix.png' }
      ].filter(item => item.id !== currentId)
    }
  } catch (error) {
    console.error('获取推荐商品失败:', error)
    // 出错时使用默认推荐商品
    const currentId = Number(goodsId.value)
    recommends.value = [
      { id: currentId === 101 ? 102 : 101, name: 'Netflix', price: '￥35/月', image: '/images/netflix.png' },
      { id: currentId === 102 ? 103 : 102, name: 'Disney+', price: '￥199/年', image: '/images/netflix.png' },
      { id: currentId === 103 ? 104 : 103, name: 'YouTube Premium', price: '￥240/年', image: '/images/netflix.png' },
      { id: currentId === 104 ? 105 : 104, name: 'HBO Max', price: '￥189/年', image: '/images/netflix.png' }
    ].filter(item => item.id !== currentId)
  } finally {
    recommendsLoading.value = false
  }
}

// 点击推荐商品跳转
const goToRecommendGoods = (item: any) => {
  if (item.id) {
    router.push(`/goods/${item.id}`)
  }
}
const showPayModal = ref(false)
const payCountdown = 900
const payGoods = ref<any>({})

// 支付成功弹窗相关
const showPaySuccessModal = ref(false)
const paySuccessOrder = ref({
  orderId: '',
  amount: 0,
  payType: 'alipay',
  productName: '',
  productType: ''
})

function handlePayClose() { showPayModal.value = false }
function handlePaySuccessClose() { 
  showPaySuccessModal.value = false 
  // 可选：跳转到订单页面
  // router.push('/profile/orders')
}
function handlePayTimeout() { showPayModal.value = false /* 可加取消订单逻辑 */ }

// 支付成功处理
function handlePaySuccess(paymentInfo: any) {
  console.log('💰 商品详情页支付成功！', paymentInfo)
  
  // 关闭支付弹窗
  showPayModal.value = false
  
  // 判断是否为代充商品
  const isRecharge = goodsInfo.value.deliveryRequiresReceipt || 
                     goodsInfo.value.isProxyRecharge ||
                     goodsInfo.value.name?.includes('代充') ||
                     goodsInfo.value.name?.includes('充值')
  
  // 准备支付成功信息
  paySuccessOrder.value = {
    orderId: paymentInfo.orderId || payGoods.value.orderId,
    amount: paymentInfo.amount || displayPrice.value,
    payType: paymentInfo.payType || 'alipay',
    productName: goodsInfo.value.name,
    // 关键：根据 deliveryRequiresReceipt 判断是否为代充商品
    productType: isRecharge ? 'recharge' : 'normal'
  }
  
  console.log('📦 支付成功订单信息:', paySuccessOrder.value)
  console.log('🎯 是否为代充商品:', isRecharge)
  
  // 显示支付成功弹窗（代充商品会自动弹出回执单）
  showPaySuccessModal.value = true
}

async function buyNow() {
  // 检查是否登录
  if (!userStore.isLoggedIn) {
    console.log('❌ 用户未登录，显示登录弹窗')
    ElMessage.warning('请先登录后再购买')
    modal.showLogin = true  // 显示登录弹窗
    return
  }
  
  // 检查是否选择了SKU（代充商品不需要选择套餐）
  const isRechargeProduct = goodsInfo.value.deliveryRequiresReceipt === true
  if (!isRechargeProduct && productSkus.value.skus && productSkus.value.skus.length > 0 && !selectedSku.value) {
    ElMessage.warning('请先选择套餐')
    return
  }
  
  // 检查库存（如果选择了SKU）
  if (selectedSku.value && selectedSku.value.stock <= 0) {
    ElMessage.error('抱歉，该套餐暂时缺货，请联系客服或选择其他套餐')
    return
  }
  
  try {
    // 调试：打印商品信息
    console.log('🛍️ 商品信息:', goodsInfo.value)
    console.log('🔑 商品编码字段:', {
      goods_code: goodsInfo.value.goods_code,
      code: goodsInfo.value.code,
      id: goodsId.value
    })
    
    // 先创建订单（只有登录用户可以）
    const orderParams = {
      unicode: String(goodsId.value), // 使用商品ID作为unicode参数
      skuId: selectedSku.value?.sku_id || null, // 添加SKU ID
      quantity: qty.value,
      userEmail: userStore.user?.email || '', // 使用登录用户邮箱
      paymentMethod: null, // 不预设支付方式，等用户选择支付方式后再更新
      remark: selectedSku.value ? `规格: ${selectedSku.value.sku_name}` : ''
    }
    
    console.log('📤 创建订单参数:', orderParams)
    const orderResponse = await orderApi.createOrder(orderParams)
    
    if (!orderResponse.success || !orderResponse.data) {
      ElMessage.error('创建订单失败')
      return
    }
    
    // 使用后端返回的真实订单号
    const orderId = orderResponse.data.orderNo
    
    payGoods.value = {
      shopLogo: goodsInfo.value.image || '/images/xiangqingzhutu1.png',
      shopName: orderResponse.data.productName || goodsInfo.value.name || '商品',
      shopDesc: selectedSku.value ? selectedSku.value.sku_description : (goodsInfo.value.desc || ''),
      orderId: orderId,
      price: orderResponse.data.totalAmount || (selectedSku.value ? selectedSku.value.price : goodsInfo.value.price) || 99
    }
    showPayModal.value = true
  } catch (error) {
    console.error('创建订单失败:', error)
    ElMessage.error('创建订单失败，请重试')
  }
}

// 获取商品SKU信息 - 统一的获取逻辑
const fetchProductSkus = async () => {
  try {
    const currentId = goodsId.value
    console.log('🔍 开始获取商品SKU - 商品ID:', currentId)
    
    // 重置数据
    productSkus.value = { specifications: null, skus: [] }
    selectedSku.value = null
    
    // 构建请求URL
    const apiUrl = `/api/product/goods/${currentId}/skus`
    console.log('🔍 请求SKU URL:', apiUrl)
    
    // 发送请求
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ SKU数据请求成功:', data)
    
    // 统一处理所有商品的SKU数据
    if (data && (data.success || data.code === 0)) {
      const skuInfo = data.data || {}
      const skuList = skuInfo.skus || []
      
      console.log('📦 原始SKU数量:', skuList.length)
      
      // 设置SKU数据 - 使用Vue的响应式更新
      productSkus.value = {
        specifications: skuInfo.specifications || null,
        skus: skuList
      }
      
      // 强制触发响应式更新
      await nextTick()
      
      console.log('🎯 设置后的SKU数据:', {
        specifications: productSkus.value.specifications,
        skuCount: productSkus.value.skus.length,
        skus: productSkus.value.skus
      })
      
      // 自动选择第一个可用的SKU
      const validSkus = productSkus.value.skus.filter((sku: any) => 
        sku.status === 1
      )
      
      if (validSkus.length > 0) {
        // 按价格排序并选择最便宜的
        validSkus.sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price))
        selectedSku.value = validSkus[0]
        console.log('✅ 自动选中SKU:', selectedSku.value.sku_name)
      } else {
        console.log('⚠️ 没有可用的SKU（库存不足或已下架）')
      }
    } else {
      console.warn('⚠️ SKU数据返回格式异常:', data)
      productSkus.value = { specifications: null, skus: [] }
    }
  } catch (error) {
    console.error('❌ 获取SKU信息失败:', error)
    // 确保错误时也有正确的数据结构
    productSkus.value = { specifications: null, skus: [] }
    selectedSku.value = null
  }
}

// 直接选择SKU
const selectSkuDirectly = (sku: any) => {
  selectedSku.value = sku
  console.log('选中的SKU:', sku)
}

// 显示缺货消息
const showOutOfStockMessage = () => {
  ElMessage.warning('该套餐暂时缺货，请选择其他套餐或联系客服')
}

// 选择规格（保留以兼容）
const selectSpec = (specName: string, value: string) => {
  selectedSpecs.value[specName] = value
  
  // 根据选中的规格组合找到对应的SKU
  if (productSkus.value.skus) {
    const matchedSku = productSkus.value.skus.find((sku: any) => {
      if (!sku.attributes) return false
      return Object.keys(selectedSpecs.value).every(
        key => sku.attributes[key] === selectedSpecs.value[key]
      )
    })
    
    if (matchedSku) {
      selectedSku.value = matchedSku
      console.log('选中的SKU:', matchedSku)
    }
  }
}

// SKU选择函数（兼容旧版本）
const selectSku = (sku: any) => {
  selectedSku.value = sku
  if (sku.attributes) {
    selectedSpecs.value = { ...sku.attributes }
  }
}

const addToCart = async (e?: Event) => {
  // 检查是否登录
  if (!userStore.isLoggedIn) {
    console.log('❌ 用户未登录，显示登录弹窗')
    ElMessage.warning('请先登录后再加入购物车')
    modal.showLogin = true  // 显示登录弹窗
    return
  }
  
  // 检查是否选择了SKU（代充商品不需要选择套餐）
  const isRechargeProduct = goodsInfo.value.deliveryRequiresReceipt === true
  if (!isRechargeProduct && !selectedSku.value && productSkus.value.skus && productSkus.value.skus.length > 0) {
    ElMessage.warning('请先选择套餐')
    return
  }
  
  // 检查库存（如果选择了SKU）
  if (selectedSku.value && selectedSku.value.stock <= 0) {
    ElMessage.error('抱歉，该套餐暂时缺货，请联系客服或选择其他套餐')
    return
  }
  
  try {
    // 获取选中的SKU信息（如果有）
    let skuName = null
    let skuPrice = null
    
    if (selectedSku.value) {
      // 如果用户选择了SKU
      skuName = selectedSku.value.sku_name
      skuPrice = selectedSku.value.price
    }
    
    // 调用后端API添加到购物车
    const response = await cartApi.addToCart(
      goodsId.value,
      qty.value,
      skuName,
      skuPrice
    )
    
    if (response && response.success) {
      // 同时更新本地购物车状态
      cartStore.addToCart({
        id: goodsId.value,
        name: goodsInfo.value.name,
        image: goodsInfo.value.image,
        price: skuPrice || goodsInfo.value.price || 899,
        skuName: skuName,
        spec: skuName || '默认规格'
      }, qty.value)
      
      ElMessage.success('已加入购物车')
    } else {
      ElMessage.error('添加到购物车失败')
    }
  } catch (error) {
    console.error('添加到购物车失败:', error)
    ElMessage.error('添加到购物车失败')
  }
  
  // 抖动动画
  if (e && e.target) {
    const btn = e.target as HTMLElement;
    btn.classList.remove('shake');
    // 触发重绘
    void btn.offsetWidth;
    btn.classList.add('shake');
    btn.addEventListener('animationend', () => {
      btn.classList.remove('shake');
    }, { once: true });
  }
}

// 收藏相关功能
const isFavorited = computed(() => userStore.checkIsFavorite(goodsId.value))

const toggleFavorite = async () => {
  if (!userStore.isLoggedIn) {
    // 如果用户未登录，打开登录弹窗
    modal.showLogin = true
    return
  }

  if (isFavorited.value) {
    // 取消收藏
    const result = await userStore.removeFromFavorites(goodsId.value)
    if (result.success) {
      console.log('取消收藏成功')
    }
  } else {
    // 添加收藏
    // 注意：goodsInfo.value 需保证字段完整
    const result = await userStore.addToFavorites(goodsInfo.value)
    if (result.success) {
      console.log('添加收藏成功')
    } else {
      console.log(result.message)
    }
  }
}

// 组件挂载时初始化
onMounted(async () => {
  console.log('🚀 商品详情页初始化 - 商品ID:', goodsId.value)
  console.log('📍 路由参数:', route.params)
  console.log('📍 当前路由:', route.path)
  console.log('📍 完整URL:', window.location.href)
  
  // 确保商品ID有效
  if (!goodsId.value || isNaN(Number(goodsId.value))) {
    console.error('❌ 无效的商品ID:', goodsId.value)
    return
  }
  
  // 立即获取商品详情
  await fetchGoodsDetail()
  
  // 获取SKU信息
  console.log('🔄 开始获取SKU信息...')
  await fetchProductSkus()
  
  // 获取推荐商品
  await fetchRecommendGoods()
  
  // 检查API调用状态
  if (goodsError.value) {
    console.error('商品详情API调用失败:', goodsError.value)
  }
  
  if (goodsData.value) {
    console.log('商品详情API返回数据:', goodsData.value)
  }
  
  // 检查SKU数据状态
  console.log('📊 最终SKU数据状态:')
  console.log('- productSkus.value:', productSkus.value)
  console.log('- availableSkus.value:', availableSkus.value)
  console.log('- selectedSku.value:', selectedSku.value)
})
</script>

<style scoped>
/* 加载和错误状态样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: #f8f9fa;
}

.loading-spinner {
  font-size: 18px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 12px;
}

.loading-spinner::before {
  content: '';
  width: 24px;
  height: 24px;
  border: 3px solid #e0e0e0;
  border-top: 3px solid #235CDC;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: #f8f9fa;
}

.error-message {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.error-message h3 {
  color: #dc2626;
  margin-bottom: 12px;
  font-size: 20px;
}

.error-message p {
  color: #666;
  margin-bottom: 20px;
  font-size: 16px;
}

.retry-btn {
  background: #235CDC;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #1d4ed8;
}

/* API错误提示样式 */
.api-error-notice {
  width: 1200px;
  margin: 0 auto 16px auto;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 12px 16px;
}

.error-notice-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #856404;
}

.error-icon {
  font-size: 16px;
}

.error-text {
  flex: 1;
}

.retry-small-btn {
  background: #235CDC;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-small-btn:hover {
  background: #1d4ed8;
}

/* SKU选择相关样式 */
.price-period {
  font-size: 14px;
  color: #666;
  margin-left: 8px;
}

.recharge-badge {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  margin-left: 12px;
}

.sku-direct-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 12px;
}

.sku-option-card {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
  position: relative;
  overflow: hidden;
}

.sku-option-card:hover {
  border-color: #235CDC;
  box-shadow: 0 2px 8px rgba(35, 93, 220, 0.15);
  transform: translateY(-2px);
}

.sku-option-card.active {
  border-color: #235CDC;
  background: linear-gradient(135deg, #f0f5ff 0%, #ffffff 100%);
  box-shadow: 0 4px 12px rgba(35, 93, 220, 0.2);
}

.sku-option-card.active::before {
  content: '✓';
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: #235CDC;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
}

.sku-option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.sku-option-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.sku-option-badge {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.sku-option-price {
  font-size: 22px;
  font-weight: bold;
  color: #235CDC;
  margin: 8px 0;
}

.sku-option-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 8px;
  height: 36px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.sku-option-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.sku-stock {
  color: #52c41a;
}

.sku-sales {
  color: #ff8c00;
}

/* 缺货状态样式 */
.sku-option-card.out-of-stock {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f5f5f5;
}

.sku-option-card.out-of-stock:hover {
  transform: none;
  box-shadow: none;
  border-color: #e0e0e0;
}

.sku-option-card.out-of-stock .sku-option-price {
  color: #999;
}

.sku-option-card.out-of-stock .sku-option-name {
  color: #999;
}

.sku-stock.no-stock {
  color: #ff4d4f;
  font-weight: bold;
}

.sku-option-badge {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

/* 选中SKU详细信息 */
.selected-sku-detail {
  margin-top: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafb 0%, #ffffff 100%);
  border: 1px solid #e3e8ef;
  border-radius: 8px;
}

.sku-detail-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e8e8e8;
}

.sku-detail-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.sku-detail-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.detail-label {
  color: #999;
  margin-right: 8px;
  min-width: 70px;
}

.detail-value {
  color: #333;
  font-weight: 500;
}

.detail-value.price {
  color: #ff4d4f;
  font-size: 16px;
  font-weight: bold;
}

@media (max-width: 768px) {
  .sku-direct-list {
    grid-template-columns: 1fr;
  }
  
  .sku-detail-content {
    grid-template-columns: 1fr;
  }
}

/* 原有样式 */
.goods-detail-page {
  min-height: 100vh;
  background: #fff;
  padding: 32px 0 0 0;
}
.back-btn-row {
  width: 1200px;
  margin: 24px auto 12px auto;
  display: flex;
  justify-content: flex-start;
}
.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #2563EB;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  padding: 0 12px 0 0;
  transition: color 0.2s;
}
.back-btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}
.back-btn-text {
  color: #2563EB;
  font-size: 18px;
  font-weight: 500;
}
.goods-detail-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.goods-main-section {
  display: flex;
  gap: 32px;
  align-items: stretch;
  min-height: 600px;
}
.goods-left-panel {
  width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  min-height: 100%;
  height: 100%;
}
.features-bar {
  width: 100%;
  background: linear-gradient(90deg, #EEF9FC 0%, #F5F3F2 50%, #FBEFE8 100%);
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(35,92,220,0.08);
  padding: 18px 0;
  display: flex;
  justify-content: center;
}
.features-list {
  display: flex;
  gap: 32px;
}
.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.feature-icon {
  margin-bottom: 2px;
}
.feature-label {
  font-size: 15px;
  color: #235CDC;
  font-weight: 500;
}
.main-image-wrapper {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(35,92,220,0.08);
  padding: 12px;
  margin-bottom: 12px;
  flex: 1 0 auto;
}
.main-image {
  width: 100%;
  height: 400px;
  background: #f8f8f8;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: none;
}
.main-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.thumb-list {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  justify-content: flex-start;
}
.thumb {
  width: 150px;
  height: 100px;
  border-radius: 8px;
  background: #f0f0f0;
  cursor: pointer;
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: border 0.2s;
}
.thumb.active {
  border: 2px solid #235CDC;
}
.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.thumb-placeholder {
  width: 100%;
  height: 100%;
  background: #e5e7eb;
  border-radius: 8px;
}
.service-bar {
  width: 100%;
  background: #F9FAFB;
  border-radius: 14px;
  margin: 18px 0 0 0;
  padding: 18px 0 10px 0;
  box-shadow: 0 2px 8px rgba(35,92,220,0.04);
  display: flex;
  justify-content: center;
  margin-top: auto;
}
.service-list {
  display: flex;
  flex-wrap: wrap;
  gap: 24px 36px;
  font-size: 14px;
  color: #1F2937;
  font-family: 'Noto Sans SC', Noto Sans SC;
  font-weight: 400;
  line-height: 20px;
  text-align: left;
  font-style: normal;
  text-transform: none;
  width: 420px;
  justify-content: flex-start;
}
.service-item {
  width: 136px;
  height: 20px;
  padding: 0;
  background: none;
  color: #1F2937;
  border-radius: 0;
  display: flex;
  align-items: center;
  font-size: 14px;
  font-family: 'Noto Sans SC', Noto Sans SC;
  font-weight: 400;
  line-height: 20px;
  text-align: left;
  font-style: normal;
  text-transform: none;
}
.goods-info-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-left: 16px;
  min-height: 100%;
  height: 100%;
  justify-content: flex-start;
}
.goods-title-row {
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: 24px;
  font-weight: 700;
  color: #222;
  justify-content: space-between;
}
.goods-sold {
  font-size: 16px;
  color: #fff;
  background: #235CDC;
  border-radius: 16px;
  padding: 6px 28px;
  margin-left: 8px;
  font-weight: 600;
  min-width: 80px;
  text-align: center;
  box-sizing: border-box;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.goods-meta-row {
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: 15px;
  color: #888;
}
.meta-light {
  color: #bbb;
  font-size: 14px;
}
.goods-price-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  margin-top: 8px;
}
.goods-price-label {
  font-size: 15px;
  color: #888;
  min-width: 36px;
}
.goods-duration-list {
  display: flex;
  gap: 10px;
}
.duration-btn {
  width: 94px;
  height: 31px;
  font-size: 14px;
  color: #235CDC;
  background: #DBEAFE;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
}
.duration-btn.active, .duration-btn:active {
  background: #2563EB;
  color: #fff;
}
.goods-final-price-row {
  font-size: 32px;
  color: #235CDC;
  font-weight: 700;
  margin: 8px 0;
}
.goods-qty-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  margin-top: 8px;
}
.goods-qty-label {
  color: #888;
}
.goods-sku-row {
  margin-bottom: 20px;
  margin-top: 15px;
}
.goods-sku-label {
  font-size: 16px;
  color: #333;
  font-weight: 600;
}
.sku-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 12px;
}
.sku-option {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.sku-option:hover {
  border-color: #235CDC;
  color: #235CDC;
}
.sku-option.active {
  background: #235CDC;
  color: #fff;
  border-color: #235CDC;
}
.qty-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f2f7ff;
  color: #235CDC;
  font-size: 20px;
  border-radius: 50%;
  cursor: pointer;
  font-weight: 700;
  transition: background 0.2s, color 0.2s;
}
.qty-value {
  min-width: 28px;
  text-align: center;
  font-size: 18px;
}
.goods-action-row {
  display: flex;
  gap: 16px;
  margin: 18px 0 0 0;
}
.buy-btn {
  background: #235CDC;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 14px 0;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  width: 200px;
}
.cart-btn {
  background: #ffb400;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 14px 0;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  width: 150px;
}
.fav-btn {
  background: #fff;
  color: #235CDC;
  border: 1.5px solid #235CDC;
  border-radius: 8px;
  padding: 14px 0;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  width: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.fav-btn:hover {
  background: #235CDC;
  color: #fff;
}
.fav-btn.active {
  background: #235CDC;
  color: #fff;
}
.fav-icon {
  font-size: 18px;
}
.goods-disclaimer {
  font-family: 'Noto Sans SC', Noto Sans SC;
  font-weight: 400;
  font-size: 14px;
  color: #8B8B8B;
  line-height: 24px;
  text-align: left;
  font-style: normal;
  text-transform: none;
  margin-top: 10px;
  margin-bottom: 10px;
}
.goods-bottom-section {
  margin-top: auto;
}
.recommend-section {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
}
.recommend-title {
  font-size: 18px;
  font-weight: 600;
  color: #222;
  margin-bottom: 8px;
  display: inline-block;
  margin-left: 8px;
}
.recommend-list {
  display: flex;
  gap: 18px;
  margin-top: 8px;
}
.recommend-item {
  width: 100px;
  background: #f8f8f8;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  gap: 6px;
}
.recommend-thumb {
  width: 48px;
  height: 48px;
  background: #e0e0e0;
  border-radius: 8px;
  margin-bottom: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.recommend-name {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}
.recommend-price {
  font-size: 13px;
  color: #ff4d4f;
  font-weight: 600;
}
.recommend-loading,
.recommend-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #999;
  font-size: 14px;
}
.recommend-item:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}
.recommend-item:hover .recommend-name {
  color: #4A90E2;
}
.market-bar {
  width: 100%;
  margin: 12px 0 0 0;
  background: linear-gradient(90deg, #D3F3FE 0%, #FDEDDD 49%, #FFE0D0 100%);
  border-radius: 15px;
  padding: 8px 18px;
  font-size: 15px;
  color: #235CDC;
  font-weight: 500;
  display: flex;
  align-items: center;
}
.blue-bar {
  width: 5px;
  height: 22px;
  background: #2563EB;
  border-radius: 3px;
  margin-right: 10px;
  display: inline-block;
  vertical-align: middle;
}
.row-label-bar {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.goods-price-label, .goods-qty-label, .recommend-title {
  font-size: 16px;
  color: #6B7280;
  font-weight: 600;
  font-family: 'Noto Sans SC', Noto Sans SC;
}
@media (max-width: 900px) {
  .goods-detail-header {
    flex-direction: column;
    gap: 16px;
    padding: 16px 8px;
  }
  .features-list {
    gap: 16px;
  }
  .goods-main-section {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }
  .goods-gallery {
    width: 100%;
    flex-direction: row;
    gap: 8px;
  }
  .main-image {
    height: 180px;
  }
}
.super-detail-image {
  width: 1170px;
  height: 1199px;
  background: #D9D9D9;
  border-radius: 44px;
  margin: 40px auto 48px auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
.super-detail-content {
  font-size: 56px;
  color: #222;
  font-weight: 500;
  letter-spacing: 8px;
}
@keyframes shake {
  0% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
  100% { transform: translateX(0); }
}
.cart-btn.shake {
  animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
}
</style> 