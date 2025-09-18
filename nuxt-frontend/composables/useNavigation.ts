/**
 * 导航辅助函数
 * 解决 Nuxt 3 路由跳转问题
 */

export const useNavigation = () => {
  const router = useRouter()
  const route = useRoute()

  /**
   * 安全导航函数
   * @param to 目标路径
   * @param options 导航选项
   */
  const safeNavigate = async (to: string, options?: any) => {
    console.log('[Navigation] 尝试导航到:', to)
    
    if (!to) {
      console.warn('[Navigation] 目标路径为空')
      return false
    }

    // 如果目标路径和当前路径相同，不进行导航
    if (route.path === to) {
      console.log('[Navigation] 已在目标页面')
      return true
    }

    try {
      // 优先使用 navigateTo
      await navigateTo(to, options)
      console.log('[Navigation] 导航成功 (navigateTo):', to)
      return true
    } catch (error) {
      console.warn('[Navigation] navigateTo 失败:', error)
      
      // 备选方案：使用 router.push
      try {
        await router.push(to)
        console.log('[Navigation] 导航成功 (router.push):', to)
        return true
      } catch (routerError) {
        console.error('[Navigation] router.push 也失败了:', routerError)
        
        // 最后的备选方案：window.location
        if (typeof window !== 'undefined') {
          console.log('[Navigation] 使用 window.location 进行导航')
          window.location.href = to
          return true
        }
        
        return false
      }
    }
  }

  /**
   * 检查路径是否激活
   * @param path 要检查的路径
   */
  const isActive = (path: string) => {
    return route.path === path || route.path.startsWith(path + '/')
  }

  /**
   * 刷新当前页面
   */
  const refreshPage = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return {
    safeNavigate,
    isActive,
    refreshPage,
    currentPath: computed(() => route.path),
    currentRoute: computed(() => route)
  }
}