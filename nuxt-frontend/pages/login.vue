<template>
  <div>
    <!-- 自动重定向到首页并显示登录弹窗 -->
  </div>
</template>

<script setup lang="ts">
import { useModalStore } from '@/stores/modal'

// SEO配置
useHead({
  title: '用户登录 - 凡图拉'
})

const modalStore = useModalStore()

// 立即重定向到首页并显示登录弹窗
onMounted(() => {
  // 先跳转到首页
  navigateTo('/')
  // 然后显示登录弹窗
  setTimeout(() => {
    modalStore.openLogin()
  }, 100)
})
</script>

<style scoped>
/* 页面会立即重定向，所以不需要样式 */
</style>