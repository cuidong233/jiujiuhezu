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
                    placeholder="请输入密码" 
                    required 
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
              <div class="form-links">
                <a @click.prevent="onForgot">忘记密码？</a>
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
          
          <!-- 其他登录方式 -->
          <div class="other-login">
            <div class="divider">
              <span>或使用其他方式登录</span>
            </div>
            <div class="social-login">
              <button type="button" class="social-btn" @click="loginWithGoogle" title="Google登录">
                <Icon name="mdi:google" />
              </button>
              <button type="button" class="social-btn" @click="loginWithGithub" title="GitHub登录">
                <Icon name="mdi:github" />
              </button>
              <button type="button" class="social-btn" @click="loginWithTwitter" title="Twitter登录">
                <Icon name="mdi:twitter" />
              </button>
            </div>
          </div>
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
const codeTimer = ref(0)

// 计算属性
const submitButtonText = computed(() => {
  if (loading.value) return '处理中...'
  return '登录'
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

// 快速切换到验证码登录
const switchToCodeLogin = () => {
  switchLoginType('code')
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
      email: form.value.email, 
      type: 'login' // 统一使用login类型，后端会自动处理注册
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
    let res
    
    // 使用统一认证接口
    const authData = {
      email: form.value.email
    }
    
    if (loginType.value === 'password') {
      // 密码方式
      if (!form.value.password) {
        message.value = '请输入密码'
        messageType.value = 'error'
        return
      }
      authData.password = form.value.password
    } else if (loginType.value === 'code') {
      // 验证码方式
      if (!form.value.code) {
        message.value = '请输入验证码'
        messageType.value = 'error'
        return
      }
      authData.code = form.value.code
    }
    
    res = await http.post('/product/common/unified-auth', authData)
    
    if (res.code === 0 && res.data) {
      // 保存登录信息
      if (process.client) {
        localStorage.setItem('token', res.data.tokenValue)
        localStorage.setItem('user', JSON.stringify(res.data))
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

// 社交登录（暂未实现）
const loginWithGoogle = () => {
  message.value = '谷歌登录暂未开放'
  messageType.value = 'info'
}

const loginWithGithub = () => {
  message.value = 'GitHub登录暂未开放'
  messageType.value = 'info'
}

const loginWithTwitter = () => {
  message.value = 'Twitter登录暂未开放'
  messageType.value = 'info'
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  color: #667eea;
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
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
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
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.code-btn-inside:hover:not(:disabled) {
  background: #5a67d8;
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
}

.password-toggle:hover {
  color: #667eea;
}

.form-tips {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f0f7ff;
  border-radius: 8px;
  margin-bottom: 20px;
  color: #667eea;
  font-size: 14px;
}

.form-links {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  margin-bottom: 20px;
}

.form-links a {
  color: #667eea;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
}

.form-links a:hover {
  text-decoration: underline;
}

.form-row {
  margin-bottom: 20px;
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
  color: #667eea;
  text-decoration: none;
}

.checkbox-label a:hover {
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  box-shadow: 0 10px 20px rgba(102,126,234,0.3);
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

.other-login {
  margin-top: 30px;
}

.divider {
  text-align: center;
  position: relative;
  margin-bottom: 20px;
}

.divider::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background: #e0e0e0;
}

.divider span {
  position: relative;
  background: white;
  padding: 0 15px;
  color: #999;
  font-size: 14px;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.social-btn {
  width: 48px;
  height: 48px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 20px;
  color: #666;
}

.social-btn:hover {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
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