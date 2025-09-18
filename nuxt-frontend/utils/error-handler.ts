import type { ApiResponse } from '@/types/api'

/**
 * API错误处理器
 */
export class ApiErrorHandler {
  /**
   * 检查API响应是否成功
   * @param response API响应
   * @returns 是否成功
   */
  static isSuccess(response: ApiResponse<any>): boolean {
    return response.success === true || response.code === 0
  }

  /**
   * 获取错误消息
   * @param response API响应
   * @returns 错误消息
   */
  static getErrorMessage(response: ApiResponse<any>): string {
    if (this.isSuccess(response)) {
      return ''
    }
    return response.msg || '请求失败，请稍后重试'
  }

  /**
   * 处理登录失效
   * @param response API响应
   */
  static async handleAuthError(response: ApiResponse<any>): Promise<void> {
    if (response.code === 401 || response.code === 10021) {
      // 清除token
      const token = useCookie('token', {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7
      })
      token.value = null
      
      // 显示登录弹窗而不是跳转
      if (process.client) {
        const { useModalStore } = await import('@/stores/modal')
        const modalStore = useModalStore()
        modalStore.openLogin()
      }
      
      // 显示提示消息
      console.warn('登录已失效，请重新登录')
    }
  }

  /**
   * 统一处理API响应
   * @param response API响应
   * @returns 处理后的数据
   */
  static handleResponse<T>(response: ApiResponse<T>): T {
    // 处理认证错误
    this.handleAuthError(response)
    
    // 检查是否成功
    if (!this.isSuccess(response)) {
      const errorMsg = this.getErrorMessage(response)
      console.error('API错误:', errorMsg)
      throw new Error(errorMsg)
    }
    
    return response.data
  }

  /**
   * 处理网络错误
   * @param error 错误对象
   */
  static handleNetworkError(error: any): void {
    let message = '网络连接失败，请检查网络设置'
    
    if (error.response) {
      // 服务器返回错误状态码
      const status = error.response.status
      switch (status) {
        case 400:
          message = '请求参数错误'
          break
        case 401:
          message = '未授权，请重新登录'
          break
        case 403:
          message = '禁止访问'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = `请求失败，状态码：${status}`
      }
    } else if (error.request) {
      // 请求发出但没有收到响应
      message = '网络超时，请检查网络连接'
    }
    
    console.error('网络错误:', message)
    throw new Error(message)
  }
}

/**
 * 安全的API调用包装器
 * @param apiCall API调用函数
 * @param defaultValue 默认返回值
 * @returns 安全的API调用结果
 */
export async function safeApiCall<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  defaultValue: T
): Promise<T> {
  try {
    const response = await apiCall()
    return ApiErrorHandler.handleResponse(response)
  } catch (error: any) {
    console.error('API调用失败:', error)
    ApiErrorHandler.handleNetworkError(error)
    return defaultValue
  }
}

/**
 * 分页数据安全包装器
 * @param apiCall API调用函数
 * @returns 安全的分页数据
 */
export async function safePageApiCall<T>(
  apiCall: () => Promise<ApiResponse<{ list: T[], total: number }>>
): Promise<{ list: T[], total: number }> {
  return safeApiCall(apiCall, { list: [], total: 0 })
} 

/**
 * 全局错误处理工具
 * 用于捕获和处理JavaScript运行时错误
 */

export interface ErrorInfo {
  message: string
  filename?: string
  lineno?: number
  colno?: number
  stack?: string
  timestamp: number
  userAgent?: string
  url?: string
}

export class ErrorHandler {
  private static instance: ErrorHandler
  private errorQueue: ErrorInfo[] = []
  private maxQueueSize = 50

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  init() {
    if (process.client) {
      // 捕获同步JavaScript错误
      window.addEventListener('error', (event) => {
        this.handleError({
          message: event.message || '未知错误',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      })

      // 捕获Promise拒绝错误
      window.addEventListener('unhandledrejection', (event) => {
        this.handleError({
          message: `未处理的Promise拒绝: ${event.reason}`,
          stack: event.reason?.stack,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      })

      // 捕获Vue错误
      if ((window as any).Vue && (window as any).Vue.config) {
        (window as any).Vue.config.errorHandler = (error: Error, instance: any, info: string) => {
          this.handleError({
            message: `Vue错误: ${error.message}`,
            stack: error.stack,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
          })
        }
      }
    }
  }

  private handleError(errorInfo: ErrorInfo) {
    // 添加到错误队列
    this.errorQueue.push(errorInfo)
    
    // 限制队列大小
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift()
    }

    // 控制台输出（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 错误详情')
      console.error('消息:', errorInfo.message)
      if (errorInfo.filename) console.log('文件:', errorInfo.filename)
      if (errorInfo.lineno) console.log('行号:', errorInfo.lineno)
      if (errorInfo.colno) console.log('列号:', errorInfo.colno)
      if (errorInfo.stack) console.log('堆栈:', errorInfo.stack)
      console.log('时间:', new Date(errorInfo.timestamp).toLocaleString())
      console.log('URL:', errorInfo.url)
      console.groupEnd()
    }

    // 特殊处理：数组访问错误
    if (errorInfo.message.includes("Cannot read properties of undefined (reading '0')")) {
      console.warn('检测到数组访问错误，建议检查以下位置：')
      console.warn('1. 确保数组已初始化: const arr = ref([])')
      console.warn('2. 使用安全访问: arr.value?.[0] 或 arr.value && arr.value[0]')
      console.warn('3. 检查异步数据加载状态')
    }
  }

  // 获取错误历史
  getErrorHistory(): ErrorInfo[] {
    return [...this.errorQueue]
  }

  // 清空错误队列
  clearErrors() {
    this.errorQueue = []
  }

  // 手动报告错误
  reportError(error: Error | string, context?: any) {
    const errorInfo: ErrorInfo = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      timestamp: Date.now(),
      userAgent: process.client ? navigator.userAgent : undefined,
      url: process.client ? window.location.href : undefined
    }

    if (context) {
      console.log('错误上下文:', context)
    }

    this.handleError(errorInfo)
  }
}

// 导出单例实例
export const errorHandler = ErrorHandler.getInstance()

// 安全的数组访问工具函数
export function safeArrayAccess<T>(array: T[] | undefined | null, index: number, defaultValue?: T): T | undefined {
  if (!array || !Array.isArray(array) || index < 0 || index >= array.length) {
    return defaultValue
  }
  return array[index]
}

// 安全的对象属性访问
export function safeGet<T, K extends keyof T>(obj: T | undefined | null, key: K, defaultValue?: T[K]): T[K] | undefined {
  if (!obj || typeof obj !== 'object') {
    return defaultValue
  }
  return obj[key] ?? defaultValue
} 