/**
 * 认证状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref(localStorage.getItem('admin_token') || '')
  const user = ref(null)
  const permissions = ref([])
  const isLoading = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.role === 'super_admin')
  const userRole = computed(() => user.value?.role || 'guest')

  // 设置token
  const setToken = (newToken) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('admin_token', newToken)
      // 设置request默认请求头
      request.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    } else {
      localStorage.removeItem('admin_token')
      delete request.defaults.headers.common['Authorization']
    }
  }

  // 设置用户信息
  const setUser = (userInfo) => {
    user.value = userInfo
    permissions.value = userInfo?.permissions || []
  }

  // 检查权限
  const hasPermission = (permission) => {
    if (isAdmin.value) return true
    return permissions.value.includes(permission)
  }

  // 检查角色
  const hasRole = (role) => {
    return userRole.value === role
  }

  // 登录
  const login = async (credentials) => {
    isLoading.value = true
    try {
      const response = await request.post('/api/auth/login', credentials)
      
      if (response.code === 0) {
        // 处理简单登录返回的数据格式
        const responseData = response.data
        const newToken = responseData.tokenValue || responseData.token
        const userInfo = responseData.user || {
          id: responseData.id,
          email: responseData.email,
          username: responseData.username,
          nickname: responseData.nickname,
          avatar: responseData.avatar,
          role: responseData.role
        }
        
        setToken(newToken)
        setUser(userInfo)
        
        ElMessage.success('登录成功')
        return { success: true, user: userInfo }
      } else {
        ElMessage.error(response.msg || '登录失败')
        return { success: false, message: response.msg }
      }
    } catch (error) {
      const message = error.response?.data?.message || '登录失败，请检查网络连接'
      ElMessage.error(message)
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  const logout = async (showMessage = true) => {
    // 直接清理本地状态，不调用后端接口
    // 因为后端可能没有登出接口或者接口路径不同
    setToken('')
    setUser(null)
    permissions.value = []
    
    if (showMessage) {
      ElMessage.success('已退出登录')
    }
  }

  // 获取用户信息
  const getUserInfo = async () => {
    if (!token.value) return false

    try {
      const response = await request.get('/api/auth/me')
      
      if (response.code === 0) {
        setUser(response.data)
        return true
      } else {
        // token可能已失效，但不自动登出
        return false
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 不自动登出，让错误处理器处理
      return false
    }
  }

  // 刷新token
  const refreshToken = async () => {
    try {
      const response = await request.post('/api/auth/refresh')
      
      if (response.code === 0) {
        setToken(response.data.token)
        return true
      } else {
        // 不自动登出
        return false
      }
    } catch (error) {
      // 不自动登出
      return false
    }
  }

  // 初始化（检查token有效性）
  const init = async () => {
    if (token.value) {
      // 设置request默认请求头
      request.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      
      // 验证token有效性
      const success = await getUserInfo()
      if (!success) {
        setToken('')
      }
    }
  }

  return {
    // 状态
    token,
    user,
    permissions,
    isLoading,
    
    // 计算属性
    isAuthenticated,
    isAdmin,
    userRole,
    
    // 方法
    setToken,
    setUser,
    hasPermission,
    hasRole,
    login,
    logout,
    getUserInfo,
    refreshToken,
    init
  }
})