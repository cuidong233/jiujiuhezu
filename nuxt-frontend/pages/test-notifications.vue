<template>
  <div class="test-notifications-page">
    <h1>通知测试页面</h1>
    
    <div class="user-info">
      <h2>当前用户信息</h2>
      <p v-if="userInfo">
        用户ID: {{ userInfo.id }}<br>
        邮箱: {{ userInfo.email }}<br>
        昵称: {{ userInfo.nickname }}
      </p>
      <p v-else>未登录</p>
    </div>

    <div class="notification-section">
      <h2>通知铃铛组件</h2>
      <NotificationBell />
    </div>

    <div class="manual-test">
      <h2>手动测试通知API</h2>
      <el-button @click="testNotifications">获取通知</el-button>
      <el-button @click="getUnreadCount">获取未读数量</el-button>
    </div>

    <div v-if="notifications.length > 0" class="notifications-list">
      <h3>通知列表 ({{ notifications.length }} 条)</h3>
      <div v-for="n in notifications" :key="n.id" class="notification-item">
        <el-card>
          <h4>{{ n.title }}</h4>
          <p>{{ n.content }}</p>
          <p>
            <el-tag :type="n.isRead ? 'info' : 'danger'">
              {{ n.isRead ? '已读' : '未读' }}
            </el-tag>
            <el-tag>{{ n.type }}</el-tag>
          </p>
          <p>时间: {{ new Date(n.createdAt).toLocaleString('zh-CN') }}</p>
          <el-button v-if="!n.isRead" @click="markAsRead(n.id)" size="small">
            标记已读
          </el-button>
        </el-card>
      </div>
    </div>

    <div class="debug-info">
      <h3>调试信息</h3>
      <pre>{{ debugInfo }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { notificationApi } from '~/api/notification'
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const notifications = ref<any[]>([])
const debugInfo = ref('')

const testNotifications = async () => {
  try {
    debugInfo.value = '正在获取通知...\n'
    
    const response = await notificationApi.getList({
      page: 1,
      pageSize: 20
    })
    
    debugInfo.value += `响应状态: ${response.code || response.status}\n`
    debugInfo.value += `响应数据: ${JSON.stringify(response, null, 2)}\n`
    
    if (response.success || response.code === 200) {
      notifications.value = response.data.list || []
      ElMessage.success(`获取到 ${notifications.value.length} 条通知`)
    } else {
      ElMessage.error('获取通知失败')
    }
  } catch (error: any) {
    debugInfo.value += `错误: ${error.message}\n`
    debugInfo.value += `错误详情: ${JSON.stringify(error.response?.data, null, 2)}\n`
    ElMessage.error('获取通知失败: ' + error.message)
  }
}

const getUnreadCount = async () => {
  try {
    const response = await notificationApi.getUnreadCount()
    
    if (response.success || response.code === 200) {
      ElMessage.success(`未读通知数量: ${response.data.count}`)
      debugInfo.value = `未读数量: ${response.data.count}\n`
    }
  } catch (error: any) {
    ElMessage.error('获取未读数量失败: ' + error.message)
    debugInfo.value = `错误: ${error.message}\n`
  }
}

const markAsRead = async (id: number) => {
  try {
    await notificationApi.markAsRead(id)
    ElMessage.success('已标记为已读')
    await testNotifications() // 刷新列表
  } catch (error: any) {
    ElMessage.error('标记失败: ' + error.message)
  }
}

onMounted(() => {
  debugInfo.value = `用户信息: ${JSON.stringify(userInfo.value, null, 2)}\n`
  debugInfo.value += `Token: ${localStorage.getItem('token') ? '存在' : '不存在'}\n`
})
</script>

<style scoped>
.test-notifications-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.user-info,
.notification-section,
.manual-test,
.notifications-list,
.debug-info {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.notification-item {
  margin-bottom: 15px;
}

.debug-info pre {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}

h1 {
  color: #333;
  margin-bottom: 30px;
}

h2 {
  color: #666;
  margin-bottom: 15px;
  font-size: 18px;
}

h3 {
  color: #999;
  margin-bottom: 10px;
  font-size: 16px;
}
</style>