<template>
        <div class="info-section">
          <div class="section-header">
            <h2 class="section-title">个人信息</h2>
            <div class="header-actions">
              <NotificationBell />
              <button class="change-password-btn" @click="showChangePassword = true">更改密码</button>
            </div>
          </div>
          <div class="info-content">
            <div class="info-field">
              <label class="field-label">头像</label>
              <div class="avatar-info">
                <img :src="userInfo.avatar || '/images/head1.png'" alt="头像" class="info-avatar" />
                <span class="avatar-name">{{ userInfo.nickname || '张小明' }}</span>
                <button class="change-nickname-btn" @click="showChangeNicknameModal = true">更改昵称</button>
              </div>
            </div>
            <div class="info-field">
              <label class="field-label">UID</label>
              <div class="input-container">
                <input type="text" class="info-input" :value="userInfo.id || '87654321'" readonly />
              </div>
            </div>
            <div class="info-field">
              <label class="field-label">绑定邮箱</label>
              <div class="input-container">
                <input type="email" class="info-input" :value="userInfo.email || 'user@example.com'" readonly />
          <button class="bind-email-btn" @click="showBindEmailModal = true">绑定邮箱</button>
              </div>
            </div>
            <div class="info-field">
              <label class="field-label">绑定社交媒体</label>
              <div class="input-container">
                <div class="social-items">
                  <span class="social-tag">已绑定微信：XXXX</span>
                  <span class="social-tag">已绑定微信：XXXX</span>
                  <span class="social-tag">已绑定微信：XXXX</span>
                </div>
                <button class="change-binding-btn">更改绑定</button>
              </div>
            </div>
            <div class="danger-section">
              <div class="danger-content">
                <button class="delete-account-btn">注销账号</button>
                <p class="warning-text">
                  <i class="warning-icon">⚠</i>
                  一旦注销无法恢复
                </p>
              </div>
            </div>
          </div>
    <ChangePasswordModal v-if="showChangePassword" @close="showChangePassword = false" />
    <BindEmailModal v-if="showBindEmailModal" @close="showBindEmailModal = false" />
    <ChangeNicknameModal v-if="showChangeNicknameModal" @close="handleNicknameModalClose" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ChangePasswordModal from '@/components/ChangePasswordModal.vue'
import BindEmailModal from '@/components/BindEmailModal.vue'
import ChangeNicknameModal from '@/components/ChangeNicknameModal.vue'
import { http } from '@/utils/request'

const userInfo = ref<any>({})
const showChangePassword = ref(false)
const showBindEmailModal = ref(false)
const showChangeNicknameModal = ref(false)

const fetchUserInfo = async () => {
  const res = await http.get('/user/info')
  if (res && res.data) userInfo.value = res.data
}

const handleNicknameModalClose = () => {
  showChangeNicknameModal.value = false
  // 重新获取用户信息以更新昵称显示
  fetchUserInfo()
}

onMounted(fetchUserInfo)
</script>
<style scoped>
/* 保留原有内容区样式 */
.info-section { margin: 0; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 1px solid #f0f0f0; }
.section-title { font-size: 20px; font-weight: 600; color: #333; margin: 0; }
.change-password-btn { background: #4A90E2; color: white; border: none; padding: 8px 20px; border-radius: 20px; font-size: 14px; cursor: pointer; transition: background 0.2s; }
.change-password-btn:hover { background: #357ABD; }
.info-content { max-width: 100%; }
.info-field { margin-bottom: 30px; display: flex; flex-direction: column; }
.info-field:last-child { margin-bottom: 0; }
.field-label { font-size: 16px; color: #333; font-weight: 500; margin-bottom: 10px; display: block; }
.input-container { display: flex; align-items: center; gap: 15px; }
.info-input { flex: 1; padding: 12px 16px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; background: #f8f9fa; color: #666; outline: none; }
.avatar-info { display: flex; align-items: center; gap: 15px; margin-top: 10px; }
.info-avatar { width: 50px; height: 50px; border-radius: 8px; object-fit: cover; border: 2px solid #f0f0f0; }
.avatar-name { font-size: 16px; color: #333; font-weight: 500; }
.social-items { display: flex; flex-wrap: wrap; gap: 10px; flex: 1; }
.social-tag { font-size: 13px; color: #666; padding: 8px 16px; background: #f0f4f8; border: 1px solid #d1d9e0; border-radius: 20px; white-space: nowrap; }
.change-nickname-btn, .bind-email-btn, .change-binding-btn { background: #4A90E2; color: white; border: none; padding: 8px 20px; border-radius: 20px; font-size: 13px; cursor: pointer; transition: background 0.2s; white-space: nowrap; }
.change-nickname-btn:hover, .bind-email-btn:hover, .change-binding-btn:hover { background: #357ABD; }
.danger-section { margin-top: 40px; padding-top: 30px; border-top: 2px solid #f0f0f0; }
.danger-content { display: flex; align-items: center; gap: 15px; }
.delete-account-btn { background: #ff4757; color: white; border: none; padding: 10px 24px; border-radius: 20px; font-size: 14px; cursor: pointer; transition: background 0.2s; white-space: nowrap; }
.delete-account-btn:hover { background: #ff3838; }
.warning-text { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #ff4757; margin: 0; }
.warning-icon { font-style: normal; }
</style> 