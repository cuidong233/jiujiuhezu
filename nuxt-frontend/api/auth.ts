import { http } from '@/utils/request'
import type { LoginParams, LoginResponse, User, ApiResponse } from '@/types/api'

/**
 * 认证相关API
 */
export const authApi = {
  /**
   * 用户登录
   * @param params 登录参数
   */
  login(params: LoginParams): Promise<ApiResponse<LoginResponse>> {
    return http.post('/product/common/mail/login', params)
  },

  /**
   * 邮箱验证码登录
   * @param params 登录参数
   */
  loginWithCode(params: {
    email: string
    code: string
  }): Promise<ApiResponse<LoginResponse>> {
    return http.post('/product/common/mail/code', params)
  },

  /**
   * 获取邮箱验证码
   * @param email 邮箱地址
   */
  getEmailCode(email: string): Promise<ApiResponse<null>> {
    return http.get('/product/common/code', { email })
  },

  // TODO: 待后端实现用户注册功能
  // /**
  //  * 用户注册
  //  * @param params 注册参数
  //  */
  // register(params: {
  //   username: string
  //   password: string
  //   email: string
  //   confirmPassword: string
  //   code?: string
  // }): Promise<ApiResponse<LoginResponse>> {
  //   return http.post('/product/auth/register', params)
  // },

  /**
   * 用户退出登录
   */
  logout(): Promise<ApiResponse<null>> {
    return http.post('/product/auth/logout')
  },

  /**
   * 获取当前用户信息
   */
  getUserInfo(): Promise<ApiResponse<User>> {
    return http.get('/product/auth/getUserInfo')
  },

  // TODO: 待后端实现token刷新功能
  // /**
  //  * 刷新token
  //  */
  // refreshToken(): Promise<ApiResponse<{ token: string }>> {
  //   return http.post('/product/auth/refresh')
  // },

  // TODO: 待后端实现密码修改功能
  // /**
  //  * 修改密码
  //  * @param params 密码参数
  //  */
  // changePassword(params: {
  //   oldPassword: string
  //   newPassword: string
  //   confirmPassword: string
  // }): Promise<ApiResponse<null>> {
  //   return http.post('/product/auth/change-password', params)
  // },

  // TODO: 待后端实现密码重置功能
  // /**
  //  * 重置密码
  //  * @param params 重置参数
  //  */
  // resetPassword(params: {
  //   email: string
  //   code: string
  //   newPassword: string
  //   confirmPassword: string
  // }): Promise<ApiResponse<null>> {
  //   return http.post('/product/auth/reset-password', params)
  // },

  // /**
  //  * 发送重置密码验证码
  //  * @param email 邮箱地址
  //  */
  // sendResetCode(email: string): Promise<ApiResponse<null>> {
  //   return http.post('/product/auth/send-reset-code', { email })
  // },

  // TODO: 待后端实现token验证功能
  // /**
  //  * 验证token有效性
  //  */
  // verifyToken(): Promise<ApiResponse<{ valid: boolean }>> {
  //   return http.get('/product/auth/verify')
  // }
} 