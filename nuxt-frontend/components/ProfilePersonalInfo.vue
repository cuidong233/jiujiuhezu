<!--
  个人信息页面组件
  
  功能：
  - 显示用户个人信息
  - 提供编辑功能按钮
  - 绑定邮箱和社交媒体管理
  - 账号注销功能
  
  设计特点：
  - 清晰的信息布局
  - 统一的交互风格
  - 醒目的操作按钮
-->
<template>
  <div class="personal-info">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <h1 class="page-title">个人信息</h1>
      <button class="change-password-btn" @click="$emit('change-password')">
        更改密码
      </button>
    </div>

    <!-- 个人信息内容 -->
    <div class="info-content">
      <!-- 头像和昵称 -->
      <div class="info-section">
        <div class="section-label">头像</div>
        <div class="avatar-info">
          <div class="avatar-wrapper">
            <img :src="user.avatar" :alt="user.nickname" class="user-avatar" />
          </div>
          <div class="avatar-details">
            <div class="user-name">{{ user.nickname }}</div>
            <button class="edit-btn" @click="$emit('change-nickname')">
              更改昵称
            </button>
          </div>
        </div>
      </div>

      <!-- UID信息 -->
      <div class="info-section">
        <div class="section-label">UID</div>
        <div class="section-value">{{ user.id || '87654321' }}</div>
      </div>

      <!-- 绑定邮箱 -->
      <div class="info-section">
        <div class="section-label">绑定邮箱</div>
        <div class="section-content">
          <div class="section-value">{{ user.email || 'user@example.com' }}</div>
        </div>
      </div>

      <!-- 绑定社交媒体 -->
      <div class="info-section">
        <div class="section-label">绑定社交媒体</div>
        <div class="section-content">
          <div class="social-bindings">
            <div class="social-item">
              <span class="social-text">已绑定微信：</span>
              <span class="social-value">XXXX</span>
            </div>
            <div class="social-item">
              <span class="social-text">已绑定微博：</span>
              <span class="social-value">XXXX</span>
            </div>
            <div class="social-item">
              <span class="social-text">已绑定抖音：</span>
              <span class="social-value">XXXX</span>
            </div>
          </div>
          <button class="bind-btn" @click="$emit('change-social-binding')">
            更改绑定
          </button>
        </div>
      </div>
    </div>

    <!-- 账号注销区域 -->
    <div class="danger-zone">
      <button class="delete-account-btn" @click="handleDeleteAccount">
        注销账号
      </button>
      <div class="warning-text">
        <span class="warning-icon">⚠️</span>
        一旦注销无法恢复
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 用户信息类型定义
interface User {
  id: number | string
  nickname: string
  avatar: string
  email?: string
  [key: string]: any
}

// 组件属性定义
interface Props {
  user: User
}

// 事件定义
interface Emits {
  (e: 'change-password'): void
  (e: 'change-nickname'): void
  (e: 'change-social-binding'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 账号注销处理
const handleDeleteAccount = () => {
  if (confirm('确定要注销账号吗？此操作无法恢复！')) {
    console.log('账号注销确认')
    // 这里可以添加注销账号的具体逻辑
  }
}
</script>

<style scoped>
.personal-info {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 页面标题区域 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #eee;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.change-password-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #4C7AE0 0%, #235CDC 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.change-password-btn:hover {
  background: linear-gradient(135deg, #3B5EC7 0%, #1E47B3 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(76, 122, 224, 0.3);
}

/* 信息内容区域 */
.info-content {
  padding: 25px 30px;
}

.info-section {
  margin-bottom: 25px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.section-label {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.section-value {
  font-size: 16px;
  color: #666;
  flex: 1;
}

.section-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

/* 头像信息 */
.avatar-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-wrapper {
  flex-shrink: 0;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f0f0f0;
}

.avatar-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-name {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

/* 社交媒体绑定 */
.social-bindings {
  flex: 1;
}

.social-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.social-item:last-child {
  margin-bottom: 0;
}

.social-text {
  font-size: 16px;
  color: #666;
  min-width: 120px;
}

.social-value {
  font-size: 16px;
  color: #333;
}

/* 按钮样式 */
.edit-btn, .bind-btn {
  padding: 8px 20px;
  background: transparent;
  border: 1px solid #4C7AE0;
  border-radius: 6px;
  color: #4C7AE0;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.edit-btn:hover, .bind-btn:hover {
  background: #4C7AE0;
  color: white;
}

/* 危险区域 */
.danger-zone {
  padding: 20px 30px;
  border-top: 1px solid #eee;
  background: #fafafa;
  display: flex;
  align-items: center;
  gap: 12px;
}

.delete-account-btn {
  padding: 12px 24px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-account-btn:hover {
  background: #ff1e1e;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.3);
}

.warning-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #ff4d4f;
}

.warning-icon {
  font-size: 16px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .page-header {
    padding: 20px;
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .page-title {
    font-size: 20px;
    text-align: center;
  }
  
  .info-content {
    padding: 20px;
  }
  
  .info-section {
    margin-bottom: 30px;
  }
  
  .section-content {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .avatar-info {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .user-avatar {
    width: 60px;
    height: 60px;
  }
  
  .social-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .social-text {
    min-width: auto;
    font-size: 14px;
  }
  
  .danger-zone {
    padding: 20px;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .warning-text {
    justify-content: center;
  }
}
</style> 