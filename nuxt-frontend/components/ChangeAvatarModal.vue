<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h3 class="modal-title">更改头像</h3>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="avatar-preview">
          <img :src="previewUrl || userStore.user?.avatar || '/images/head1.png'" alt="头像预览" />
        </div>
        <div class="avatar-options">
          <h4>选择默认头像</h4>
          <div class="default-avatars">
            <div 
              v-for="i in 3" 
              :key="i" 
              class="avatar-option"
              :class="{ active: selectedAvatar === `/images/head${i}.png` }"
              @click="selectDefaultAvatar(`/images/head${i}.png`)"
            >
              <img :src="`/images/head${i}.png`" :alt="`头像${i}`" />
            </div>
          </div>
        </div>
        <div class="upload-section">
          <h4>或上传自定义头像</h4>
          <label class="upload-btn">
            <input type="file" accept="image/*" @change="handleFileSelect" hidden />
            <span>选择图片</span>
          </label>
          <p class="upload-hint">支持 JPG、PNG 格式，文件大小不超过 2MB</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('close')">取消</button>
        <button class="btn-confirm" @click="handleSubmit" :disabled="!selectedAvatar || loading">
          {{ loading ? '保存中...' : '确定' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { http } from '@/utils/request'

const emit = defineEmits(['close'])
const userStore = useUserStore()

const selectedAvatar = ref(userStore.user?.avatar || '/images/head1.png')
const previewUrl = ref(userStore.user?.avatar || '/images/head1.png')
const loading = ref(false)
const uploadedFile = ref<File | null>(null)

const selectDefaultAvatar = (avatar: string) => {
  selectedAvatar.value = avatar
  previewUrl.value = avatar
  uploadedFile.value = null
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // 检查文件大小
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过 2MB')
    return
  }
  
  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }
  
  uploadedFile.value = file
  
  // 创建预览URL
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string
    selectedAvatar.value = previewUrl.value
  }
  reader.readAsDataURL(file)
}

const handleSubmit = async () => {
  if (!selectedAvatar.value || loading.value) return
  
  loading.value = true
  try {
    let avatarUrl = selectedAvatar.value
    
    // 如果有上传的文件，先上传文件
    if (uploadedFile.value) {
      const formData = new FormData()
      formData.append('avatar', uploadedFile.value)
      
      const uploadRes = await http.post('/user/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (uploadRes.code === 0 && uploadRes.data?.url) {
        avatarUrl = uploadRes.data.url
      } else {
        throw new Error(uploadRes.msg || '头像上传失败')
      }
    }
    
    // 更新用户头像
    const res = await http.put('/user/profile', { avatar: avatarUrl })
    if (res.code === 0) {
      // 更新本地用户信息
      if (userStore.user) {
        userStore.user.avatar = avatarUrl
        localStorage.setItem('user', JSON.stringify(userStore.user))
      }
      ElMessage.success('头像更新成功')
      emit('close')
    } else {
      ElMessage.error(res.msg || '更新失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '更新失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 520px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 24px;
}

.avatar-preview {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.avatar-preview img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #f0f0f0;
}

.avatar-options h4,
.upload-section h4 {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin-bottom: 12px;
}

.default-avatars {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.avatar-option {
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 50%;
  padding: 2px;
  transition: all 0.2s;
}

.avatar-option:hover {
  border-color: #4A90E2;
  transform: scale(1.05);
}

.avatar-option.active {
  border-color: #4A90E2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.avatar-option img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.upload-section {
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.upload-btn {
  display: inline-block;
  padding: 10px 24px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-btn:hover {
  background: #e8e8e8;
  border-color: #999;
}

.upload-hint {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #eee;
}

.btn-cancel {
  padding: 10px 24px;
  border: 1px solid #ddd;
  background: white;
  color: #666;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f5f5f5;
  border-color: #999;
}

.btn-confirm {
  padding: 10px 24px;
  border: none;
  background: #4A90E2;
  color: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm:hover:not(:disabled) {
  background: #357ABD;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>