import { http } from '@/utils/request'
import type { Order, PageParams, PageResponse, ApiResponse } from '@/types/api'

/**
 * 订单相关API
 */
export const orderApi = {
  /**
   * 创建订单
   * @param params 订单参数
   */
  createOrder(params: {
    unicode: string
    [key: string]: any
  }): Promise<ApiResponse<Order>> {
    return http.post('/product/order/createOrder', params)
  },

  /**
   * 创建续费订单
   * @param params 续费参数
   */
  createRenewOrder(params: {
    unicode: string
    [key: string]: any
  }): Promise<ApiResponse<Order>> {
    return http.post('/product/order/createRenewOrder', params)
  },

  // ✅ 真实API调用（已启用）
  /**
   * 获取订单列表
   * @param params 查询参数
   */
  getOrderList(params: PageParams & {
    status?: number
    startTime?: string
    endTime?: string
    userEmail?: string
  }): Promise<ApiResponse<PageResponse<Order>>> {
    // 使用用户ID查询订单
    const userStore = useUserStore()
    const user = userStore.user
    
    // 如果用户登录了，使用用户ID查询
    if (user?.id) {
      return http.get(`/order/user/${user.id}`, params)
    }
    
    // 如果传入了userEmail参数，使用管理接口查询
    if (params.userEmail) {
      return http.get('/order/admin/list', params)
    }
    
    return Promise.reject(new Error('用户未登录'))
  },

  /**
   * 获取订单详情
   * @param orderNo 订单号
   */
  getOrderDetail(orderNo: string): Promise<ApiResponse<any>> {
    return http.get(`/product/order/info/${orderNo}`)
  },

  /**
   * 取消订单
   * @param orderNo 订单号
   */
  cancelOrder(orderNo: string): Promise<ApiResponse<null>> {
    return http.post(`/product/order/closeOrder/${orderNo}`)
  },

  // 🎨 前端UI设计阶段 - 订单删除功能（已注释，用于检查页面功能）
  // /**
  //  * 删除订单
  //  * @param orderNo 订单号
  //  */
  // deleteOrder(orderNo: string): Promise<ApiResponse<null>> {
  //   return http.delete(`/product/order/deleteOrder/${orderNo}`)
  // },

  /**
   * 获取订单发货信息
   * @param orderNo 订单号
   */
  getDeliveryInfo(orderNo: string): Promise<ApiResponse<any>> {
    return http.get(`/order/delivery-info/${orderNo}`)
  },

  /**
   * 获取订单回执单信息
   * @param orderNo 订单号
   */
  getOrderReceipts(orderNo: string): Promise<ApiResponse<any>> {
    return http.get(`/order/receipts/${orderNo}`)
  },

  /**
   * 填写回执
   * @param orderNo 订单号
   * @param params 回执参数
   */
  submitReceipt(orderNo: string, params: {
    receiptData: any
  }): Promise<ApiResponse<any>> {
    return http.post(`/order/receipts/${orderNo}/submit`, params)
  },

  /**
   * 申请修改回执单
   * @param orderNo 订单号
   * @param params 修改参数
   */
  modifyReceipt(orderNo: string, params: {
    receiptData: any
    reason: string
  }): Promise<ApiResponse<any>> {
    return http.post(`/order/receipts/${orderNo}/modify`, params)
  },

  // TODO: 待后端实现退款申请功能
  // /**
  //  * 申请退款
  //  * @param orderId 订单ID
  //  * @param params 退款参数
  //  */
  // applyRefund(orderId: number, params: {
  //   reason: string
  //   amount: number
  //   description?: string
  // }): Promise<ApiResponse<null>> {
  //   return http.post(`/product/order/refund/${orderId}`, params)
  // },

  /**
   * 获取拼友列表
   * @param orderNo 订单号
   */
  getFriends(orderNo: string): Promise<ApiResponse<any[]>> {
    return http.get(`/product/order/friend/${orderNo}`)
  },

  /**
   * 获取订单支付信息
   * @param orderNo 订单号
   */
  getPaymentInfo(orderNo: string): Promise<ApiResponse<any>> {
    return http.get(`/product/order/payment/${orderNo}`)
  },

  /**
   * 获取订单状态
   * @param orderNo 订单号
   */
  getOrderStatus(orderNo: string): Promise<ApiResponse<{ status: number }>> {
    return http.get(`/product/order/status/${orderNo}`)
  },

  // TODO: 待后端实现退款记录查询功能
  // /**
  //  * 获取退款记录
  //  * @param params 分页参数
  //  */
  // getRefundList(params: PageParams): Promise<ApiResponse<PageResponse<any>>> {
  //   return http.get('/api/order/refunds', params)
  // },

  // TODO: 待后端实现订单统计功能
  // /**
  //  * 获取订单统计
  //  */
  // getOrderStats(): Promise<ApiResponse<{
  //   total: number
  //   pending: number
  //   paid: number
  //   shipped: number
  //   completed: number
  //   cancelled: number
  // }>> {
  //   return http.get('/api/order/stats')
  // }
} 