<template>
  <div class="referral-section">
    <div class="section-header">
      <h2 class="section-title">返现推广</h2>
    </div>
    <div class="referral-top">
      <div class="invite-area">
        <h3 class="invite-title">邀请好友，赚取高额返现</h3>
        <p class="invite-desc">分享推广码邀请好友</p>
      </div>
      <div class="earnings-area">
        <div class="earnings-content">
          <div class="earnings-label">我的推广收益</div>
          <div class="earnings-amount">¥ {{ stats.orderAmount ?? 0 }}</div>
        </div>
        <button class="withdraw-btn">立即提现</button>
      </div>
    </div>
    <div class="referral-middle">
      <div class="referral-code-area">
        <div class="area-header">我的推广码</div>
        <div class="code-content">
          <div class="code-label">您的专属推广码</div>
          <div class="code-section">
            <div class="code-display">{{ inviteInfo.code }}</div>
            <button class="copy-code-btn">复制推广码</button>
          </div>
        </div>
      </div>
      <div class="referral-link-area">
        <div class="area-header">推广链接</div>
        <div class="link-content">
          <div class="link-label">您的专属推广链接</div>
          <div class="link-section">
            <input type="text" class="link-input" :value="inviteInfo.link" readonly />
            <button class="copy-link-btn">复制链接</button>
          </div>
          <p class="link-tip">分享此链接给好友，好友通过此链接注册即可成为您的推广用户</p>
        </div>
      </div>
    </div>
    <div class="referral-stats">
      <div class="stat-item">
        <div class="stat-icon">
          <img src="/images/tuiguang1.png" alt="推广用户图标" class="stat-icon-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
          <div class="stat-icon-placeholder" style="display: none;"><div class="placeholder-box">用户</div></div>
        </div>
        <div class="stat-label">推广用户</div>
        <div class="stat-value">{{ stats.registerNum ?? 0 }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">
          <img src="/images/tuiguang2.png" alt="成功订单图标" class="stat-icon-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
          <div class="stat-icon-placeholder" style="display: none;"><div class="placeholder-box">订单</div></div>
        </div>
        <div class="stat-label">成功订单</div>
        <div class="stat-value">{{ stats.orderNum ?? 0 }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">
          <img src="/images/tuiguang3.png" alt="累计收益图标" class="stat-icon-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
          <div class="stat-icon-placeholder" style="display: none;"><div class="placeholder-box">收益</div></div>
        </div>
        <div class="stat-label">累计收益</div>
        <div class="stat-value">¥{{ stats.orderAmount ?? 0 }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">
          <img src="/images/tuiguang4.png" alt="本月收益图标" class="stat-icon-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
          <div class="stat-icon-placeholder" style="display: none;"><div class="placeholder-box">月收益</div></div>
        </div>
        <div class="stat-label">本月收益</div>
        <div class="stat-value">--</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()

// 推广统计数据
const stats = ref({
  registerNum: 0,
  orderNum: 0,
  orderAmount: 0
})
// 推广码、链接等
const inviteInfo = ref({
  code: '',
  link: '',
  nickName: '',
  avatar: ''
})

const fetchReferralData = async () => {
  // 获取统计数据
  const statRes = await $fetch('/invite/statistics')
  if (statRes && statRes.data) {
    stats.value = statRes.data
  }
  // 获取推广码等
  const inviterRes = await $fetch('/invite/inviter')
  if (inviterRes && inviterRes.data) {
    inviteInfo.value.nickName = inviterRes.data.nickName || ''
    inviteInfo.value.code = userStore.user?.id ? String(userStore.user.id).padStart(8, '0') : '00000000'
    inviteInfo.value.link = `${window.location.origin}/ref/${inviteInfo.value.code}`
    inviteInfo.value.avatar = inviterRes.data.avatar || ''
  }
}
onMounted(fetchReferralData)
</script>
<style scoped>
.referral-section { padding: 0; height: 100%; display: flex; flex-direction: column; gap: 30px; }
.referral-top { display: flex; gap: 20px; }
.invite-area { flex: 0.8; background: linear-gradient(135deg, #F6FFED 0%, #E6F7FF 100%); padding: 30px; border-radius: 16px; text-align: center; }
.invite-title { font-size: 20px; font-weight: 600; color: #1890FF; margin: 0 0 8px 0; }
.invite-desc { font-size: 14px; color: #1890FF; margin: 0; }
.earnings-area { flex: 1.2; background: linear-gradient(135deg, #F6FFED 0%, #E6F7FF 100%); padding: 30px; border-radius: 16px; border: 1px solid #e9ecef; display: flex; justify-content: space-between; align-items: center; }
.earnings-content { display: flex; flex-direction: column; gap: 8px; }
.earnings-label { font-size: 16px; color: #666; }
.earnings-amount { font-size: 32px; font-weight: bold; color: #333; }
.withdraw-btn { background: #4A90E2; color: white; border: none; padding: 14px 28px; border-radius: 25px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s ease; white-space: nowrap; }
.withdraw-btn:hover { background: #357ABD; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3); }
.referral-middle { display: flex; gap: 20px; }
.referral-code-area, .referral-link-area { flex: 1; background: white; border-radius: 16px; overflow: hidden; border: 1px solid #e9ecef; }
.area-header { background: linear-gradient(135deg, #BBF1FF 0%, #FFC2A1 100%); padding: 20px; font-size: 16px; font-weight: 600; color: #333; }
.code-content, .link-content { padding: 20px; }
.code-label, .link-label { font-size: 14px; color: #666; margin-bottom: 12px; }
.code-section { display: flex; align-items: center; gap: 12px; }
.code-display { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 25px; padding: 12px 20px; font-size: 16px; font-weight: 600; color: #333; letter-spacing: 2px; }
.copy-code-btn { background: #E6F7FF; color: #4A90E2; border: 1px solid #4A90E2; padding: 12px 20px; border-radius: 25px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s ease; white-space: nowrap; }
.copy-code-btn:hover { background: #4A90E2; color: white; transform: translateY(-1px); }
.link-section { display: flex; gap: 0; margin-bottom: 12px; border: 1px solid #4A90E2; border-radius: 25px; overflow: hidden; }
.link-input { flex: 1; padding: 12px 16px; border: none; border-radius: 0; font-size: 14px; color: #666; background: white; outline: none; }
.copy-link-btn { background: #4A90E2; color: white; border: none; padding: 12px 20px; border-radius: 0; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s ease; white-space: nowrap; }
.copy-link-btn:hover { background: #357ABD; transform: translateY(-1px); }
.link-tip { font-size: 12px; color: #999; margin: 0; line-height: 1.4; }
.referral-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.stat-item { background: white; border: 1px solid #e9ecef; border-radius: 12px; padding: 20px; text-align: center; transition: all 0.3s ease; }
.stat-item:hover { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); transform: translateY(-2px); }
.stat-icon { width: 48px; height: 48px; background: transparent; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto; color: white; position: relative; overflow: hidden; }
.stat-icon-img { width: 100%; height: 100%; object-fit: contain; border-radius: 12px; background: transparent; padding: 4px; }
.stat-icon-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%); border-radius: 12px; }
.placeholder-box { color: white; font-size: 12px; font-weight: 500; text-align: center; opacity: 0.9; }
.stat-label { font-size: 14px; color: #666; margin-bottom: 8px; }
.stat-value { font-size: 24px; font-weight: bold; color: #333; }
</style> 