/**
 * 前端错误处理工具
 */
import { ElMessage, ElNotification } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useCommonStore } from '@/stores/common'

// 错误类型枚举
export const ERROR_TYPES = {
  NETWORK: 'NETWORK',
  AUTH: 'AUTH',
  VALIDATION: 'VALIDATION',
  BUSINESS: 'BUSINESS',
  UNKNOWN: 'UNKNOWN'
}

// 错误处理器类
export class ErrorHandler {
  // 防止重复登出的标志
  static isLoggingOut = false
  /**
   * 分类错误类型
   */
  static classifyError(error) {
    if (!error) return ERROR_TYPES.UNKNOWN

    // 网络错误
    if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
      return ERROR_TYPES.NETWORK
    }

    // 认证错误
    if (error.status === 401 || error.code === 401) {
      return ERROR_TYPES.AUTH
    }

    // 验证错误
    if (error.status === 400 || error.code === 1001) {
      return ERROR_TYPES.VALIDATION
    }

    // 业务错误
    if (error.code && error.code !== 500) {
      return ERROR_TYPES.BUSINESS
    }

    return ERROR_TYPES.UNKNOWN
  }

  /**
   * 处理不同类型的错误
   */
  static handle(error, options = {}) {
    const {
      showMessage = true,
      showNotification = false,
      autoRetry = false,
      context = null
    } = options

    const errorType = this.classifyError(error)
    const message = this.getErrorMessage(error)

    console.error('Error occurred:', {
      type: errorType,
      error,
      context,
      timestamp: new Date().toISOString()
    })

    switch (errorType) {
      case ERROR_TYPES.NETWORK:
        return this.handleNetworkError(error, { showMessage, showNotification })
      
      case ERROR_TYPES.AUTH:
        return this.handleAuthError(error, { showMessage })
      
      case ERROR_TYPES.VALIDATION:
        return this.handleValidationError(error, { showMessage })
      
      case ERROR_TYPES.BUSINESS:
        return this.handleBusinessError(error, { showMessage, showNotification })
      
      default:
        return this.handleUnknownError(error, { showMessage, showNotification })
    }
  }

  /**
   * 网络错误处理
   */
  static handleNetworkError(error, options) {
    const message = '网络连接失败，请检查网络设置'
    
    if (options.showNotification) {
      ElNotification({
        title: '网络错误',
        message,
        type: 'error',
        duration: 5000
      })
    } else if (options.showMessage) {
      ElMessage.error(message)
    }

    // 更新网络状态
    const commonStore = useCommonStore()
    commonStore.updateOnlineStatus()

    return { type: ERROR_TYPES.NETWORK, message, handled: true }
  }

  /**
   * 认证错误处理
   */
  static handleAuthError(error, options) {
    const message = error.message || 'Token已过期，请重新登录'
    
    // 防止重复登出
    if (this.isLoggingOut) {
      return { type: ERROR_TYPES.AUTH, message, handled: true }
    }
    
    if (options.showMessage) {
      ElMessage.error(message)
    }

    // 标记正在登出
    this.isLoggingOut = true
    
    // 自动登出
    const authStore = useAuthStore()
    authStore.logout().finally(() => {
      // 登出完成后重置标志
      this.isLoggingOut = false
    })

    // 跳转到登录页
    if (typeof window !== 'undefined' && window.$router) {
      window.$router.push('/login')
    }

    return { type: ERROR_TYPES.AUTH, message, handled: true }
  }

  /**
   * 验证错误处理
   */
  static handleValidationError(error, options) {
    let message = '数据验证失败'
    
    // 处理详细验证错误
    if (error.data && error.data.errors) {
      const errors = error.data.errors
      if (Array.isArray(errors) && errors.length > 0) {
        message = errors.map(err => err.message).join('; ')
      }
    } else if (error.message) {
      message = error.message
    }

    if (options.showMessage) {
      ElMessage.error(message)
    }

    return { type: ERROR_TYPES.VALIDATION, message, handled: true, errors: error.data?.errors }
  }

  /**
   * 业务错误处理
   */
  static handleBusinessError(error, options) {
    const message = error.message || '操作失败'
    
    if (options.showNotification) {
      ElNotification({
        title: '操作失败',
        message,
        type: 'error',
        duration: 4000
      })
    } else if (options.showMessage) {
      ElMessage.error(message)
    }

    return { type: ERROR_TYPES.BUSINESS, message, handled: true }
  }

  /**
   * 未知错误处理
   */
  static handleUnknownError(error, options) {
    const message = '系统异常，请稍后重试'
    
    if (options.showNotification) {
      ElNotification({
        title: '系统错误',
        message,
        type: 'error',
        duration: 5000
      })
    } else if (options.showMessage) {
      ElMessage.error(message)
    }

    // 记录到全局错误状态
    const commonStore = useCommonStore()
    commonStore.setGlobalError(error)

    return { type: ERROR_TYPES.UNKNOWN, message, handled: true }
  }

  /**
   * 获取错误消息
   */
  static getErrorMessage(error) {
    if (typeof error === 'string') return error
    if (error?.message) return error.message
    if (error?.data?.message) return error.data.message
    if (error?.response?.data?.message) return error.response.data.message
    return '未知错误'
  }

  /**
   * 批量处理错误
   */
  static handleMultiple(errors, options = {}) {
    if (!Array.isArray(errors)) return

    const results = errors.map(error => this.handle(error, options))
    
    // 如果有多个错误，显示汇总通知
    if (errors.length > 1 && options.showSummary) {
      ElNotification({
        title: '批量操作结果',
        message: `共${errors.length}个错误`,
        type: 'warning',
        duration: 5000
      })
    }

    return results
  }
}

/**
 * 创建错误边界组件的辅助函数
 */
export function createErrorBoundary(component, fallbackComponent = null) {
  return {
    ...component,
    errorCaptured(err, vm, info) {
      console.error('Component error boundary caught:', {
        error: err,
        component: vm?.$options.name || 'Unknown',
        info,
        timestamp: new Date().toISOString()
      })

      ErrorHandler.handle(err, {
        showMessage: true,
        context: `Component: ${vm?.$options.name || 'Unknown'}`
      })

      // 返回false继续传播错误，返回true停止传播
      return false
    }
  }
}

/**
 * 异步函数错误包装器
 */
export function withErrorHandling(asyncFn, options = {}) {
  return async (...args) => {
    try {
      return await asyncFn(...args)
    } catch (error) {
      ErrorHandler.handle(error, options)
      throw error
    }
  }
}

/**
 * Promise错误处理
 */
export function handlePromise(promise, options = {}) {
  return promise.catch(error => {
    ErrorHandler.handle(error, options)
    return Promise.reject(error)
  })
}

// 默认导出
export default ErrorHandler