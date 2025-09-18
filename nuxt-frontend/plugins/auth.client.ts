export default defineNuxtPlugin(async () => {
  const userStore = useUserStore()
  
  // 注意：init()已经在app.vue的onMounted中调用了，这里不需要重复调用
  // 只需要监听存储变化即可
  
  // 监听存储变化，确保跨标签页同步登录状态
  if (process.client && typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === 'token') {
        // token变化时重新初始化用户状态
        userStore.init()
      }
    })
  }
}) 