/**
 * API相关状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { ElMessage, ElNotification } from 'element-plus'
import { useAuthStore } from './auth'

// 配置axios默认baseURL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3002'

export const useApiStore = defineStore('api', () => {
  // 请求计数器
  const pendingRequests = ref(0)
  
  // 错误重试配置
  const retryConfig = ref({
    maxRetries: 3,
    retryDelay: 1000
  })

  // 是否有进行中的请求
  const hasRequests = computed(() => pendingRequests.value > 0)

  // 增加请求计数
  const incrementRequests = () => {
    pendingRequests.value++
  }

  // 减少请求计数
  const decrementRequests = () => {
    if (pendingRequests.value > 0) {
      pendingRequests.value--
    }
  }

  // 通用API请求封装
  const request = async (config, options = {}) => {
    const {
      showLoading = false,
      showError = true,
      showSuccess = false,
      successMessage = '操作成功',
      retries = 0
    } = options

    incrementRequests()
    
    try {
      const response = await axios(config)
      
      // 统一处理响应
      // 兼容不同的成功代码（0 或 200）
      // 优先检查code，如果code是200或0，就认为成功
      // 如果没有code字段，再检查success字段
      const isSuccess = (response.data.code === 0 || response.data.code === 200) || 
                       (response.data.code === undefined && response.data.success === true)
      
      if (isSuccess) {
        if (showSuccess) {
          ElMessage.success(response.data.message || successMessage)
        }
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        }
      } else {
        // 业务错误
        if (showError) {
          ElMessage.error(response.data.message || '操作失败')
        }
        return {
          success: false,
          message: response.data.message,
          code: response.data.code
        }
      }
    } catch (error) {
      // 网络错误或其他错误
      console.error('API请求失败:', error)
      
      // 检查是否需要重试
      if (retries < retryConfig.value.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryConfig.value.retryDelay))
        return request(config, { ...options, retries: retries + 1 })
      }
      
      const message = error.response?.data?.message || error.message || '网络请求失败'
      
      if (showError) {
        ElMessage.error(message)
      }
      
      return {
        success: false,
        message,
        error
      }
    } finally {
      decrementRequests()
    }
  }

  // GET请求
  const get = (url, params = {}, options = {}) => {
    return request({
      method: 'GET',
      url,
      params
    }, options)
  }

  // POST请求
  const post = (url, data = {}, options = {}) => {
    return request({
      method: 'POST',
      url,
      data
    }, options)
  }

  // PUT请求
  const put = (url, data = {}, options = {}) => {
    return request({
      method: 'PUT',
      url,
      data
    }, options)
  }

  // DELETE请求
  const del = (url, options = {}) => {
    return request({
      method: 'DELETE',
      url
    }, options)
  }

  // 文件上传
  const upload = (url, file, onProgress, options = {}) => {
    const formData = new FormData()
    formData.append('file', file)

    return request({
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(percentCompleted)
        }
      }
    }, options)
  }

  return {
    // 状态
    pendingRequests,
    retryConfig,
    hasRequests,
    
    // 方法
    request,
    get,
    post,
    put,
    del,
    upload,
    incrementRequests,
    decrementRequests
  }
})