/**
 * 通用状态管理
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCommonStore = defineStore('common', () => {
  // 全局加载状态
  const globalLoading = ref(false)
  
  // 侧边栏折叠状态
  const sidebarCollapsed = ref(false)
  
  // 当前页面标题
  const pageTitle = ref('')
  
  // 面包屑导航
  const breadcrumbs = ref([])
  
  // 全局错误信息
  const globalError = ref(null)
  
  // 网络状态
  const isOnline = ref(navigator.onLine)

  // 设置全局加载状态
  const setGlobalLoading = (loading) => {
    globalLoading.value = loading
  }

  // 切换侧边栏
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem('sidebar_collapsed', sidebarCollapsed.value)
  }

  // 设置页面标题
  const setPageTitle = (title) => {
    pageTitle.value = title
    document.title = title ? `${title} - 后台管理系统` : '后台管理系统'
  }

  // 设置面包屑
  const setBreadcrumbs = (crumbs) => {
    breadcrumbs.value = crumbs
  }

  // 设置全局错误
  const setGlobalError = (error) => {
    globalError.value = error
  }

  // 清除全局错误
  const clearGlobalError = () => {
    globalError.value = null
  }

  // 更新网络状态
  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine
  }

  // 初始化
  const init = () => {
    // 恢复侧边栏状态
    const collapsed = localStorage.getItem('sidebar_collapsed')
    if (collapsed !== null) {
      sidebarCollapsed.value = collapsed === 'true'
    }

    // 监听网络状态变化
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
  }

  return {
    // 状态
    globalLoading,
    sidebarCollapsed,
    pageTitle,
    breadcrumbs,
    globalError,
    isOnline,
    
    // 方法
    setGlobalLoading,
    toggleSidebar,
    setPageTitle,
    setBreadcrumbs,
    setGlobalError,
    clearGlobalError,
    updateOnlineStatus,
    init
  }
})