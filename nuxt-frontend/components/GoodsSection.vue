<template>
  <section class="goods-section">
    <div class="goods-inner">
      <!-- 顶部Tab/按钮区 -->
      <div class="goods-tabs-wrap">
        <div class="goods-tabs">
          <div v-for="(tab, idx) in tabs" :key="tab.key" :class="['goods-tab', { active: tab.key === activeTab }]" @click="selectTab(tab.key)">
            <div class="tab-icon"></div>
            <div class="tab-label">{{ tab.label }}</div>
          </div>
        </div>
        <div class="tab-underline" :style="underlineStyle"></div>
      </div>
      <!-- 商品网格区 -->
      <div class="goods-grid">
        <div v-for="(goods, index) in filteredGoods" :key="goods.id" class="goods-card" @click="goToDetail(goods)" style="cursor: pointer;">
          <div v-if="goods.status === 1" class="goods-hot-tag">热卖</div>
          
          <!-- 默认布局 -->
          <div class="goods-default-layout">
            <div class="goods-image special-image">
              <img :src="goods.image || '/images/netflix.png'" :alt="goods.name" class="special-img" />
            </div>
            <div class="goods-info">
              <div class="goods-title-row2">
                <span class="goods-name2">{{ goods.name }}</span>
                <span class="goods-recent">🕒 XX分钟前购买过</span>
                <span class="goods-help"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#EDF3FF"/><text x="8" y="12" text-anchor="middle" font-size="12" fill="#235CDC">?</text></svg></span>
              </div>
              <div class="goods-meta2">
                <span class="goods-price-label">券后</span><span class="goods-price2">{{ getDisplayPrice(goods) }}</span><span class="goods-price-unit">/{{ goods.add_unit || '12个月' }}</span>
              </div>
              <div class="goods-sales-row2">
                <span>销量: {{ goods.sales || '2.5万+' }}</span>
                <span>好评: 98%</span>
              </div>
              <div class="goods-features2 special-features">
                <!-- 动态显示商品标签 -->
                <span 
                  v-for="(tag, idx) in getGoodsTags(goods)" 
                  :key="idx"
                  class="goods-feature2"
                >
                  {{ tag }}
                </span>
                <!-- 如果没有标签，显示默认标签 -->
                <span v-if="!getGoodsTags(goods).length" class="goods-feature2">热销商品</span>
              </div>
              <!-- 根据后台配置显示折扣 -->
              <div v-if="shouldShowDiscount()" class="goods-promo2 special-promo">
                <div v-if="activeDiscount" class="discount-badge">
                  <span class="discount-text">{{ getDiscountText() }}</span>
                </div>
                <OptimizedImage
                  v-else
                  src="/images/cut.png"
                  alt="限时优惠"
                  title="限时优惠"
                  :width="60"
                  :height="20"
                  loading="lazy"
                  class="cut-img"
                />
              </div>
            </div>
          </div>

          <!-- 悬停时的特殊布局 -->
          <div class="goods-hover-layout">
            <!-- 顶部logo和图标区域 -->
            <div class="hover-header">
              <div class="hover-app-icon">
                <img :src="goods.image || '/images/netflix.png'" :alt="goods.name || goods.title" class="hover-icon-img" />
              </div>
            </div>
            
            <!-- 应用信息区域 -->
            <div class="hover-app-info">
              <div class="hover-app-name">{{ goods.name || goods.title }}</div>
              <div class="hover-app-meta">
                <div class="hover-user-avatars">
                  <img src="/images/head1.png" alt="用户1" class="hover-avatar" />
                  <img src="/images/head2.png" alt="用户2" class="hover-avatar" />
                  <img src="/images/head3.png" alt="用户3" class="hover-avatar" />
                </div>
                <span class="hover-purchased-text">谁购买过</span>
                <div class="hover-verified-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="10" fill="#235CDC"/>
                    <text x="10" y="14" text-anchor="middle" font-size="12" fill="white">?</text>
                  </svg>
                </div>
              </div>
            </div>

            <!-- 价格区域 -->
            <div class="hover-price-section">
              <span class="hover-price-label">券后</span>
              <span class="hover-price-number">{{ getDisplayPrice(goods) }}</span>
              <span class="hover-price-unit">/{{ goods.add_unit || '12个月' }}</span>
            </div>

            <!-- 销量和好评区域 -->
            <div class="hover-stats">
              <span class="hover-sales">销量: {{ goods.sales || '2.5万+' }}</span>
              <span class="hover-rating">好评: 98%</span>
            </div>

            <!-- 功能标签区域 -->
            <div class="hover-features">
              <!-- 动态显示商品标签 -->
              <span 
                v-for="(tag, idx) in getGoodsTags(goods)" 
                :key="idx"
                class="hover-feature-tag"
                :class="getTagClass(tag)"
              >
                {{ tag }}
              </span>
              <!-- 如果没有标签，显示默认标签 -->
              <span v-if="!getGoodsTags(goods).length" class="hover-feature-tag">热销商品</span>
            </div>

            <!-- 购买按钮 -->
            <div class="hover-buy-section">
              <button class="hover-buy-btn" @click.stop="buyNow(goods)">购买</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <OrderPayModal
      v-if="showPayModal"
      :shopLogo="payGoods.shopLogo"
      :shopName="payGoods.shopName"
      :shopDesc="payGoods.shopDesc"
      :orderId="payGoods.orderId"
      :price="payGoods.price"
      :countdown="payCountdown"
      @close="showPayModal = false"
      @timeout="handlePayTimeout"
      @paySuccess="handlePaySuccess"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import type { Goods } from '@/types/api'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useModalStore } from '@/stores/modal'
import OrderPayModal from './OrderPayModal.vue'
import { orderApi } from '@/api/order'
import { $fetch } from 'ofetch'

const props = defineProps<{ goodsList: Goods[] }>()
const userStore = useUserStore()
const modalStore = useModalStore()

// 当前活动的折扣信息
const activeDiscount = ref<any>(null)

// 顶部Tab按钮数据 - 对应后端分类ID
const tabs = [
  { key: 'all', label: '全部', categoryId: null },
  { key: 'video', label: '视频音乐', categoryId: 3 },
  { key: 'vtuber', label: 'Vtuber', categoryId: 4 },
  { key: 'recharge', label: '代充代付', categoryId: 8 },
  { key: 'game', label: '游戏', categoryId: 9 },
  { key: 'card', label: '卡券', categoryId: 10 },
  { key: 'welfare', label: '福利社', categoryId: 11 }
]
const activeTab = ref('all')
function selectTab(key: string) {
  activeTab.value = key
  nextTick(updateUnderline)
}
const activeTabIndex = computed(() => tabs.findIndex(t => t.key === activeTab.value))

// 下划线动态宽度与位置
const tabRefs = ref<HTMLElement[]>([])
const underlineStyle = ref({ left: '0px', width: '120px' })
function updateUnderline() {
  nextTick(() => {
    const activeIndex = activeTabIndex.value
    const el = tabRefs.value && tabRefs.value.length > activeIndex ? tabRefs.value[activeIndex] : null
    if (el) {
      const icon = el.querySelector('.tab-icon') as HTMLElement
      if (icon) {
        const parentRect = el.parentElement!.getBoundingClientRect()
        const iconRect = icon.getBoundingClientRect()
        underlineStyle.value = {
          left: `${iconRect.left - parentRect.left}px`,
          width: `${iconRect.width}px`
        }
      }
    }
  })
}
// 获取当前有效的折扣活动
const fetchActiveDiscount = async () => {
  try {
    const apiBase = process.client ? (window.location.hostname === 'localhost' ? 'http://localhost:3002' : '') : 'http://localhost:3002'
    const res = await $fetch(`${apiBase}/api/discount/active`)
    if (res.success && res.data) {
      activeDiscount.value = res.data
      console.log('当前活动折扣:', activeDiscount.value)
    }
  } catch (error) {
    console.error('获取折扣活动失败:', error)
  }
}

onMounted(() => {
  updateUnderline()
  fetchActiveDiscount()
})

// 根据选中的tab过滤商品
const filteredGoods = computed(() => {
  const activeTabData = tabs.find(t => t.key === activeTab.value)
  if (!activeTabData) return props.goodsList
  
  // 如果选择"全部"，返回所有商品
  if (activeTabData.categoryId === null) {
    return props.goodsList
  }
  
  // 根据categoryId筛选商品（兼容categoryCode字段）
  return props.goodsList.filter(goods => {
    // 商品的categoryId或categoryCode可能是数字或字符串，需要转换后比较
    const goodsCategoryId = Number(goods.categoryId || goods.categoryCode)
    return goodsCategoryId === activeTabData.categoryId
  })
})

// 获取商品标签
const getGoodsTags = (goods: any) => {
  // 优先从attributes字段获取tags
  if (goods.attributes && goods.attributes.tags) {
    // 如果tags是字符串，尝试解析
    if (typeof goods.attributes.tags === 'string') {
      try {
        return JSON.parse(goods.attributes.tags)
      } catch {
        // 如果解析失败，按逗号分割
        return goods.attributes.tags.split(',').map((tag: string) => tag.trim())
      }
    }
    // 如果tags是数组，直接返回
    if (Array.isArray(goods.attributes.tags)) {
      return goods.attributes.tags
    }
  }
  
  // 如果attributes是字符串，尝试解析
  if (typeof goods.attributes === 'string') {
    try {
      const attrs = JSON.parse(goods.attributes)
      if (attrs.tags) {
        if (Array.isArray(attrs.tags)) {
          return attrs.tags
        }
        if (typeof attrs.tags === 'string') {
          return attrs.tags.split(',').map((tag: string) => tag.trim())
        }
      }
    } catch {
      // 解析失败，返回空数组
    }
  }
  
  // 如果有tags字段（兼容旧数据）
  if (goods.tags) {
    if (Array.isArray(goods.tags)) {
      return goods.tags
    }
    if (typeof goods.tags === 'string') {
      return goods.tags.split(',').map((tag: string) => tag.trim())
    }
  }
  
  // 返回默认标签（可根据商品类型生成）
  const defaultTags = []
  if (goods.quality === '4K' || goods.name?.includes('4K')) {
    defaultTags.push('4K高清')
  }
  if (goods.region === '全球' || goods.name?.includes('全球')) {
    defaultTags.push('全球解锁')
  }
  if (goods.duration === '月' || goods.duration === '1个月') {
    defaultTags.push('单月起售')
  }
  // 最多返回4个标签
  return defaultTags.slice(0, 4)
}

// 获取标签的CSS类（用于悬停状态的标签样式）
const getTagClass = (tag: string) => {
  // 根据标签内容返回对应的CSS类
  if (tag.includes('全球') || tag.includes('解锁')) return 'feature-global'
  if (tag.includes('4K') || tag.includes('高清')) return 'feature-4k'
  if (tag.includes('杜比') || tag.includes('音效')) return 'feature-dolby'
  if (tag.includes('月') || tag.includes('起售')) return 'feature-monthly'
  return '' // 默认样式
}

// 获取显示价格（统一价格显示逻辑）
const getDisplayPrice = (goods: any) => {
  // 优先使用后端计算的最低SKU价格
  if (goods.min_sku_price !== undefined && goods.min_sku_price !== null) {
    return goods.min_sku_price
  }
  
  // 如果商品有SKU信息，显示最低SKU价格
  if (goods.skus && Array.isArray(goods.skus) && goods.skus.length > 0) {
    // 过滤出有效的SKU（状态为1且有库存）
    const validSkus = goods.skus.filter((sku: any) => 
      sku.status === 1 && sku.stock > 0
    )
    
    if (validSkus.length > 0) {
      // 按价格排序，返回最低价格
      const sortedSkus = validSkus.sort((a: any, b: any) => 
        parseFloat(a.price) - parseFloat(b.price)
      )
      return sortedSkus[0].price
    }
  }
  
  // 如果有min_price字段，使用它
  if (goods.min_price !== undefined && goods.min_price !== null) {
    return goods.min_price
  }
  
  // 否则使用默认price字段
  return goods.price || '0.00'
}

// 立即购买功能
const showPayModal = ref(false)
const payGoods = ref<any>(null)
const payCountdown = 900 // 15分钟
const buyNow = async (goods: any) => {
  // 检查用户是否已登录
  if (!userStore.isLoggedIn) {
    console.log('🔐 用户未登录，打开登录弹窗')
    modalStore.openLogin()
    return
  }
  
  console.log('💳 用户已登录，准备创建订单')
  console.log('🛍️ 商品数据:', goods)
  console.log('🔑 可用的商品编码字段:', {
    goods_code: goods.goods_code,
    code: goods.code,
    unicode: goods.unicode,
    id: goods.id
  })
  
  try {
    // 创建订单
    const orderParams = {
      unicode: goods.goods_code || goods.code || goods.unicode || String(goods.id), // 使用商品编码
      quantity: 1, // 默认购买1个
      price: getDisplayPrice(goods)
    }
    
    console.log('📝 创建订单参数:', orderParams)
    const orderResult = await orderApi.createOrder(orderParams)
    
    if (orderResult.success && orderResult.data) {
      console.log('✅ 订单创建成功:', orderResult.data)
      
      // 设置支付信息，包含订单ID
      payGoods.value = {
        ...goods,
        orderId: orderResult.data.orderNo || orderResult.data.id, // 使用订单号
        shopLogo: goods.logo || '/images/shop-logo.png',
        shopName: goods.shopName || '某旗舰店',
        shopDesc: goods.shopDesc || ''
      }
      
      // 打开支付弹窗
      showPayModal.value = true
    } else {
      console.error('❌ 创建订单失败:', orderResult)
      alert(orderResult.msg || '创建订单失败，请重试')
    }
  } catch (error) {
    console.error('❌ 创建订单异常:', error)
    alert('创建订单失败，请重试')
  }
}
function handlePayClose() {
  showPayModal.value = false
}
function handlePayTimeout() {
  showPayModal.value = false
  // 可在此处触发订单取消逻辑
}

const router = useRouter()
const goToDetail = (goods: Goods) => {
  router.push(`/goods/${goods.id}`)
}

// 判断是否显示折扣
const shouldShowDiscount = () => {
  // 如果有活动折扣，显示活动折扣
  // 如果没有活动但想保留原有的图片，也返回true
  return true // 始终显示折扣区域
}

// 获取折扣文字
const getDiscountText = () => {
  if (!activeDiscount.value) return ''
  
  if (activeDiscount.value.discount_type === 'percentage') {
    const discount = activeDiscount.value.discount_value / 10
    return `限时${discount}折`
  } else {
    return `立减¥${activeDiscount.value.discount_value}`
  }
}

// 计算折扣后的价格
const getDiscountedPrice = (originalPrice: number) => {
  if (!activeDiscount.value) return originalPrice
  
  let discountAmount = 0
  if (activeDiscount.value.discount_type === 'percentage') {
    discountAmount = originalPrice * (100 - activeDiscount.value.discount_value) / 100
  } else {
    discountAmount = activeDiscount.value.discount_value
  }
  
  // 应用最高折扣限制
  if (activeDiscount.value.max_discount_amount && discountAmount > activeDiscount.value.max_discount_amount) {
    discountAmount = activeDiscount.value.max_discount_amount
  }
  
  const finalPrice = originalPrice - discountAmount
  return Math.max(0, finalPrice).toFixed(2)
}

// 支付成功处理
const handlePaySuccess = (paymentInfo: any) => {
  console.log('🛒 商品列表页支付成功！', paymentInfo)
  
  // 不再在前端创建虚拟订单，订单应该由后端创建
  alert(`🎉 支付成功！\n商品：${payGoods.value?.name || payGoods.value?.title}\n订单号：${paymentInfo.orderId}\n金额：¥${paymentInfo.amount}`)
  
  // 关闭支付弹窗
  showPayModal.value = false
}
</script>

<style scoped>
.goods-section {
  width: 100vw;
  min-width: 1211px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin-bottom: 40px;
}
.goods-inner {
  width: 1211px;
  min-height: 997px;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.goods-tabs-wrap {
  width: 100%;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 24px 0px rgba(35,92,220,0.06);
  padding: 24px;
  margin-bottom: 32px;
  position: relative;
  display: flex;
  justify-content: center;
}
.goods-tabs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  position: relative;
  z-index: 2;
  flex-wrap: wrap;
}
.goods-tab {
  min-width: 100px;
  padding: 12px 24px;
  background: #fff;
  border-radius: 12px;
  border: 2px solid #e0e7ef;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  box-sizing: border-box;
}
.goods-tab:hover {
  border-color: #235CDC;
  background: #f6f9ff;
}
.goods-tab.active {
  border: 2px solid #235CDC;
  background: linear-gradient(135deg, #f6f9ff 0%, #e8f0ff 100%);
  box-shadow: 0 4px 16px 0px rgba(35,92,220,0.12);
}
.tab-icon {
  display: none;
}
.tab-label {
  font-size: 16px;
  color: #333;
  text-align: center;
  white-space: nowrap;
  font-weight: 500;
  letter-spacing: 0.5px;
}
.goods-tab:hover .tab-label {
  color: #235CDC;
}
.goods-tab.active .tab-label {
  color: #235CDC;
  font-weight: 600;
}
.tab-underline {
  display: none;
}
/* 商品区原有样式保留 */
.goods-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, 276px);
  grid-auto-rows: 381px;
  gap: 32px 27px;
  justify-content: center;
}
.goods-card {
  width: 276px;
  height: 381px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0px 5px 15px 0px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  transition: box-shadow 0.2s, transform 0.2s;
}
.goods-card:hover {
  box-shadow: 0px 12px 32px 0px rgba(0,0,0,0.12);
  transform: translateY(-4px) scale(1.02);
}
.goods-image {
  width: 100%;
  height: 120px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
}
.goods-image img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 12px;
}
.goods-info {
  flex: 1;
  padding: 18px 18px 12px 18px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.goods-title-row2 {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  margin-bottom: 4px;
}
.goods-name2 {
  font-size: 20px;
  font-weight: 600;
  color: #222;
  margin-right: 4px;
}
.goods-recent {
  font-size: 12px;
  color: #b0b0b0;
  margin-right: 2px;
}
.goods-help {
  display: flex;
  align-items: center;
  margin-left: 2px;
}
.goods-meta2 {
  font-size: 16px;
  margin-bottom: 4px;
  display: flex;
  align-items: baseline;
  gap: 2px;
}
.goods-price-label {
  color: #FF3B30;
  font-weight: bold;
  font-size: 16px;
}
.goods-price2 {
  color: #FF3B30;
  font-size: 22px;
  font-weight: bold;
  margin: 0 2px;
}
.goods-price-unit {
  color: #b0b0b0;
  font-size: 16px;
  font-weight: 500;
}
.goods-sales-row2 {
  font-size: 14px;
  color: #b0b0b0;
  margin-bottom: 8px;
  display: flex;
  gap: 24px;
}
.goods-features2 {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}
.goods-feature2 {
  border: 1px solid #e0e7ef;
  color: #b0b0b0;
  font-size: 14px;
  border-radius: 16px;
  padding: 4px 16px;
  background: #fff;
  font-weight: 500;
}
.goods-promo2 {
  margin-top: 8px;
  display: flex;
  align-items: center;
}
.promo-bg {
  background: linear-gradient(90deg, #FF7A45 0%, #FF3B30 100%);
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  border-radius: 0 0 20px 20px;
  padding: 6px 32px 6px 24px;
  position: relative;
  display: inline-flex;
  align-items: center;
}
.promo-fire {
  position: absolute;
  right: 0;
  bottom: 0;
}
.goods-hot-tag {
  position: absolute;
  left: 16px;
  top: 16px;
  background: #FF7A45;
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  border-radius: 10px;
  padding: 4px 14px;
  z-index: 2;
}
.special-image {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
}
.special-img {
  width: 115px;
  height: 113px;
  object-fit: contain;
  border-radius: 12px;
}
.special-features {
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
}
.special-promo {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 8px;
}
.cut-img {
  height: 40px;
  width: auto;
  display: block;
}

.discount-badge {
  background: linear-gradient(90deg, #FF7A45 0%, #FF3B30 100%);
  color: #fff;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  display: inline-block;
  box-shadow: 0 2px 8px rgba(255, 59, 48, 0.3);
}

.discount-text {
  letter-spacing: 1px;
}
.goods-default-layout {
  display: flex;
  flex-direction: column;
}
.goods-hover-layout {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #B8E6E1 0%, #F0F4F8 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 20px;
}
.goods-card:hover .goods-hover-layout {
  opacity: 1;
}
.hover-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
}
.hover-app-icon {
  width: 80px;
  height: 80px;
  background: #000;
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.hover-icon-img {
  width: 60px;
  height: 60px;
  object-fit: contain;
}
.hover-app-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 8px;
}
.hover-app-name {
  font-size: 18px;
  font-weight: 400;
  color: #000;
  margin-bottom: 6px;
}
.hover-app-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}
.hover-user-avatars {
  display: flex;
  gap: -2px;
  margin-right: 4px;
}
.hover-avatar {
  width: 20px;
  height: 20px;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid #fff;
}
.hover-purchased-text {
  font-size: 12px;
  color: #666;
  margin-right: 4px;
}
.hover-verified-icon {
  width: 16px;
  height: 16px;
  background: #235CDC;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.hover-price-section {
  display: flex;
  align-items: baseline;
  margin-bottom: 6px;
  gap: 2px;
}
.hover-price-label {
  font-size: 14px;
  color: #FF3B30;
  font-weight: bold;
}
.hover-price-number {
  font-size: 20px;
  color: #FF3B30;
  font-weight: bold;
}
.hover-price-unit {
  font-size: 12px;
  color: #999;
}
.hover-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
}
.hover-sales, .hover-rating {
  font-size: 12px;
  color: #666;
}
.hover-features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 8px 6px;
  justify-items: center;
  align-items: center;
  width: 100%;
  max-width: 200px;
  margin-bottom: 16px;
}
.hover-feature-tag {
  font-size: 12px;
  color: #666;
  padding: 4px 12px;
  background: #E8E8E8;
  border-radius: 16px;
  font-weight: 400;
  border: 1px solid #DDD;
}
.hover-buy-section {
  display: flex;
  justify-content: center;
  width: 100%;
}
.hover-buy-btn {
  width: 90%;
  padding: 12px 0;
  background: #235CDC;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  transition: background 0.2s;
}
.hover-buy-btn:hover {
  background: #1e4bb8;
}
/* 所有商品都有悬停效果 */
</style> 