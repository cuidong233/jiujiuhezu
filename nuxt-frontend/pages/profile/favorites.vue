<template>
        <div class="favorites-section">
          <div class="section-header">
            <h2 class="section-title">我的收藏</h2>
          </div>
          <div class="favorites-tabs">
            <div class="tab-item active">全部收藏</div>
            <div class="tab-item">Netflix</div>
            <div class="tab-item">Disney+</div>
            <div class="tab-item">HBO Max</div>
            <div class="tab-item">Apple TV+</div>
            <div class="tab-item">Hulu</div>
            <div class="tab-item">Prime Video</div>
          </div>
          
          <!-- 空状态 -->
          <div v-if="favorites.length === 0" class="empty-state">
            <div class="empty-icon">♡</div>
            <div class="empty-text">暂无收藏商品</div>
            <div class="empty-desc">去商品页面收藏喜欢的商品吧~</div>
            <button class="go-shopping-btn" @click="goShopping">去逛逛</button>
          </div>
          
          <!-- 收藏列表 -->
          <div v-else class="favorites-list">
            <div class="favorite-card" v-for="item in favorites" :key="item.id">
              <div class="card-header">
                <img :src="item.image" :alt="item.name" class="favorite-logo" />
                <span class="favorite-title">{{ item.name }}</span>
                <span v-if="item.hot" class="favorite-hot">热门</span>
              </div>
              <div class="favorite-desc">{{ item.desc }}</div>
              <div class="favorite-params">
                <div><span class="favorite-param-label">地区：</span><span class="favorite-param-value">{{ item.region }}</span></div>
                <div><span class="favorite-param-label">清晰度：</span><span class="favorite-param-value">{{ item.quality }}</span></div>
                <div><span class="favorite-param-label">设备数：</span><span class="favorite-param-value">{{ item.devices }}</span></div>
                <div><span class="favorite-param-label">支持下载：</span><span class="favorite-param-value">{{ item.download }}</span></div>
              </div>
              <div class="favorite-prices">
                <div 
                  class="price-item" 
                  v-for="(price, priceIndex) in item.prices" 
                  :key="price.label"
                  :class="{ selected: selectedPrices[item.id] === priceIndex }"
                  @click="selectPrice(item.id, priceIndex)"
                >
                  <span class="price-label">{{ price.label }}</span>
                  <span class="price-value">{{ price.value }}</span>
                </div>
              </div>
              <div class="favorite-actions">
                <button class="buy-btn" @click="buyNow(item)">立即购买</button>
                <button class="cancel-btn" @click="removeFavorite(item.id)">取消收藏</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 支付弹窗 -->
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
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import OrderPayModal from '@/components/OrderPayModal.vue'
import { favoriteApi } from '@/api/common'

const router = useRouter()
const userStore = useUserStore()
const userId = computed(() => userStore.user?.id || 1)
const favorites = ref<any[]>([])
const selectedPrices = ref<Record<number, number>>({})
const showPayModal = ref(false)
const payCountdown = 900
const payGoods = ref<any>({})

const fetchFavorites = async () => {
  const res = await favoriteApi.getFavorites(userId.value)
  if (res && res.data) favorites.value = res.data
}
onMounted(fetchFavorites)

const selectPrice = (itemId: number, priceIndex: number) => {
  selectedPrices.value[itemId] = priceIndex
}

const removeFavorite = async (itemId: number) => {
  await favoriteApi.removeFromFavorites(userId.value, itemId)
  fetchFavorites()
  delete selectedPrices.value[itemId]
}

const handlePayClose = () => { showPayModal.value = false }
const handlePayTimeout = () => { showPayModal.value = false }
const handlePaySuccess = (paymentInfo: any) => { showPayModal.value = false }
const getPayTypeName = (payType: string) => {
  const typeMap: Record<string, string> = {
    'alipay': '支付宝',
    'balance': '余额支付',
    'other': '其他支付'
  }
  return typeMap[payType] || payType
}
const buyNow = (item: any) => {
  const selectedPriceIndex = selectedPrices.value[item.id] || 0
  const selectedPrice = item.prices[selectedPriceIndex]
  payGoods.value = {
    shopLogo: item.image,
    shopName: item.name,
    shopDesc: `${selectedPrice.label} - ${item.desc}`,
    orderId: `ORDER_${Date.now()}_${item.id}`,
    price: parseFloat(selectedPrice.value.replace('¥', '').replace(',', ''))
  }
  showPayModal.value = true
}
const goShopping = () => { router.push('/') }
const initializePriceSelections = () => {
  favorites.value.forEach(item => {
    if (!(item.id in selectedPrices.value)) {
      selectedPrices.value[item.id] = 0
    }
  })
}
watch(favorites, () => { initializePriceSelections() }, { immediate: true })
</script>

<style scoped>
.favorites-section { padding: 0; height: 100%; }
.favorites-tabs { display: flex; gap: 16px; margin-bottom: 28px; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px; }
.favorites-tabs .tab-item { padding: 6px 18px; color: #999; cursor: pointer; font-size: 15px; border-radius: 18px 18px 0 0; background: none; transition: all 0.2s; position: relative; }
.favorites-tabs .tab-item.active { color: #1890FF; background: #fff; font-weight: 600; box-shadow: 0 2px 8px rgba(24,144,255,0.06); }

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}
.empty-icon {
  font-size: 64px;
  color: #e8e8e8;
  margin-bottom: 16px;
}
.empty-text {
  font-size: 18px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}
.empty-desc {
  font-size: 14px;
  color: #999;
  margin-bottom: 24px;
}
.go-shopping-btn {
  background: #1890FF;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.go-shopping-btn:hover {
  background: #1765ad;
}

.favorites-list { display: grid; grid-template-columns: 1fr 1fr; gap: 28px 24px; }
.favorite-card { background: #fff; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); padding: 24px 24px 20px 24px; display: flex; flex-direction: column; position: relative; min-height: 230px; }
.card-header { display: flex; align-items: center; margin-bottom: 10px; position: relative; }
.favorite-logo { width: 44px; height: 44px; border-radius: 8px; object-fit: contain; background: #f8f8f8; margin-right: 14px; border: 1px solid #f0f0f0; }
.favorite-title { font-size: 17px; font-weight: 600; color: #222; margin-right: 10px; }
.favorite-hot { background: #ff4d4f; color: #fff; font-size: 12px; border-radius: 8px; padding: 2px 10px; margin-left: 6px; font-weight: 500; }
.favorite-desc { font-size: 14px; color: #666; margin-bottom: 10px; min-height: 20px; }
.favorite-params { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; font-size: 14px; color: #888; margin-bottom: 18px; }
.favorite-param-label { color: #bbb; margin-right: 4px; }
.favorite-param-value { color: #333; font-weight: 500; }
.favorite-prices { display: flex; gap: 12px; margin-bottom: 22px; justify-content: space-between; }
.price-item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fff; border: 2px solid #f0f0f0; border-radius: 12px; padding: 10px 0 8px 0; font-size: 15px; font-weight: 500; color: #1890FF; cursor: pointer; transition: all 0.2s; min-width: 0; }
.price-item.selected { 
  background: #1890FF; 
  border-color: #1890FF; 
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}
.price-item.selected .price-label { 
  color: #fff; 
}
.price-item.selected .price-value { 
  color: #fff; 
}
.price-item:hover:not(.selected) { background: #eaf6ff; border-color: #1890FF; }
.price-item .price-label { font-size: 13px; color: #888; margin-bottom: 2px; font-weight: 400; }
.price-item .price-value { font-size: 18px; font-weight: 700; color: #1890FF; }
.favorite-actions { display: flex; gap: 16px; margin-top: 10px; justify-content: space-between; }
.buy-btn, .cancel-btn { flex: 1; border-radius: 10px; font-size: 16px; font-weight: 500; padding: 12px 0; min-width: 0; cursor: pointer; transition: all 0.2s; }
.buy-btn { background: #1890FF; color: #fff; border: none; }
.buy-btn:hover { background: #1765ad; }
.cancel-btn { background: #fff0f0; color: #ff4d4f; border: none; }
.cancel-btn:hover { background: #ff4d4f; color: #fff; }
@media (max-width: 900px) { .favorites-list { grid-template-columns: 1fr; } .favorite-card { min-height: 180px; } }
</style> 