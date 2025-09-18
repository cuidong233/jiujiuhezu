import { http } from '~/utils/request'

export const notificationApi = {
  // 获取通知列表
  getList(params?: {
    page?: number
    pageSize?: number
    isRead?: boolean
  }) {
    return http.get('/notification/list', params)
  },

  // 获取未读数量
  getUnreadCount() {
    return http.get('/notification/unread-count')
  },

  // 标记为已读
  markAsRead(id: string | number) {
    return http.put(`/notification/${id}/read`)
  },

  // 标记全部为已读
  markAllAsRead() {
    return http.put('/notification/read-all')
  },

  // 删除通知
  deleteNotification(id: string | number) {
    return http.delete(`/notification/${id}`)
  },

  // 批量删除通知
  batchDelete(ids: (string | number)[]) {
    return http.post('/notification/batch-delete', { ids })
  }
}