<!--
  应用顶部导航栏组件
  
  功能包括：
  - Logo和品牌名称展示
  - 主要导航菜单（首页、订单、社区帮助、客服）
  - 全局搜索框
  - 用户登录/注册入口
  
  设计特点：
  - 固定宽度1180px，居中显示
  - 渐变背景，现代化UI设计
  - 响应式交互效果
-->
<template>
  <header class="app-header">
    <div class="header-inner">
      <!-- Logo区 -->
      <NuxtLink to="/" class="logo-area">
        <OptimizedImage
          src="/images/logo.png"
          alt="凡图拉官方Logo - 优质流媒体服务平台"
          title="返回凡图拉首页"
          :width="40"
          :height="40"
          loading="eager"
          class="logo-img"
          preset="icon"
        />
        <span class="logo-text">凡图拉</span>
      </NuxtLink>
      <!-- 菜单区 -->
      <nav class="nav-menu">
        <NuxtLink to="/" class="nav-btn">首页</NuxtLink>
        <button @click="handleOrderClick" class="nav-btn">订单</button>
        <NuxtLink to="/community" class="nav-btn">社区帮助</NuxtLink>
        <button class="nav-btn" @click="showServiceModal = true">客服</button>
      </nav>
      <!-- 搜索框+用户区域 -->
      <div class="header-actions">
        <div class="search-box" @click.stop>
          <input 
            v-model="searchKeyword"
            @input="debouncedSearch"
            @keypress="handleKeypress"
            @focus="showSearchResults = searchResults.length > 0"
            class="search-input" 
            type="text" 
            placeholder="搜索商品..." 
          />
          <div class="search-icon-bg" @click.stop="handleSearch">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="11" fill="#E6F0FA"/><path d="M15.5 15.5L13.1 13.1M14 10C14 12.2091 12.2091 14 10 14C7.79086 14 6 12.2091 6 10C6 7.79086 7.79086 6 10 6C12.2091 6 14 7.79086 14 10Z" stroke="#235CDC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          
          <!-- 搜索结果下拉框 -->
          <div v-if="showSearchResults" class="search-dropdown">
            <div v-if="isSearching" class="search-loading">搜索中...</div>
            <div v-else-if="searchResults.length === 0" class="search-no-results">未找到相关商品</div>
            <div v-else>
              <div 
                v-for="item in searchResults" 
                :key="item.id" 
                class="search-result-item"
                @click="goToProduct(item.id)"
              >
                <img :src="item.image || '/images/netflix.png'" :alt="item.name" class="search-result-img" />
                <div class="search-result-info">
                  <div class="search-result-name">{{ item.name || item.title }}</div>
                  <div class="search-result-price">¥{{ item.price }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 未登录状态：显示登录按钮 -->
        <NuxtLink 
          v-if="!userStore.isLoggedIn" 
          to="#" 
          class="login-btn" 
          @click.prevent="modal.openLogin()"
        >
          登录/注册
        </NuxtLink>
        
        <!-- 已登录状态：显示购物车和用户信息 -->
        <div v-else class="user-section">
          <!-- 购物车图标 -->
          <NuxtLink to="/cart" class="cart-icon" title="查看购物车" @click.stop>
            <div class="cart-icon-wrapper">
              <OptimizedImage
                src="/images/gouwuche.png"
                alt="购物车图标 - 查看您的购物车"
                title="点击查看购物车"
                :width="24"
                :height="24"
                loading="eager"
                class="cart-img"
                preset="icon"
              />
              <!-- 购物车数量badge -->
              <span v-if="cartStore.totalCount > 0" class="cart-badge">{{ cartStore.totalCount }}</span>
            </div>
            <span class="cart-text">购物车</span>
          </NuxtLink>
          
          <!-- 用户信息 -->
          <div class="user-info-container" @click.stop>
            <div @click="toggleUserMenu" class="user-info">
              <OptimizedImage
                :src="userStore.user?.avatar || '/images/head1.png'"
                :alt="`${userStore.user?.nickname || '用户'}的个人头像`"
                :title="`${userStore.user?.nickname || '用户'}的个人中心`"
                :width="32"
                :height="32"
                loading="eager"
                class="user-avatar"
                preset="avatar"
              />
              <span class="user-name">{{ userStore.user?.nickname || 'XXX' }}</span>
            </div>
            
            <!-- 用户下拉菜单 -->
            <div v-if="showUserMenu" class="user-dropdown-menu">
              <div class="menu-item" @click="navigateToProfile">个人中心</div>
              <div class="menu-item" @click="navigateToWallet">我的钱包</div>
              <div class="menu-item" @click="navigateToOrders">我的订单</div>
              <div class="menu-item" @click="navigateToExchange">兑换中心</div>
              <div class="menu-item" @click="navigateToReferral">推广返现</div>
              <div class="menu-item" @click="navigateToTickets">我的工单</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
  <ServiceModal v-if="showServiceModal" @close="showServiceModal = false" />
  <UnifiedLoginModal :visible="showLoginModal" @close="closeLoginModal" />
</template>

<script setup lang="ts">
// logo图片请放在public/images/logo.png
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useModalStore } from '@/stores/modal'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import ServiceModal from './ServiceModal.vue'
import UnifiedLoginModal from './UnifiedLoginModal.vue'
import { goodsApi } from '@/api/goods'
import { useRouter } from 'vue-router'

const modal = useModalStore()
const userStore = useUserStore()
const cartStore = useCartStore()
const router = useRouter()

// 用户菜单状态
const showUserMenu = ref(false)
const showServiceModal = ref(false)
const showLoginModal = ref(false)

// 搜索相关
const searchKeyword = ref('')
const searchResults = ref<any[]>([])
const showSearchResults = ref(false)
const isSearching = ref(false)

// 搜索功能
const handleSearch = async () => {
  const keyword = searchKeyword.value.trim()
  console.log('开始搜索:', keyword)
  
  if (!keyword) {
    showSearchResults.value = false
    searchResults.value = []
    return
  }
  
  isSearching.value = true
  showSearchResults.value = true // 立即显示下拉框
  
  try {
    const result = await goodsApi.searchGoods({
      keyword,
      page: 1,
      limit: 5
    })
    
    console.log('API返回结果:', result)
    
    if (result && result.data) {
      // 后端直接返回数组，不是包含list的对象
      searchResults.value = Array.isArray(result.data) ? result.data : (result.data.list || [])
      console.log('处理后的搜索结果:', searchResults.value)
      showSearchResults.value = searchResults.value.length > 0
    } else {
      console.log('无有效数据')
      searchResults.value = []
      showSearchResults.value = true // 保持显示以显示"未找到"消息
    }
  } catch (error) {
    console.error('搜索失败:', error)
    searchResults.value = []
    showSearchResults.value = true // 保持显示以显示"未找到"消息
  } finally {
    isSearching.value = false
  }
}

// 防抖搜索
let searchTimer: any = null
const debouncedSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    handleSearch()
  }, 300)
}

// 点击搜索结果
const goToProduct = (productId: number) => {
  router.push(`/goods/${productId}`)
  searchKeyword.value = ''
  showSearchResults.value = false
}

// 按下回车键搜索
const handleKeypress = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    const keyword = searchKeyword.value.trim()
    if (keyword) {
      // 先执行搜索
      handleSearch().then(() => {
        // 如果有搜索结果，跳转到第一个
        if (searchResults.value.length > 0) {
          goToProduct(searchResults.value[0].id)
        }
      })
    }
  }
}

// 处理订单按钮点击 - 添加登录检查
const handleOrderClick = () => {
  if (userStore.isLoggedIn) {
    // 已登录，直接跳转
    router.push('/profile/orders')
  } else {
    // 未登录，显示登录弹窗
    showLoginModal.value = true
  }
}

// 关闭登录弹窗
const closeLoginModal = () => {
  showLoginModal.value = false
}

// 切换用户菜单显示状态
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

// 点击外部关闭菜单
const closeUserMenu = () => {
  showUserMenu.value = false
}

// 菜单导航方法
const navigateToProfile = () => {
  router.push('/profile')
  closeUserMenu()
}

const navigateToWallet = () => {
  router.push('/profile/wallet')
  closeUserMenu()
}

const navigateToOrders = () => {
  router.push('/profile/orders')
  closeUserMenu()
}

const navigateToExchange = () => {
  router.push('/profile/exchange')
  closeUserMenu()
}

const navigateToReferral = () => {
  router.push('/profile/referral')
  closeUserMenu()
}

const navigateToTickets = () => {
  router.push('/profile/tickets')
  closeUserMenu()
}

// 监听登录状态变化，登录成功后自动关闭弹窗
watch(() => userStore.isLoggedIn, (newValue) => {
  if (newValue && showLoginModal.value) {
    // 用户登录成功，关闭登录弹窗
    showLoginModal.value = false
  }
})

// 点击外部时关闭菜单和搜索结果
const handleClickOutside = (event: MouseEvent) => {
  closeUserMenu()
  // 检查点击是否在搜索框外部
  const searchBox = document.querySelector('.search-box')
  if (searchBox && !searchBox.contains(event.target as Node)) {
    showSearchResults.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.app-header {
  width: 100vw;
  min-width: 1180px;
  background: linear-gradient(90deg, #D3F7FF 0%, #FFF7F3 50%, #FFD4BF 100%);
  border-radius: 0 0 0 0;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #E6E6E6;
}
.header-inner {
  width: 1180px;
  height: 60px; /* 原为48px，提升高度 */
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo-area {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.2s;
}
.logo-area:hover {
  opacity: 0.8;
}
.logo-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.logo-text {
  font-family: PingFang SC, sans-serif;
  font-weight: 700;
  font-size: 22px;
  color: #222;
  letter-spacing: 2px;
  white-space: nowrap;
}
.nav-menu {
  display: flex;
  gap: 40px;
  flex: 1;
  margin-left: 40px;
}
.nav-btn {
  font-family: PingFang SC, sans-serif;
  font-weight: 500;
  font-size: 18px;
  color: #494949;
  text-align: left;
  line-height: 25px;
  display: flex;
  align-items: center;
  text-decoration: none;
  background: none;
  border: none;
  border-radius: 0;
  padding: 0 8px 0 8px;
  position: relative;
  transition: color 0.2s, background 0.2s;
  white-space: nowrap;
  height: 48px;
}
.nav-btn.router-link-active::after,
.nav-btn.router-link-exact-active::after,
.nav-btn:hover::after {
  content: '';
  display: block;
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 6px;
  height: 3px;
  background: #FF7A45;
  border-radius: 2px;
}
.nav-btn.router-link-active,
.nav-btn.router-link-exact-active,
.nav-btn:hover {
  color: #222;
  background: #f2f6ff;
  cursor: pointer;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 28px; /* 原为18px，提升间距 */
}
.search-box {
  width: 260px;
  height: 39px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(189,189,189,0.08);
  border-radius: 28px;
  display: flex;
  align-items: center;
  padding: 0 12px 0 16px;
  position: relative;
}
.search-input {
  flex: 1;
  height: 30px;
  border: none;
  background: transparent;
  font-size: 16px;
  outline: none;
  color: #494949;
  font-family: PingFang SC, sans-serif;
  white-space: nowrap;
}
.search-icon-bg {
  width: 32px;
  height: 32px;
  background: #F6FBFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.search-icon-bg:hover {
  background: #E6F0FA;
}

/* 搜索结果下拉框样式 */
.search-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 1001;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
}

.search-loading,
.search-no-results {
  padding: 16px;
  text-align: center;
  color: #666;
  font-size: 14px;
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f0f0f0;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background: #f8f9fa;
}

.search-result-img {
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: 8px;
  margin-right: 12px;
  background: #f5f5f5;
}

.search-result-info {
  flex: 1;
}

.search-result-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.search-result-price {
  font-size: 16px;
  font-weight: bold;
  color: #FF3B30;
}
.login-btn {
  width: 113px;
  height: 39px;
  background: linear-gradient(270deg, #4C7AE0 0%, #235CDC 100%);
  border-radius: 20px;
  color: #fff;
  font-family: PingFang SC, sans-serif;
  font-weight: 500;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  border: none;
  transition: background 0.2s;
  box-shadow: 0 2px 8px rgba(76,122,224,0.08);
  white-space: nowrap;
}
.login-btn:hover {
  background: linear-gradient(270deg, #235CDC 0%, #4C7AE0 100%);
}

/* 用户区域样式 */
.user-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 购物车样式 */
.cart-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  padding: 0;
  background: none;
  border: none;
  border-radius: 0;
  box-shadow: none;
}

/* 移除悬停效果 */
.cart-icon:hover {
  opacity: 1;
  background: none;
}

.cart-icon-wrapper {
  position: relative;
}

.cart-img {
  width: 28px;
  height: 28px;
  margin: 0 0 4px 0;
  object-fit: contain;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #FF7A45;
  color: #fff;
  font-size: 12px;
  font-weight: bold;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.cart-text {
  font-size: 14px;
  color: #333333;
  font-weight: 500;
  white-space: nowrap;
}

/* 用户信息样式 */
.user-info-container {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  padding: 4px 0;
  transition: opacity 0.2s;
  cursor: pointer;
}

.user-info:hover {
  opacity: 0.8;
}

/* 用户下拉菜单样式 */
.user-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  width: 120px;
  background: rgba(255, 232, 223, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  overflow: hidden;
  border: 1px solid rgba(255, 232, 223, 0.4);
  animation: fadeInDown 0.2s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-item {
  padding: 12px 16px;
  font-size: 14px;
  color: #333333;
  cursor: pointer;
  transition: background-color 0.2s;
  font-weight: 500;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  font-family: 'PingFang SC', sans-serif;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background-color: rgba(76, 122, 224, 0.1);
  color: #235CDC;
}

.user-avatar {
  width: 36px; /* 原为32px */
  height: 36px; /* 原为32px */
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.user-name {
  font-family: 'PingFang SC', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #333333;
  white-space: nowrap;
}



/* 响应式适配 */
@media (max-width: 1220px) {
  .user-section {
    gap: 12px;
  }
  
  .cart-text {
    font-size: 13px;
  }
  
  .user-name {
    font-size: 14px;
  }
  
  .user-dropdown-menu {
    width: 110px;
  }
  
  .menu-item {
    padding: 10px 12px;
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .user-section {
    gap: 8px;
  }
  
  .cart-icon {
    padding: 6px 10px;
  }
  
  .cart-text {
    font-size: 12px;
  }
  
  .user-avatar {
    width: 28px;
    height: 28px;
  }
  
  .user-name {
    font-size: 12px;
  }
  
  .user-dropdown-menu {
    width: 100px;
    right: -10px;
  }
  
  .menu-item {
    padding: 8px 10px;
    font-size: 12px;
  }
}
</style> 