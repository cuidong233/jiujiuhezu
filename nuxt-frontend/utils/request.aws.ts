// AWS部署专用请求配置
import axios from 'axios'

// 动态获取API基础URL
const getApiBaseUrl = () => {
  // 服务端渲染时
  if (process.server) {
    return process.env.NUXT_PUBLIC_API_BASE || 'http://backend:3001'
  }
  
  // 客户端渲染时
  if (process.client) {
    // 如果是生产环境，使用当前域名
    if (process.env.NODE_ENV === 'production') {
      // 使用当前页面的协议和主机名
      const protocol = window.location.protocol
      const hostname = window.location.hostname
      return `${protocol}//${hostname}:3001`
    }
    // 开发环境
    return 'http://localhost:3001'
  }
  
  return 'http://localhost:3001'
}

// 创建axios实例
const request = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从localStorage获取token
    if (process.client) {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('响应错误:', error)
    
    if (error.response) {
      const { status, data } = error.response
      
      // 处理特定错误
      switch (status) {
        case 401:
          // 未授权，清除token
          if (process.client) {
            localStorage.removeItem('token')
            window.location.href = '/login'
          }
          break
        case 404:
          console.error('请求的资源不存在')
          break
        case 500:
          console.error('服务器错误')
          break
      }
      
      return Promise.reject(data || error)
    }
    
    return Promise.reject(error)
  }
)

export default request