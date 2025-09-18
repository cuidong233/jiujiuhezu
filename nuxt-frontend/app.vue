<template>
  <div class="app-wrapper">
    <!-- <AppHeader />  全局导航栏已注释，如需恢复请取消注释 -->
    <!-- 页面内容 -->
    <NuxtPage />
    <!-- 全局登录弹窗 -->
    <LoginRegisterModal :visible="modal.showLogin" @close="modal.closeLogin()" />
    <!-- 开发工具组件已禁用 -->
    <!-- <DevLoginTool /> -->
  </div>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue'
import LoginRegisterModal from '@/components/LoginRegisterModal.vue'
import { useModalStore } from '@/stores/modal'
// import DevLoginTool from '@/components/DevLoginTool.vue'

// 应用初始化时恢复登录状态
const userStore = useUserStore()
const modal = useModalStore()

// 只在客户端初始化时恢复登录状态
// SSR时不需要初始化，因为cookie会自动同步
onMounted(async () => {
  await userStore.init()
})
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: 'PingFang SC', 'Noto Sans SC', sans-serif;
}

#__nuxt {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 通用页面布局样式 - 确保页脚始终在底部 */
.page-layout, 
.home-page, 
.profile-page, 
.about-page, 
.goods-page, 
.faq-page, 
.policy-page, 
.login-page,
.community-page,
.service-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 页面主内容区域 */
.page-content, 
.profile-container,
.about-container,
.goods-container,
.faq-container,
.policy-container,
.login-container,
.community-container,
.service-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style> 