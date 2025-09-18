// API配置
export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002/api'

// API端点
export const API_ENDPOINTS = {
  // 文章相关
  articles: {
    list: `${API_BASE_URL}/articles`,
    detail: (id) => `${API_BASE_URL}/articles/${id}`,
    like: (id) => `${API_BASE_URL}/articles/${id}/like`
  },
  // 其他API...
}

export default {
  API_BASE_URL,
  API_ENDPOINTS
}