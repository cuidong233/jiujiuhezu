<!--
  个人中心概览组件
  
  功能：
  - 用户基本信息展示
  - 账户状态概览
  - 最近订单快览
  - 快捷操作入口
  
  设计特点：
  - 卡片式布局，层次分明
  - 关键信息突出显示
  - 语义化结构设计
-->
<template>
  <div class="profile-overview">
    <!-- 页面标题区 -->
    <header class="overview-header">
      <h1 class="page-title">账户概览</h1>
      <p class="page-subtitle">欢迎回来，{{ user.nickname }}</p>
    </header>

    <!-- 用户信息卡片 -->
    <section class="user-info-card" aria-labelledby="user-info-title">
      <h2 id="user-info-title" class="sr-only">用户基本信息</h2>
      <div class="user-profile">
        <div class="avatar-section">
          <img 
            :src="user.avatar || '/images/avatar-default.png'" 
            :alt="`${user.nickname}的头像`"
            class="user-avatar"
          />
          <div class="user-level">
            <span class="level-icon">{{ user.levelIcon }}</span>
            <span class="level-text">{{ user.level }}</span>
          </div>
        </div>
        
        <div class="user-details">
          <h3 class="user-name">{{ user.nickname }}</h3>
          <div class="user-meta">
            <div class="meta-item">
              <span class="meta-label">用户名:</span>
              <span class="meta-value">{{ user.username }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">邮箱:</span>
              <span class="meta-value">{{ user.email }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">手机:</span>
              <span class="meta-value">{{ user.phone }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">注册时间:</span>
              <span class="meta-value">{{ formatDate(user.createTime) }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 账户概况卡片组 -->
    <section class="account-stats" aria-labelledby="account-stats-title">
      <h2 id="account-stats-title" class="section-title">账户概况</h2>
      <div class="stats-grid">
        <div class="stat-card stat-card--balance">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <div class="stat-label">账户余额</div>
            <div class="stat-value">¥{{ formatCurrency(user.balance) }}</div>
          </div>
          <button class="stat-action" aria-label="充值">充值</button>
        </div>

        <div class="stat-card stat-card--orders">
          <div class="stat-icon">📦</div>
          <div class="stat-content">
            <div class="stat-label">订单总数</div>
            <div class="stat-value">{{ userStats.totalOrders }}</div>
          </div>
          <button class="stat-action" aria-label="查看订单">查看</button>
        </div>

        <div class="stat-card stat-card--coupons">
          <div class="stat-icon">🎟️</div>
          <div class="stat-content">
            <div class="stat-label">优惠券</div>
            <div class="stat-value">{{ userStats.availableCoupons }}</div>
          </div>
          <button class="stat-action" aria-label="查看优惠券">查看</button>
        </div>

        <div class="stat-card stat-card--points">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            <div class="stat-label">积分</div>
            <div class="stat-value">{{ userStats.points }}</div>
          </div>
          <button class="stat-action" aria-label="积分明细">明细</button>
        </div>
      </div>
    </section>

    <!-- 最近订单 -->
    <section class="recent-orders" aria-labelledby="recent-orders-title">
      <h2 id="recent-orders-title" class="section-title">最近订单</h2>
      <div class="orders-list">
        <div 
          v-for="order in recentOrders" 
          :key="order.id"
          class="order-item"
        >
          <img 
            :src="order.goodsImage" 
            :alt="order.goodsName"
            class="order-image"
          />
          <div class="order-info">
            <h3 class="order-name">{{ order.goodsName }}</h3>
            <p class="order-meta">
              订单号: {{ order.orderNo }} | 
              {{ formatDate(order.createTime) }}
            </p>
          </div>
          <div class="order-status">
            <span :class="['status-badge', `status-${order.status}`]">
              {{ order.statusText }}
            </span>
            <div class="order-amount">¥{{ formatCurrency(order.totalAmount) }}</div>
          </div>
        </div>
        
        <div v-if="!recentOrders.length" class="empty-state">
          <div class="empty-icon">📭</div>
          <p class="empty-text">暂无订单记录</p>
          <button class="empty-action">去购买</button>
        </div>
      </div>
    </section>

    <!-- 快捷操作 -->
    <section class="quick-actions" aria-labelledby="quick-actions-title">
      <h2 id="quick-actions-title" class="section-title">快捷操作</h2>
      <div class="actions-grid">
        <button class="action-btn">
          <span class="action-icon">✏️</span>
          <span class="action-text">修改资料</span>
        </button>
        <button class="action-btn">
          <span class="action-icon">🔐</span>
          <span class="action-text">安全设置</span>
        </button>
        <button class="action-btn">
          <span class="action-icon">💳</span>
          <span class="action-text">充值</span>
        </button>
        <button class="action-btn">
          <span class="action-icon">🎫</span>
          <span class="action-text">我的优惠券</span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 组件属性定义
interface Props {
  user: {
    id: number
    username: string
    nickname: string
    avatar?: string
    email?: string
    phone?: string
    createTime: string
    updateTime: string
    balance: number
    level: string
    levelIcon: string
  }
}

const props = defineProps<Props>()

// 模拟用户统计数据
const userStats = computed(() => ({
  totalOrders: 15,
  availableCoupons: 3,
  points: 2580,
  usedCoupons: 5
}))

// 模拟最近订单数据
const recentOrders = computed(() => [
  {
    id: 1001,
    orderNo: 'FTL202401150001',
    goodsName: 'Netflix 高级会员',
    goodsImage: '/images/netflix.png',
    totalAmount: 162.00,
    status: 4,
    statusText: '已完成',
    createTime: '2024-01-15 10:30:00'
  },
  {
    id: 1002,
    orderNo: 'FTL202401180002',
    goodsName: 'Disney+ 年度会员',
    goodsImage: '/images/netflix.png',
    totalAmount: 99.00,
    status: 2,
    statusText: '已发货',
    createTime: '2024-01-18 14:15:00'
  }
])

// 工具函数
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatCurrency = (amount: number) => {
  return amount.toFixed(2)
}
</script>

<style scoped>
.profile-overview {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* 页面标题 */
.overview-header {
  margin-bottom: 10px;
}

.page-title {
  font-family: 'PingFang SC', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #222222;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #666666;
  margin: 0;
}

/* 用户信息卡片 */
.user-info-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.user-profile {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #f0f0f0;
}

.user-level {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #8B4513;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 24px;
  font-weight: 700;
  color: #222222;
  margin: 0 0 16px 0;
}

.user-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.meta-item {
  display: flex;
  gap: 8px;
}

.meta-label {
  font-weight: 500;
  color: #666666;
  min-width: 80px;
}

.meta-value {
  color: #222222;
}

/* 账户概况 */
.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #222222;
  margin: 0 0 20px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #f8f9fa;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #666666;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #222222;
}

.stat-action {
  padding: 8px 16px;
  background: linear-gradient(135deg, #4C7AE0 0%, #235CDC 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.stat-action:hover {
  opacity: 0.9;
}

/* 最近订单 */
.orders-list {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.order-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child {
  border-bottom: none;
}

.order-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.order-info {
  flex: 1;
}

.order-name {
  font-size: 16px;
  font-weight: 600;
  color: #222222;
  margin: 0 0 8px 0;
}

.order-meta {
  font-size: 14px;
  color: #666666;
  margin: 0;
}

.order-status {
  text-align: right;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 8px;
}

.status-4 {
  background: #e8f5e8;
  color: #2d7d32;
}

.status-2 {
  background: #e3f2fd;
  color: #1976d2;
}

.order-amount {
  font-size: 16px;
  font-weight: 700;
  color: #222222;
}

/* 空状态 */
.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #666666;
  margin: 0 0 24px 0;
}

.empty-action {
  padding: 12px 24px;
  background: linear-gradient(135deg, #4C7AE0 0%, #235CDC 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

/* 快捷操作 */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 16px;
  background: #ffffff;
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
}

.action-icon {
  font-size: 28px;
}

.action-text {
  font-size: 14px;
  font-weight: 500;
  color: #222222;
}

/* 无障碍支持 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .profile-overview {
    gap: 20px;
  }
  
  .user-profile {
    flex-direction: column;
    text-align: center;
  }
  
  .user-meta {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .order-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .order-status {
    text-align: left;
    width: 100%;
  }
}
</style> 