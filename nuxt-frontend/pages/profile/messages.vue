<template>
  <div class="messages-section">
    <div class="section-header">
      <h2 class="section-title">
        我的消息
        <el-badge v-if="unreadCount > 0" :value="unreadCount" class="unread-badge" />
      </h2>
      <div class="header-actions">
        <el-button v-if="notifications.length > 0" @click="markAllAsRead" size="small" type="primary">
          全部标记为已读
        </el-button>
      </div>
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>
    
    <div v-else-if="notifications.length === 0" class="placeholder-content">
      <el-empty description="暂无消息" />
    </div>
    
    <div v-else class="notifications-list">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        class="notification-item"
        :class="{ unread: !notification.isRead }"
        @click="markAsRead(notification)"
      >
        <div class="notification-header">
          <span class="notification-type" :class="getTypeClass(notification.type)">
            {{ getTypeLabel(notification.type) }}
          </span>
          <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
        </div>
        <h4 class="notification-title">{{ notification.title }}</h4>
        <p class="notification-content">{{ notification.content }}</p>
        <div class="notification-actions">
          <el-button @click.stop="deleteNotification(notification.id)" size="small" type="danger" text>
            删除
          </el-button>
        </div>
      </div>
    </div>
    
    <div v-if="!loading && hasMore" class="load-more">
      <el-button @click="loadMore" :loading="loadingMore">加载更多</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { notificationApi } from '@/api/notification'
import { ElMessage, ElMessageBox } from 'element-plus'

const userStore = useUserStore()

interface Notification {
  id: number
  userId: number
  type: string
  title: string
  content: string
  isRead: boolean
  createdAt: string
  updatedAt: string
}

const notifications = ref<Notification[]>([])
const unreadCount = ref(0)
const loading = ref(true)
const loadingMore = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = 10
let pollInterval: NodeJS.Timeout | null = null

const getTypeClass = (type: string) => {
  const typeMap: Record<string, string> = {
    'receipt_approved': 'success',
    'receipt_rejected': 'danger',
    'order': 'primary',
    'system': 'info'
  }
  return typeMap[type] || 'info'
}

const getTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    'receipt_approved': '审核通过',
    'receipt_rejected': '审核拒绝',
    'order': '订单消息',
    'system': '系统消息'
  }
  return labelMap[type] || '通知'
}

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes === 0 ? '刚刚' : `${minutes}分钟前`
    }
    return `${hours}小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

const fetchNotifications = async (page = 1) => {
  try {
    const response = await notificationApi.getList({
      page,
      pageSize
    })
    
    if (response.code === 0) {
      if (page === 1) {
        notifications.value = response.data.list || []
      } else {
        notifications.value.push(...(response.data.list || []))
      }
      hasMore.value = response.data.total > notifications.value.length
      currentPage.value = page
    }
  } catch (error) {
    console.error('获取通知失败:', error)
    ElMessage.error('获取消息失败')
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const fetchUnreadCount = async () => {
  try {
    const response = await notificationApi.getUnreadCount()
    if (response.code === 0) {
      unreadCount.value = response.data.count || 0
    }
  } catch (error) {
    console.error('获取未读数量失败:', error)
  }
}

const markAsRead = async (notification: Notification) => {
  if (notification.isRead) return
  
  try {
    const response = await notificationApi.markAsRead(notification.id)
    if (response.code === 0) {
      notification.isRead = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  } catch (error) {
    console.error('标记已读失败:', error)
  }
}

const markAllAsRead = async () => {
  try {
    const response = await notificationApi.markAllAsRead()
    if (response.code === 0) {
      notifications.value.forEach(n => n.isRead = true)
      unreadCount.value = 0
      ElMessage.success('已全部标记为已读')
    }
  } catch (error) {
    console.error('标记全部已读失败:', error)
    ElMessage.error('操作失败')
  }
}

const deleteNotification = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条消息吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await notificationApi.deleteNotification(id)
    if (response.code === 0) {
      const index = notifications.value.findIndex(n => n.id === id)
      if (index > -1) {
        if (!notifications.value[index].isRead) {
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
        notifications.value.splice(index, 1)
      }
      ElMessage.success('删除成功')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const loadMore = () => {
  loadingMore.value = true
  fetchNotifications(currentPage.value + 1)
}

const startPolling = () => {
  pollInterval = setInterval(() => {
    fetchUnreadCount()
    if (currentPage.value === 1) {
      fetchNotifications(1)
    }
  }, 30000)
}

const stopPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

onMounted(() => {
  fetchNotifications()
  fetchUnreadCount()
  startPolling()
})

onUnmounted(() => {
  stopPolling()
})
</script>
<style scoped>
.messages-section { 
  padding: 0; 
  height: 100%; 
}

.section-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 30px; 
  padding-bottom: 15px; 
  border-bottom: 1px solid #f0f0f0; 
}

.section-title { 
  font-size: 20px; 
  font-weight: 600; 
  color: #333; 
  margin: 0; 
  display: flex;
  align-items: center;
  gap: 10px;
}

.unread-badge {
  margin-left: 10px;
}

.placeholder-content { 
  text-align: center; 
  padding: 60px 20px; 
  color: #999; 
}

.loading-container {
  padding: 20px;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.notification-item {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 15px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.notification-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.notification-item.unread {
  background: #f0f7ff;
  border-color: #409eff;
  position: relative;
}

.notification-item.unread::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  background: #409eff;
  border-radius: 50%;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.notification-type {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.notification-type.success {
  background: #f0f9ff;
  color: #67c23a;
  border: 1px solid #67c23a;
}

.notification-type.danger {
  background: #fef0f0;
  color: #f56c6c;
  border: 1px solid #f56c6c;
}

.notification-type.primary {
  background: #ecf5ff;
  color: #409eff;
  border: 1px solid #409eff;
}

.notification-type.info {
  background: #f4f4f5;
  color: #909399;
  border: 1px solid #909399;
}

.notification-time {
  font-size: 12px;
  color: #999;
}

.notification-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0 0 8px 0;
}

.notification-content {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 10px 0;
}

.notification-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.load-more {
  text-align: center;
  padding: 20px 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}
</style> 