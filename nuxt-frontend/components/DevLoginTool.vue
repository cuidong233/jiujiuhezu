<template>
  <div v-if="isDev" class="dev-login-tool" :style="toolStyle" ref="toolRef">
    <div class="dev-panel">
      <div class="drag-handle" @mousedown="startDrag">
        🛠️ 开发工具 (可拖拽)
      </div>
      
      <div class="user-status">
        <p><strong>用户状态:</strong> {{ userStore.isLoggedIn ? '已登录' : '未登录' }}</p>
        <p v-if="userStore.user"><strong>用户名:</strong> {{ userStore.user.username }}</p>
        <p v-if="userStore.user"><strong>邮箱:</strong> {{ userStore.user.email }}</p>
      </div>
      
      <div class="dev-actions">
        <button v-if="!userStore.isLoggedIn" class="btn-login" @click="quickLogin">
          快速登录
        </button>
        <button v-if="userStore.isLoggedIn" class="btn-logout" @click="quickLogout">
          快速登出
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const toolRef = ref(null)
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const toolPosition = ref({ x: 20, y: 20 })

// 开发环境检测
const isDev = computed(() => {
  return process.env.NODE_ENV === 'development' || process.client
})

// 工具样式
const toolStyle = computed(() => ({
  left: toolPosition.value.x + 'px',
  top: toolPosition.value.y + 'px'
}))

// 快速登录
const quickLogin = () => {
  const mockUser = {
    id: 1,
    username: 'dev_user',
    email: 'dev@example.com',
    avatar: '/images/default-avatar.png'
  }
  userStore.setUser(mockUser, 'dev-token-' + Date.now())
}

// 快速登出
const quickLogout = () => {
  userStore.logout()
}

// 拖拽功能
const startDrag = (e) => {
  isDragging.value = true
  const rect = toolRef.value.getBoundingClientRect()
  dragOffset.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

const onDrag = (e) => {
  if (!isDragging.value) return
  
  toolPosition.value = {
    x: e.clientX - dragOffset.value.x,
    y: e.clientY - dragOffset.value.y
  }
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// 清理事件监听器
onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>

<style scoped>
.dev-login-tool {
  position: fixed;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 15px;
  border-radius: 8px;
  font-size: 12px;
  min-width: 250px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.dev-panel h3 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #00ff88;
}

.drag-handle {
  cursor: move;
  user-select: none;
  padding: 4px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 10px !important;
}

.drag-handle:hover {
  color: #00cc6a;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 4px 8px;
}

.user-status {
  margin-bottom: 10px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.user-status p {
  margin: 4px 0;
  font-size: 11px;
}

.dev-actions {
  display: flex;
  gap: 8px;
}

.dev-actions button {
  flex: 1;
  padding: 6px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
  transition: background-color 0.2s;
}

.btn-login {
  background: #00ff88;
  color: black;
}

.btn-login:hover {
  background: #00cc6a;
}

.btn-logout {
  background: #ff4444;
  color: white;
}

.btn-logout:hover {
  background: #cc3333;
}
</style> 