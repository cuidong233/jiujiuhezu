import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@/types/api'

// 每次请求时动态获取config，避免SSR 500错误
function getAxiosInstance() {
  const config = useRuntimeConfig()
  const instance = axios.create({
    baseURL: config.public.apiBase + '/api',
    timeout: 15000, // 增加超时时间到15秒
    headers: {
      'Content-Type': 'application/json',
    },
    // 添加重试配置
    retry: 2,
    retryDelay: 1000
  })

  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      // 优先从localStorage获取token（更可靠）
      let tokenValue = null
      
      if (process.client) {
        // 客户端：优先从localStorage获取
        tokenValue = localStorage.getItem('token')
        // console.log('🔍 [请求拦截器] localStorage token:', tokenValue ? `有(${tokenValue.substring(0, 20)}...)` : '无')
      }
      
      // 如果localStorage没有，尝试从cookie获取
      if (!tokenValue) {
        const tokenCookie = useCookie('token', {
          httpOnly: false,
          secure: false,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7
        })
        tokenValue = tokenCookie.value
        // console.log('🍪 [请求拦截器] cookie token:', tokenValue ? `有(${tokenValue.substring(0, 20)}...)` : '无')
      }
      
      // 检查是否为需要认证的请求 - 验证码相关接口不需要认证
      const isAuthRequired = !config.url?.includes('/common/code') && 
                             !config.url?.includes('/common/mail/login') && 
                             !config.url?.includes('/common/mail/code')
      
      if (tokenValue) {
        // 使用sa-token格式，直接设置token header
        config.headers.token = tokenValue
        console.log('✅ [请求拦截器] 已添加token到请求:', config.url)
        console.log('   完整URL:', config.baseURL + config.url)
      } else if (isAuthRequired) {
        console.log('❌ [请求拦截器] 无token，请求未携带认证:', config.url)
        console.log('   完整URL:', config.baseURL + config.url)
      } else {
        console.log('ℹ️ [请求拦截器] 公开接口，无需认证:', config.url)
        console.log('   完整URL:', config.baseURL + config.url)
      }
      
      if (config.method === 'get') {
        config.params = {
          ...config.params,
          _t: Date.now()
        }
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // 响应拦截器
  instance.interceptors.response.use(
    (response) => {
      // 适配后端Result格式到前端ApiResponse格式
      const result = response.data
      if (result && typeof result === 'object' && 'code' in result) {
        const adaptedResponse: ApiResponse<any> = {
          code: result.code,
          msg: result.msg || result.message,  // 兼容message字段
          data: result.data,
          success: result.code === 0  // 后端code=0表示成功
        }
        response.data = adaptedResponse
      }
      return response
    },
    async (error) => {
      const config = error.config
      
      // 实现请求重试逻辑
      if (config && config.retry > 0 && 
          (error.code === 'ECONNABORTED' || error.code === 'NETWORK_ERROR' || 
           error.response?.status >= 500)) {
        config.retry--
        console.log(`🔄 网络请求重试中... 剩余次数: ${config.retry}`)
        await new Promise(resolve => setTimeout(resolve, config.retryDelay))
        return instance(config)
      }
      if (error.response) {
        const { status, data } = error.response
        switch (status) {
          case 401:
            // 只有在非/auth/me接口时才清除token和显示登录弹窗
            if (!error.config.url?.includes('/auth/me')) {
              const token = useCookie('token', {
                httpOnly: false,
                secure: false,
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7
              })
              token.value = null
              // 只在客户端显示登录弹窗，避免SSR问题
              if (process.client) {
                // 使用modal store显示登录弹窗
                const { useModalStore } = await import('@/stores/modal')
                const modalStore = useModalStore()
                modalStore.openLogin()
              }
            }
            break
          case 403:
            break
          case 404:
            break
          case 500:
            break
        }
        // 处理后端错误格式
        if (data && typeof data === 'object') {
          const errorMsg = data.msg || data.message || data.error
          if (errorMsg) {
            return Promise.reject(new Error(errorMsg))
          }
        }
        return Promise.reject(new Error(data?.msg || data?.message || `HTTP ${status} 错误`))
      } else if (error.request) {
        // 网络错误 - 提供更详细的错误信息
        console.error('🌐 网络请求失败:', {
          url: error.config?.url,
          method: error.config?.method,
          timeout: error.config?.timeout,
          baseURL: error.config?.baseURL
        })
        return Promise.reject(new Error(`网络连接失败: 无法连接到服务器 (${error.config?.baseURL || 'API服务器'}), 请检查网络设置或稍后重试`))
      } else {
        // 请求配置错误
        console.error('⚙️ 请求配置错误:', error.message)
        return Promise.reject(error)
      }
    }
  )
  return instance
}

export const http = {
  get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return getAxiosInstance().get(url, { params, ...config }).then(res => res.data)
  },
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return getAxiosInstance().post(url, data, config).then(res => res.data)
  },
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return getAxiosInstance().put(url, data, config).then(res => res.data)
  },
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return getAxiosInstance().delete(url, config).then(res => res.data)
  },
  upload<T = any>(url: string, file: File, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)
    return getAxiosInstance().post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      ...config
    }).then(res => res.data)
  },
  download(url: string, params?: any, filename?: string): Promise<void> {
    return getAxiosInstance().get(url, {
      params,
      responseType: 'blob'
    }).then((response) => {
      const blob = new Blob([response.data])
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    })
  }
}

// 添加默认导出以兼容两种导入方式
export default http