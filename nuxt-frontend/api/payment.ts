import { http } from '@/utils/request'
import type { ApiResponse } from '@/types/api'

/**
 * 支付相关API
 */
export const paymentApi = {
  /**
   * 获取支付链接
   * @param params 支付参数
   */
  getPaymentUrl(params: {
    orderId: string
    payType: string
    [key: string]: any
  }): Promise<ApiResponse<any>> {
    // 根据支付类型调用不同的接口
    if (params.payType === '2') {
      // 微信支付
      console.log('📤 微信支付请求参数:', {
        orderNo: params.orderId,
        amount: Number(params.amount),
        description: '商品购买',
        payType: 'native'
      })
      return http.post('/wechat/pay/create', {
        orderNo: params.orderId,
        amount: Number(params.amount),
        description: '商品购买',
        payType: 'native'  // 使用Native扫码支付，因为H5支付权限未开通
      })
    } else if (params.payType === '4') {
      // 支付宝支付 - payType为4
      return http.post('/payment/alipay/create', {
        orderNo: params.orderId,
        amount: Number(params.amount),
        subject: '商品购买'
      })
    } else if (params.payType === '3') {
      // 币安支付 - payType为3
      return http.post('/binance/pay/create', {
        orderNo: params.orderId,
        amount: Number(params.amount),
        currency: 'USDT',
        description: '商品购买'
      })
    }
    // 默认返回错误
    return Promise.resolve({
      code: -1,
      msg: '不支持的支付方式',
      success: false,
      data: null
    })
  },

  /**
   * 支付回调处理
   * @param type 支付类型
   * @param params 回调参数
   * @param signs 签名数据
   */
  paymentCallback(type: string, params: any, signs?: string): Promise<any> {
    return http.post(`/product/pay/${type}/callback`, signs, { params })
  },

  /**
   * 获取支付成功页面URL
   * @param orderNo 订单号
   */
  getPaymentSuccessUrl(orderNo: string): Promise<ApiResponse<string>> {
    return http.get(`/product/order/success/${orderNo}`)
  },

  /**
   * 获取支付配置
   * @param type 支付类型
   * @param params 配置参数
   */
  getPaymentConfig(type: string, params?: any): Promise<ApiResponse<any>> {
    return http.get(`/product/pay/config/${type}`, params)
  },

  // ✅ 真实API调用（已启用）
  /**
   * 检查支付状态
   * @param orderNo 订单号
   */
  checkPaymentStatus(orderNo: string): Promise<ApiResponse<{ status: string; paid: boolean }>> {
    // 暂时返回默认状态，等待后端实现支付状态检查功能
    return Promise.resolve({ 
      code: 0, 
      msg: 'success', 
      success: true, 
      data: { status: 'pending', paid: false } 
    })
  },

  // 🎨 前端UI设计阶段 - 创建支付订单功能（已注释，用于检查页面功能）
  // /**
  //  * 创建支付订单
  //  * @param params 支付订单参数
  //  */
  // createPayment(params: {
  //   orderNo: string
  //   amount: number
  //   payType: string
  //   returnUrl?: string
  //   notifyUrl?: string
  // }): Promise<ApiResponse<any>> {
  //   return http.post('/product/payment/create', params)
  // }
} 