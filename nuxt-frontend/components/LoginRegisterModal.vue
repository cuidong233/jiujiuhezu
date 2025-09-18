<template>
  <div v-if="visible" class="modal-mask" @click.self="close">
    <div class="login-modal">
      <!-- 头部 -->
      <div class="modal-header">
        <div class="modal-header-inner">
          <div class="modal-title">凡图拉</div>
          <div class="modal-subtitle">欢迎回来，请登录您的账户</div>
          <button class="modal-close" @click="close">×</button>
        </div>
      </div>
      
      <!-- 主体 -->
      <div class="modal-body">
        <div class="modal-form-area">
          <!-- 登录方式切换 -->
          <div class="login-type-tabs">
            <button 
              type="button" 
              :class="['login-type-btn', {active: loginType==='password'}]" 
              @click="switchLoginType('password')"
            >
              密码登录
            </button>
            <button 
              type="button" 
              :class="['login-type-btn', {active: loginType==='code'}]" 
              @click="switchLoginType('code')"
            >
              验证码登录
            </button>
          </div>
          
          <form @submit.prevent="handleSubmit">
            <!-- 邮箱输入 -->
            <div class="form-group">
              <label>邮箱地址</label>
              <input 
                v-model="form.email" 
                type="email" 
                placeholder="请输入您的邮箱" 
                required 
                @input="validateEmail"
                :class="{ 'error': emailError }"
              />
              <span v-if="emailError" class="error-message">{{ emailError }}</span>
            </div>
            
            <!-- 密码登录 -->
            <template v-if="loginType === 'password'">
              <div class="form-group">
                <label>密码</label>
                <div class="password-input-wrapper">
                  <input 
                    v-model="form.password" 
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="请输入密码（新用户将自动注册）" 
                    required 
                    minlength="6"
                  />
                  <button 
                    type="button" 
                    class="password-toggle"
                    @click="showPassword = !showPassword"
                  >
                    <Icon :name="showPassword ? 'mdi:eye-off' : 'mdi:eye'" />
                  </button>
                </div>
              </div>
              <div class="form-tips">
                <Icon name="mdi:information-outline" />
                <span>新用户输入密码后将自动注册</span>
              </div>
            </template>
            
            <!-- 验证码登录/注册 -->
            <template v-else-if="loginType === 'code'">
              <div class="form-group code-group">
                <label>验证码</label>
                <input 
                  v-model="form.code" 
                  type="text" 
                  placeholder="请输入验证码" 
                  maxlength="6"
                  required 
                />
                <button 
                  class="code-btn-inside" 
                  type="button" 
                  :disabled="codeTimer > 0 || !form.email || emailError" 
                  @click="sendCode"
                >
                  {{ codeTimer > 0 ? codeTimer + 's' : '获取验证码' }}
                </button>
              </div>
              <div class="form-tips">
                <Icon name="mdi:information-outline" />
                <span>未注册的邮箱验证后将自动创建账号</span>
              </div>
            </template>
            
            <!-- 记住我和忘记密码 -->
            <div class="form-row" v-if="loginType === 'password'">
              <label><input type="checkbox" v-model="remember" /> 记住我</label>
              <a class="forgot-link" @click.prevent="onForgot">忘记密码？</a>
            </div>
            
            <!-- 协议同意 -->
            <div class="form-row">
              <label class="checkbox-label">
                <input type="checkbox" v-model="agree" required /> 
                <span>我已阅读并同意 
                  <NuxtLink to="/privacy" target="_blank">《隐私协议》</NuxtLink> 和 
                  <NuxtLink to="/policy" target="_blank">《用户政策》</NuxtLink>
                </span>
              </label>
            </div>
            
            <!-- 提交按钮 -->
            <button class="submit-btn" type="submit" :disabled="loading">
              <span v-if="loading" class="loading-spinner"></span>
              {{ submitButtonText }}
            </button>
            
            <!-- 错误提示 -->
            <div v-if="message" :class="['message', messageType]">
              {{ message }}
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useUserStore } from '~/stores/user'
import { http } from '~/utils/request'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['close'])

const userStore = useUserStore()
const tokenCookie = useCookie('token')

// 表单数据
const loginType = ref('password') // 'code' | 'password'
const form = ref({
  email: '',
  code: '',
  password: ''
})

// UI状态
const loading = ref(false)
const message = ref('')
const messageType = ref('error')
const emailError = ref('')
const showPassword = ref(false)
const agree = ref(false)
const remember = ref(false)
const codeTimer = ref(0)

// 计算属性
const submitButtonText = computed(() => {
  if (loading.value) return '处理中...'
  return '登录 / 注册'
})

// 邮箱验证
const validateEmail = () => {
  const email = form.value.email
  if (!email) {
    emailError.value = ''
    return false
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    emailError.value = '请输入有效的邮箱地址'
    return false
  }
  emailError.value = ''
  return true
}

// 切换登录方式
const switchLoginType = (type) => {
  loginType.value = type
  message.value = ''
  // 清空不需要的字段
  if (type === 'code') {
    form.value.password = ''
  } else {
    form.value.code = ''
  }
}

// 发送验证码
let codeInterval = null
const sendCode = async () => {
  if (!validateEmail()) {
    message.value = '请输入有效的邮箱地址'
    messageType.value = 'error'
    return
  }
  
  loading.value = true
  message.value = ''
  
  try {
    await http.get('/product/common/code', { 
      email: form.value.email
    })
    
    message.value = '验证码已发送到您的邮箱'
    messageType.value = 'success'
    
    // 开始倒计时
    codeTimer.value = 60
    codeInterval = setInterval(() => {
      codeTimer.value--
      if (codeTimer.value <= 0) {
        clearInterval(codeInterval)
      }
    }, 1000)
  } catch (error) {
    message.value = error.response?.data?.msg || '发送失败，请稍后重试'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!validateEmail()) {
    message.value = '请输入有效的邮箱地址'
    messageType.value = 'error'
    return
  }
  
  if (!agree.value) {
    message.value = '请先同意用户协议'
    messageType.value = 'error'
    return
  }
  
  loading.value = true
  message.value = ''
  
  try {
    // 使用统一认证接口
    const authData = {
      email: form.value.email
    }
    
    if (loginType.value === 'password') {
      // 密码方式
      if (!form.value.password) {
        message.value = '请输入密码'
        messageType.value = 'error'
        loading.value = false
        return
      }
      if (form.value.password.length < 6) {
        message.value = '密码长度至少6位'
        messageType.value = 'error'
        loading.value = false
        return
      }
      authData.password = form.value.password
    } else if (loginType.value === 'code') {
      // 验证码方式
      if (!form.value.code) {
        message.value = '请输入验证码'
        messageType.value = 'error'
        loading.value = false
        return
      }
      authData.code = form.value.code
    }
    
    const res = await http.post('/product/common/unified-auth', authData)
    
    if (res.code === 0 && res.data) {
      // 保存登录信息
      if (process.client) {
        localStorage.setItem('token', res.data.tokenValue)
        localStorage.setItem('user', JSON.stringify(res.data))
        if (remember.value) {
          localStorage.setItem('rememberedEmail', form.value.email)
        }
      }
      tokenCookie.value = res.data.tokenValue
      userStore.setUser(res.data, res.data.tokenValue)
      
      // 根据是否新用户显示不同提示
      message.value = res.data.isNewUser ? '注册并登录成功' : '登录成功'
      messageType.value = 'success'
      
      // 延迟关闭弹窗
      setTimeout(() => {
        close()
        // 刷新页面或跳转
        if (process.client) {
          window.location.reload()
        }
      }, 1000)
    } else {
      message.value = res.msg || '操作失败'
      messageType.value = 'error'
    }
  } catch (error) {
    message.value = error.response?.data?.msg || '网络错误，请稍后重试'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}

// 忘记密码
const onForgot = () => {
  message.value = '请使用验证码登录，登录后可重置密码'
  messageType.value = 'info'
  switchLoginType('code')
}

// 关闭弹窗
const close = () => {
  emit('close')
  // 重置表单
  form.value = { email: '', code: '', password: '' }
  message.value = ''
  emailError.value = ''
  agree.value = false
  if (codeInterval) {
    clearInterval(codeInterval)
    codeTimer.value = 0
  }
}

// 监听弹窗关闭
watch(() => props.visible, (newVal) => {
  if (!newVal) {
    if (codeInterval) {
      clearInterval(codeInterval)
      codeTimer.value = 0
    }
  }
})

// 组件挂载时检查记住的邮箱
onMounted(() => {
  if (process.client) {
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    if (rememberedEmail) {
      form.value.email = rememberedEmail
      remember.value = true
    }
  }
})
</script>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s;
}

.login-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 420px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  animation: slideUp 0.3s;
}

.modal-header {
  background: linear-gradient(135deg, #4F7BFF 0%, #335ACC 100%);
  padding: 30px;
  color: white;
  position: relative;
}

.modal-header-inner {
  text-align: center;
}

.modal-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}

.modal-subtitle {
  font-size: 16px;
  opacity: 0.9;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  font-size: 24px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
}

.modal-close:hover {
  background: rgba(255,255,255,0.3);
  transform: rotate(90deg);
}

.modal-body {
  padding: 30px;
}

.login-type-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
  padding: 4px;
  background: #f5f5f5;
  border-radius: 8px;
}

.login-type-btn {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  color: #666;
  font-size: 15px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.login-type-btn.active {
  background: white;
  color: #4F7BFF;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #4F7BFF;
  box-shadow: 0 0 0 3px rgba(79,123,255,0.1);
}

.form-group input.error {
  border-color: #ff4444;
}

.error-message {
  display: block;
  margin-top: 5px;
  color: #ff4444;
  font-size: 13px;
}

.code-group {
  position: relative;
}

.code-group input {
  padding-right: 110px;
}

.code-btn-inside {
  position: absolute;
  right: 5px;
  bottom: 5px;
  padding: 8px 15px;
  background: #4F7BFF;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.code-btn-inside:hover:not(:disabled) {
  background: #335ACC;
}

.code-btn-inside:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.password-input-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 5px;
  font-size: 20px;
}

.password-toggle:hover {
  color: #4F7BFF;
}

.form-tips {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f0f7ff;
  border-radius: 8px;
  margin-bottom: 20px;
  color: #4F7BFF;
  font-size: 14px;
}

.form-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 14px;
}

.form-row label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  cursor: pointer;
}

.form-row input[type="checkbox"] {
  cursor: pointer;
}

.forgot-link {
  color: #4F7BFF;
  text-decoration: none;
  cursor: pointer;
}

.forgot-link:hover {
  text-decoration: underline;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.checkbox-label input {
  margin-top: 2px;
  cursor: pointer;
}

.checkbox-label a {
  color: #4F7BFF;
  text-decoration: none;
}

.checkbox-label a:hover {
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #4F7BFF 0%, #335ACC 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(79,123,255,0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
  vertical-align: middle;
}

.message {
  margin-top: 15px;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
}

.message.error {
  background: #ffebee;
  color: #c62828;
}

.message.success {
  background: #e8f5e9;
  color: #2e7d32;
}

.message.info {
  background: #e3f2fd;
  color: #1565c0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>