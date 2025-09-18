<template>
  <div class="profile-page">
    <!-- 顶部导航 -->
    <AppHeader />

    <!-- 个人中心主体内容 -->
    <div class="profile-container">
      <div class="profile-content">
        <!-- 左侧边栏 -->
        <div class="profile-sidebar">
          <!-- 用户基本信息 -->
          <div class="user-card">
            <div class="user-avatar-section">
              <img 
                :src="userStore.user?.avatar || '/images/head1.png'" 
                :alt="userStore.user?.nickname || '用户头像'"
                class="user-avatar-large"
              />
              <div class="user-basic-info">
                <h3 class="user-nickname">{{ userStore.user?.nickname || '张小明' }}</h3>
                <p class="user-uid">UID: {{ userStore.user?.id || '87654321' }}</p>
              </div>
            </div>
            <button class="change-avatar-btn" @click="showChangeAvatarModal = true">更改头像</button>
          </div>

          <!-- 菜单列表 -->
          <nav class="sidebar-menu">
            <NuxtLink
              v-for="item in menuItems" 
              :key="item.key"
              :to="item.to"
              :class="['menu-item', { active: isActive(item.to) }]"
            >
              <img 
                v-if="item?.icon" 
                :src="`/images/${item.icon}`" 
                :alt="item?.label || '菜单项'" 
                class="menu-icon" 
              />
              <span class="menu-text">{{ item?.label || '未知菜单' }}</span>
              <span v-if="item?.badge" class="menu-badge">{{ item.badge }}</span>
            </NuxtLink>
          </nav>

          <!-- 退出登录 -->
          <button class="logout-btn" @click="handleLogout">
            <i class="logout-icon"></i>
            退出登录
          </button>
        </div>

        <!-- 右侧主内容：子路由自动渲染 -->
        <div class="profile-main">
          <NuxtPage />
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <AppFooter />
    
    <!-- 更改头像模态框 -->
    <ChangeAvatarModal v-if="showChangeAvatarModal" @close="handleAvatarModalClose" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter, useRoute, navigateTo } from '#app'
import { safeArrayAccess, safeGet } from '@/utils/error-handler'
import ChangeAvatarModal from '@/components/ChangeAvatarModal.vue'
import { notificationApi } from '@/api/notification'

// SEO配置
useHead({
  title: '个人中心 - 凡图拉',
  meta: [
    { name: 'description', content: '凡图拉个人中心，管理您的账户信息、订单、余额和优惠券' },
    { name: 'keywords', content: '个人中心,账户管理,订单查询,凡图拉' }
  ]
})

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const showChangeAvatarModal = ref(false)
const unreadCount = ref(0)
let unreadPollInterval: NodeJS.Timeout | null = null

// 侧边栏菜单项 - 使用computed让badge响应式更新
const menuItems = computed(() => [
  { key: 'profile', label: '个人中心', icon: 'info1.png', to: '/profile' },
  { key: 'wallet', label: '我的钱包', icon: 'info2.png', to: '/profile/wallet' },
  { key: 'orders', label: '我的订单', icon: 'info3.png', to: '/profile/orders' },
  { key: 'exchange', label: '兑换中心', icon: 'info4.png', to: '/profile/exchange' },
  { key: 'referral', label: '返现推广', icon: 'info5.png', to: '/profile/referral' },
  { key: 'tickets', label: '我的工单', icon: 'info6.png', to: '/profile/tickets' },
  { key: 'favorites', label: '我的收藏', icon: 'info7.png', to: '/profile/favorites' },
  { key: 'messages', label: '我的消息', icon: 'info8.png', to: '/profile/messages', badge: unreadCount.value > 0 ? unreadCount.value : undefined }
])

// 获取未读消息数量
const fetchUnreadCount = async () => {
  try {
    const response = await notificationApi.getUnreadCount()
    if (response.code === 0) {
      unreadCount.value = response.data.count || 0
    }
  } catch (error) {
    console.error('获取未读消息数量失败:', error)
  }
}

// 开始轮询未读消息数量
const startUnreadPolling = () => {
  // 立即获取一次
  fetchUnreadCount()
  // 每30秒轮询一次
  unreadPollInterval = setInterval(() => {
    fetchUnreadCount()
  }, 30000)
}

// 停止轮询
const stopUnreadPolling = () => {
  if (unreadPollInterval) {
    clearInterval(unreadPollInterval)
    unreadPollInterval = null
  }
}

// 添加调试日志
onMounted(() => {
  console.log('个人中心页面已挂载')
  console.log('当前路径:', route.path)
  console.log('菜单项:', menuItems.value)
  // 开始轮询未读消息数量
  startUnreadPolling()
})

onUnmounted(() => {
  // 停止轮询
  stopUnreadPolling()
})

const isActive = (to: string) => {
  return route.path === to
}

// 使用新的导航组合式函数
const navigation = useNavigation()

const handleMenuClick = async (to: string) => {
  console.log('菜单点击事件触发，目标路径:', to)
  const success = await navigation.safeNavigate(to)
  if (!success) {
    console.error('所有导航方法都失败了')
  }
}

// 退出登录
const handleLogout = async () => {
  if (confirm('确定要退出登录吗？')) {
    await userStore.logout()
    router.push('/')
  }
}

// 处理头像模态框关闭
const handleAvatarModalClose = () => {
  showChangeAvatarModal.value = false
  // 重新获取用户信息以更新头像显示
  userStore.fetchUserInfo()
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.profile-container {
  flex: 1;
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 60px;
  justify-content: center;
  align-items: center;
}
.profile-content {
  width: 1170px;
  height: 890px;
  background: linear-gradient(137deg, #EEF8FB 0%, #F6F3F0 45%, #FBEFEA 100%);
  border-radius: 60px 60px 60px 60px;
  display: flex;
  gap: 30px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
}

/* 左侧边栏 */
.profile-sidebar {
  width: 220px;
  background: transparent;
  border-radius: 0;
  padding: 0;
  height: fit-content;
  box-shadow: none;
  flex-shrink: 0;
}

.user-card {
  text-align: center;
  margin-bottom: 25px;
  padding-bottom: 18px;
  border-bottom: 1px solid #f0f0f0;
}

.user-avatar-section {
  margin-bottom: 12px;
}

.user-avatar-large {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 8px;
  border: 3px solid #f0f0f0;
}

.user-nickname {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.user-uid {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.change-avatar-btn {
  width: 100%;
  padding: 6px 14px;
  background: #E6F3FF;
  color: #4A90E2;
  border: 1px solid #4A90E2;
  border-radius: 18px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.change-avatar-btn:hover {
  background: #4A90E2;
  color: white;
}

/* 侧边栏菜单 */
.sidebar-menu {
  margin-bottom: 18px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: #666;
  position: relative;
  background: transparent;
  text-decoration: none !important;
  width: 100%;
  z-index: 10;
  pointer-events: auto;
}

/* 确保 NuxtLink 作为 menu-item 时的样式 */
a.menu-item {
  display: flex;
  text-decoration: none !important;
  color: inherit;
}

.menu-item:hover {
  background: rgba(74, 144, 226, 0.1);
  color: #4A90E2;
}

.menu-item.active {
  background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
  color: white;
  border-radius: 25px;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
  transform: translateY(-1px);
}

.menu-icon {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  object-fit: contain;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.menu-item.active .menu-icon {
  opacity: 1;
}

.menu-text {
  flex: 1;
  width: 64px;
  height: 22px;
  font-family: PingFang SC, PingFang SC;
  font-weight: bold;
  font-size: 16px;
  color: #1A56DB;
  text-align: left;
  font-style: normal;
  text-transform: none;
}

.menu-item.active .menu-text {
  color: white;
}

.menu-badge {
  background: #ff4757;
  color: white;
  font-size: 11px;
  padding: 2px 5px;
  border-radius: 8px;
  min-width: 16px;
  text-align: center;
}

.logout-btn {
  width: 100%;
  padding: 10px 14px;
  background: #4A90E2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: #357ABD;
}

.logout-icon {
  width: 14px;
  height: 14px;
  background: currentColor;
  border-radius: 2px;
}

/* 右侧主内容 */
.profile-main {
  width: 879px;
  height: 744px;
  background: #FFFFFF;
  border-radius: 60px 60px 60px 60px;
  padding: 40px;
  overflow-y: auto;
  flex-shrink: 0;
}

.main-content {
  padding: 0;
  height: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.change-password-btn {
  background: #4A90E2;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.change-password-btn:hover {
  background: #357ABD;
}

/* 信息行 */
.info-content {
  max-width: 100%;
}

.info-field {
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
}

.info-field:last-child {
  margin-bottom: 0;
}

.field-label {
  font-size: 16px;
  color: #333;
  font-weight: 500;
  margin-bottom: 10px;
  display: block;
}

.input-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.info-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: #f8f9fa;
  color: #666;
  outline: none;
}

.avatar-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 10px;
}

.info-avatar {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
  border: 2px solid #f0f0f0;
}

.avatar-name {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.social-items {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  flex: 1;
}

.social-tag {
  font-size: 13px;
  color: #666;
  padding: 8px 16px;
  background: #f0f4f8;
  border: 1px solid #d1d9e0;
  border-radius: 20px;
  white-space: nowrap;
}

.change-nickname-btn,
.bind-email-btn,
.change-binding-btn {
  background: #4A90E2;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.change-nickname-btn:hover,
.bind-email-btn:hover,
.change-binding-btn:hover {
  background: #357ABD;
}

/* 危险区域 */
.danger-section {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid #f0f0f0;
}

.danger-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.delete-account-btn {
  background: #ff4757;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.delete-account-btn:hover {
  background: #ff3838;
}

.warning-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #ff4757;
  margin: 0;
}

.warning-icon {
  font-style: normal;
}

/* 占位内容 */
.placeholder-content {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.placeholder-content h2 {
  font-size: 24px;
  margin-bottom: 10px;
}

.placeholder-content p {
  font-size: 16px;
}

/* 响应式 */
@media (max-width: 1200px) {
  .profile-container {
    padding: 30px 40px;
  }
  
  .profile-content {
    padding: 30px;
    gap: 25px;
  }
  
  .profile-sidebar {
    width: 200px;
  }
}

@media (max-width: 900px) {
  .profile-sidebar {
    width: 180px;
  }
  
  .user-avatar-large {
    width: 60px;
    height: 60px;
  }
  
  .menu-item {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .menu-item .menu-icon {
    width: 16px;
    height: 16px;
    margin-right: 8px;
  }
}

@media (max-width: 768px) {
  .profile-page {
    padding-top: 20px;
    padding-bottom: 20px;
  }
  
  .profile-container {
    padding: 20px;
  }
  
  .profile-content {
    flex-direction: column;
    padding: 25px;
    gap: 20px;
    min-height: auto;
  }
  
  .profile-sidebar {
    width: 100%;
  }
  
  .info-field {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .field-label {
    width: auto;
    margin-bottom: 5px;
  }
  
  .avatar-info {
    flex-wrap: wrap;
  }
  
  .social-items {
    margin-top: 10px;
  }
}

@media (max-width: 480px) {
  .profile-container {
    padding: 15px;
  }
  
  .profile-content {
    padding: 20px;
  }
}

/* 钱包页面样式 */
.wallet-section {
  padding: 0;
  height: 100%;
}

.balance-card {
  background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 30px;
  position: relative;
  overflow: hidden;
}

.balance-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(50%, -50%);
}

.balance-content {
  position: relative;
  z-index: 2;
  text-align: center;
}

.balance-label {
  color: white;
  font-size: 16px;
  margin-bottom: 10px;
  opacity: 0.9;
}

.balance-amount {
  color: white;
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 30px;
  letter-spacing: 2px;
}

.recharge-btn {
  background: white;
  color: #4A90E2;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.recharge-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.balance-details {
  margin-top: 30px;
}

.details-header {
  margin-bottom: 20px;
}

.details-title {
  font-size: 18px;
  color: #333;
  margin: 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.details-title::before {
  content: '⚙';
  color: #4A90E2;
  font-size: 16px;
}

.transaction-list {
  border-radius: 12px;
  overflow: hidden;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  transition: background 0.2s ease;
}

.transaction-item:hover {
  background: #f1f3f4;
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.transaction-title {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.transaction-time {
  font-size: 13px;
  color: #999;
}

.transaction-amount {
  font-size: 16px;
  font-weight: bold;
}

.transaction-amount.positive {
  color: #28a745;
}

.transaction-amount.negative {
  color: #dc3545;
}

/* 我的订单页面样式 */
.orders-section {
  padding: 0;
  height: 100%;
}

.order-tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 15px;
}

.tab-item {
  padding: 8px 0;
  color: #999;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  position: relative;
}

.tab-item.active {
  color: #4A90E2;
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -16px;
  left: 0;
  width: 100%;
  height: 3px;
  background: #4A90E2;
  border-radius: 2px;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.order-item:hover {
  background: #f1f3f4;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.order-image {
  width: 80px;
  height: 60px;
  margin-right: 20px;
  flex-shrink: 0;
}

.placeholder-img {
  width: 100%;
  height: 100%;
  background: #d1d3d4;
  border-radius: 8px;
  border: 2px dashed #999;
}

.order-info {
  flex: 1;
  text-align: left;
}

.order-title {
  font-size: 16px;
  color: #333;
  font-weight: 500;
  margin-bottom: 8px;
}

.order-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-number,
.order-amount,
.order-time {
  font-size: 14px;
  color: #666;
}

.order-actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  min-width: 300px;
  justify-content: flex-end;
}

.order-status {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.order-status.pending {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.order-status.shipped {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.order-status.expired {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.order-status.completed {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.btn-pay,
.btn-cancel,
.btn-detail,
.btn-delete,
.btn-reorder {
  padding: 8px 16px;
  border: 1px solid #4A90E2;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  color: #4A90E2;
  white-space: nowrap;
}

.btn-pay {
  background: #4A90E2;
  color: white;
}

.btn-pay:hover {
  background: #357ABD;
}

.btn-cancel:hover,
.btn-detail:hover,
.btn-delete:hover,
.btn-reorder:hover {
  background: #4A90E2;
  color: white;
}

/* 兑换中心页面样式 */
.exchange-section {
  padding: 0;
  height: 100%;
}

/* 兑换优惠券整体容器 */
.exchange-container {
  border: 1px solid #e9ecef;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 兑换优惠券标题板块 */
.exchange-title-area {
  background: linear-gradient(135deg, #FFE9D8 0%, #C0F4FF 100%);
  padding: 30px;
  border-radius: 0;
  margin-bottom: 0;
}

.exchange-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 兑换输入板块 */
.exchange-input-area {
  background: white;
  padding: 30px;
  border-radius: 0;
  margin-bottom: 0;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.exchange-input {
  flex: 1;
  padding: 14px 20px;
  border: 1px solid #e0e0e0;
  border-radius: 25px;
  font-size: 14px;
  background: #f8f9fa;
  color: #333;
  outline: none;
  transition: all 0.3s ease;
}

.exchange-input:focus {
  border-color: #4A90E2;
  background: white;
}

.exchange-input::placeholder {
  color: #999;
}

.exchange-btn {
  background: #4A90E2;
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.exchange-btn:hover {
  background: #357ABD;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

.exchange-tips {
  font-size: 13px;
  color: #666;
  margin: 0;
}

/* 优惠券页面样式 */
.coupon-tabs {
  display: flex;
  gap: 30px;
  margin-bottom: 25px;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 15px;
}

.coupon-tabs .tab-item {
  padding: 8px 0;
  color: #999;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  position: relative;
}

.coupon-tabs .tab-item.active {
  color: #4A90E2;
  font-weight: 500;
}

.coupon-tabs .tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -16px;
  left: 0;
  width: 100%;
  height: 3px;
  background: #4A90E2;
  border-radius: 2px;
}

.coupon-list {
  display: flex;
  gap: 20px;
}

.coupon-card {
  width: 320px;
  background: white;
  border-radius: 16px;
  border: 2px solid #4A90E2;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.coupon-card.expired {
  border-color: #e9ecef;
  background: #f8f9fa;
}

.coupon-card:hover {
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.2);
  transform: translateY(-2px);
}

.coupon-card.expired:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* 上层：价格和标题 */
.coupon-header {
  background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.coupon-card.expired .coupon-header {
  background: #f1f3f4;
}

.coupon-amount {
  font-size: 36px;
  font-weight: bold;
  color: #4A90E2;
  line-height: 1;
}

.coupon-card.expired .coupon-amount {
  color: #999;
}

.coupon-info {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.coupon-type {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.coupon-card.expired .coupon-type {
  color: #999;
}

.coupon-condition {
  font-size: 12px;
  color: #666;
  font-weight: 400;
}

.coupon-card.expired .coupon-condition {
  color: #999;
}

/* 中层：描述 */
.coupon-body {
  padding: 20px;
  flex: 1;
}

.coupon-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.coupon-card.expired .coupon-desc {
  color: #999;
}

/* 下层：有效期和按钮 */
.coupon-footer {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f0f0f0;
}

.coupon-expiry {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.expiry-label {
  color: #999;
}

.expiry-date {
  color: #333;
  font-weight: 500;
}

.coupon-card.expired .expiry-label,
.coupon-card.expired .expiry-date {
  color: #dc3545;
}

.coupon-action {
  padding: 10px 24px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-weight: 500;
}

.coupon-action.use-btn {
  background: #4A90E2;
  color: white;
}

.coupon-action.use-btn:hover {
  background: #357ABD;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

.coupon-action.expired-btn {
  background: #e9ecef;
  color: #999;
  cursor: not-allowed;
}

.coupon-action.expired-btn:hover {
  background: #e9ecef;
  color: #999;
  transform: none;
}

/* 返现推广页面样式 */
.referral-section {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* 顶部推广和收益区域 */
.referral-top {
  display: flex;
  gap: 20px;
}

.invite-area {
  flex: 0.8;
  background: linear-gradient(135deg, #F6FFED 0%, #E6F7FF 100%);
  padding: 30px;
  border-radius: 16px;
  text-align: center;
}

.invite-title {
  font-size: 20px;
  font-weight: 600;
  color: #1890FF;
  margin: 0 0 8px 0;
}

.invite-desc {
  font-size: 14px;
  color: #1890FF;
  margin: 0;
}

.earnings-area {
  flex: 1.2;
  background: linear-gradient(135deg, #F6FFED 0%, #E6F7FF 100%);
  padding: 30px;
  border-radius: 16px;
  border: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.earnings-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.earnings-label {
  font-size: 16px;
  color: #666;
}

.earnings-amount {
  font-size: 32px;
  font-weight: bold;
  color: #333;
}

.withdraw-btn {
  background: #4A90E2;
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.withdraw-btn:hover {
  background: #357ABD;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

/* 中间推广码和链接区域 */
.referral-middle {
  display: flex;
  gap: 20px;
}

.referral-code-area,
.referral-link-area {
  flex: 1;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e9ecef;
}

.area-header {
  background: linear-gradient(135deg, #BBF1FF 0%, #FFC2A1 100%);
  padding: 20px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.code-content,
.link-content {
  padding: 20px;
}

.code-label,
.link-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.code-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.code-display {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 25px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  letter-spacing: 2px;
}

.copy-code-btn {
  background: #E6F7FF;
  color: #4A90E2;
  border: 1px solid #4A90E2;
  padding: 12px 20px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.copy-code-btn:hover {
  background: #4A90E2;
  color: white;
  transform: translateY(-1px);
}

.link-section {
  display: flex;
  gap: 0;
  margin-bottom: 12px;
  border: 1px solid #4A90E2;
  border-radius: 25px;
  overflow: hidden;
}

.link-input {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 0;
  font-size: 14px;
  color: #666;
  background: white;
  outline: none;
}

.copy-link-btn {
  background: #4A90E2;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 0;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.copy-link-btn:hover {
  background: #357ABD;
  transform: translateY(-1px);
}

.link-tip {
  font-size: 12px;
  color: #999;
  margin: 0;
  line-height: 1.4;
}

/* 底部统计数据 */
.referral-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-item {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: transparent;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px auto;
  color: white;
  position: relative;
  overflow: hidden;
}

.stat-icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 12px;
  background: transparent;
  padding: 4px;
}

.stat-icon-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
  border-radius: 12px;
}

.placeholder-box {
  color: white;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  opacity: 0.9;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

/* 我的工单页面样式 */
.tickets-section {
  padding: 0;
  height: 100%;
}

.apply-ticket-btn {
  background: #4A90E2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.apply-ticket-btn:hover {
  background: #357ABD;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

/* 工单选项卡 */
.ticket-tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 15px;
}

.ticket-tabs .tab-item {
  padding: 8px 0;
  color: #999;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  position: relative;
}

.ticket-tabs .tab-item.active {
  color: #4A90E2;
  font-weight: 500;
}

.ticket-tabs .tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -16px;
  left: 0;
  width: 100%;
  height: 3px;
  background: #4A90E2;
  border-radius: 2px;
}

/* 工单列表 */
.ticket-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ticket-item {
  background: transparent;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  padding: 0;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
}

.ticket-item:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.ticket-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background: #4A90E2;
}

.ticket-item.resolved::before {
  background: #52c41a;
}

.ticket-content {
  padding: 0;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  padding-left: 24px;
  margin-bottom: 0;
  background: #E6F7FF;
}

.ticket-item.resolved .ticket-header {
  background: #F6FFED;
}

.ticket-number {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.ticket-status {
  width: 43px;
  height: 20px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.ticket-status.in-progress {
  background: #1890FF;
  color: white;
}

.ticket-status.resolved {
  background: #52c41a;
  color: white;
}

.ticket-body {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  background: white;
  padding: 20px;
  padding-left: 24px;
}

.ticket-body-content {
  flex: 1;
}

.ticket-title {
  font-size: 16px;
  color: #333;
  font-weight: 500;
  margin-bottom: 10px;
  line-height: 1.4;
}

.ticket-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
}

.ticket-time,
.ticket-order {
  font-size: 13px;
  color: #999;
}

.ticket-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

.ticket-body-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
  justify-content: flex-start;
  background: white;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

.action-btn {
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  border: none;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.detail-btn {
  width: 85px;
  height: 26px;
  background: #E6F7FF;
  color: #1890FF;
  padding: 5px 8px;
}

.detail-btn:hover {
  background: #1890FF;
  color: white;
}

.secondary-btn {
  width: 85px;
  height: 26px;
  background: #F5F7FA;
  color: #666;
  padding: 5px 8px;
}

.secondary-btn:hover {
  background: #1890FF;
  color: white;
}

/* 按钮图标样式 */
.btn-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  flex-shrink: 0;
  background: transparent;
}

.apply-ticket-btn .btn-icon {
  width: 22px;
  height: 22px;
}

.action-btn .btn-icon {
  width: 18px;
  height: 18px;
}

/* 图标占位符处理 */
.btn-icon[src*="gongdan3.png"] {
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="%23666"><circle cx="8" cy="8" r="1"/></svg>') no-repeat center;
  background-size: contain;
}

.btn-icon:not([src]):after {
  content: "📋";
  font-size: 12px;
}

/* 我的收藏页面样式 */
.favorites-section {
  padding: 0;
  height: 100%;
}
.favorites-tabs {
  display: flex;
  gap: 16px;
  margin-bottom: 28px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
}
.favorites-tabs .tab-item {
  padding: 6px 18px;
  color: #999;
  cursor: pointer;
  font-size: 15px;
  border-radius: 18px 18px 0 0;
  background: none;
  transition: all 0.2s;
  position: relative;
}
.favorites-tabs .tab-item.active {
  color: #1890FF;
  background: #fff;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(24,144,255,0.06);
}
.favorites-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px 24px;
}
.favorite-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  padding: 24px 24px 20px 24px;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 230px;
}
.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  position: relative;
}
.favorite-logo {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: contain;
  background: #f8f8f8;
  margin-right: 14px;
  border: 1px solid #f0f0f0;
}
.favorite-title {
  font-size: 17px;
  font-weight: 600;
  color: #222;
  margin-right: 10px;
}
.favorite-hot {
  background: #ff4d4f;
  color: #fff;
  font-size: 12px;
  border-radius: 8px;
  padding: 2px 10px;
  margin-left: 6px;
  font-weight: 500;
}
.favorite-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
  min-height: 20px;
}
.favorite-params {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 18px;
  font-size: 13px;
  color: #888;
  margin-bottom: 12px;
}
.favorite-prices {
  display: flex;
  gap: 12px;
  margin-bottom: 22px;
  justify-content: space-between;
}
.price-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  padding: 10px 0 8px 0;
  font-size: 15px;
  font-weight: 500;
  color: #1890FF;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 0;
}
.price-item.selected,
.price-item:hover {
  background: #eaf6ff;
  border-color: #1890FF;
}
.price-item .price-label {
  font-size: 13px;
  color: #888;
  margin-bottom: 2px;
  font-weight: 400;
}
.price-item .price-value {
  font-size: 18px;
  font-weight: 700;
  color: #1890FF;
}

/* 参数信息布局 */
.favorite-params {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 24px;
  font-size: 14px;
  color: #888;
  margin-bottom: 18px;
}
.favorite-param-label {
  color: #bbb;
  margin-right: 4px;
}
.favorite-param-value {
  color: #333;
  font-weight: 500;
}

/* 收藏卡片底部按钮布局 */
.favorite-actions {
  display: flex;
  gap: 16px;
  margin-top: 10px;
  justify-content: space-between;
}
.buy-btn, .cancel-btn {
  flex: 1;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 500;
  padding: 12px 0;
  min-width: 0;
}
.buy-btn {
  background: #1890FF;
  color: #fff;
  border: none;
  transition: background 0.2s;
}
.buy-btn:hover {
  background: #1765ad;
}
.cancel-btn {
  background: #fff0f0;
  color: #ff4d4f;
  border: none;
  transition: background 0.2s, color 0.2s;
}
.cancel-btn:hover {
  background: #ff4d4f;
  color: #fff;
}
@media (max-width: 900px) {
  .favorites-list {
    grid-template-columns: 1fr;
  }
  .favorite-card {
    min-height: 180px;
  }
}
</style> 