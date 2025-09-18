import { http } from '@/utils/request'
import type { ApiResponse, PageParams, PageResponse } from '@/types/api'

/**
 * 通用/基础数据相关API
 */
export const commonApi = {
  /**
   * 获取基础配置信息
   */
  getBasicConfig(): Promise<ApiResponse<any>> {
    return http.get('/basic')
  },

  /**
   * 获取常见问题列表
   */
  getQuestionList(): Promise<ApiResponse<any[]>> {
    return http.get('/question/list')
  },

  /**
   * 获取热门问题列表
   * @param limit 获取数量，默认6个
   */
  getHotQuestions(limit: number = 6): Promise<ApiResponse<any[]>> {
    return http.get('/question/list', { 
      limit, 
      isHot: true,
      status: 'active' 
    })
  },

  /**
   * 文件上传
   * @param file 文件对象
   */
  uploadFile(file: File): Promise<ApiResponse<{ src: string }>> {
    return http.upload('/sys/oss/upload', file)
  },

  /**
   * 获取系统配置
   */
  getSystemConfig(): Promise<ApiResponse<any>> {
    return http.get('/sys/config')
  },

  /**
   * 获取验证码
   * @param uuid 唯一标识
   */
  getCaptcha(uuid: string): void {
    window.open(`/captcha?uuid=${uuid}`, '_blank')
  },

  /**
   * 发送邮件验证码
   * @param email 邮箱地址
   */
  sendEmailCode(email: string): Promise<ApiResponse<null>> {
    return http.get('/product/common/code', { email })
  },

  /**
   * 获取轮播图列表
   */
  getBannerList(): Promise<ApiResponse<any[]>> {
    return http.get('/banner')
  },

  /**
   * 获取文章列表（分页）
   * @param params 分页参数
   */
  getArticleList(params: PageParams = { page: 1, limit: 10 }): Promise<ApiResponse<PageResponse<any>>> {
    return http.get('/product/article/page', params)
  },

  /**
   * 获取文章详情
   * @param id 文章ID
   */
  getArticleDetail(id: number): Promise<ApiResponse<any>> {
    return http.get(`/product/article/${id}`)
  }
}

/**
 * 购物车相关API
 */
export const cartApi = {
  getCartList() {
    // 后端从token中获取userId
    return http.get('/cart/list')
  },
  addToCart(productId: number, quantity: number, skuName?: string, skuPrice?: number) {
    // 后端从token获取userId
    return http.post('/cart/add', { productId, quantity, skuName, skuPrice })
  },
  updateCart(cartId: number, quantity: number) {
    // 后端从token获取userId
    return http.post('/cart/update', { cartId, quantity })
  },
  removeFromCart(cartId: number) {
    // 后端从token获取userId
    return http.post('/cart/remove', { cartId })
  },
  clearCart() {
    // 后端从token获取userId
    return http.post('/cart/clear')
  }
}

/**
 * 收藏相关API
 */
export const favoriteApi = {
  getFavorites(userId: number) {
    return http.get('/favorites/list')
  },
  addToFavorites(userId: number, goodsId: number) {
    return http.post(`/favorites/${goodsId}`)
  },
  removeFromFavorites(userId: number, goodsId: number) {
    return http.delete(`/favorites/${goodsId}`)
  },
  checkFavorite(userId: number, goodsId: number) {
    return http.get(`/favorites/check/${goodsId}`)
  }
} 