<template>
  <div class="modal-mask">
    <div class="bind-email-modal">
      <div class="modal-header">
        <div class="modal-title">绑定邮箱</div>
        <div class="modal-subtitle">验证邮箱地址以完成绑定</div>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      <div class="modal-content">
        <div class="email-box">
          <div class="email-label">当前绑定邮箱</div>
          <div class="email-value">user@example.com</div>
          <button class="btn-send" :disabled="countdown > 0" @click="sendCode">
            {{ countdown > 0 ? `${countdown}s后可重发` : '发送验证码' }}
          </button>
        </div>
        <div class="form-group">
          <label class="form-label">请输入验证码</label>
          <input class="form-input" v-model="code" maxlength="6" placeholder="6位验证码" />
          <div class="code-tip">
            验证码已发送至邮箱，有效时间：<span class="code-time">{{ timeLeft }}</span>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="$emit('close')">取消</button>
          <button class="btn-confirm" :disabled="!code || code.length !== 6">确认绑定</button>
        </div>
        <div class="modal-footer-tip">
          未收到验证码？请检查垃圾邮件或
          <span class="resend-link" @click="sendCode">重新发送</span>
          <br />
          绑定邮箱可用于找回密码和接收重要通知
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const code = ref('')
const countdown = ref(0)
const timer = ref<any>(null)
const timeLeft = ref('05:00')

function sendCode() {
  if (countdown.value > 0) return
  countdown.value = 60
  let total = 300
  timeLeft.value = '05:00'
  clearInterval(timer.value)
  timer.value = setInterval(() => {
    if (countdown.value > 0) countdown.value--
    if (total > 0) total--
    const m = String(Math.floor(total / 60)).padStart(2, '0')
    const s = String(total % 60).padStart(2, '0')
    timeLeft.value = `${m}:${s}`
    if (total <= 0) clearInterval(timer.value)
  }, 1000)
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 2000;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}
.bind-email-modal {
  width: 420px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  overflow: hidden;
}
.modal-header {
  background: linear-gradient(135deg, #2196F3 0%, #2575FC 100%);
  padding: 32px 32px 18px 32px;
  position: relative;
  text-align: center;
}
.modal-title {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}
.modal-subtitle {
  color: #e3f0ff;
  font-size: 16px;
  margin-bottom: 0;
}
.modal-close {
  position: absolute;
  top: 18px;
  right: 24px;
  background: none;
  border: none;
  font-size: 28px;
  color: #fff;
  cursor: pointer;
  line-height: 1;
  padding: 0 4px;
  border-radius: 4px;
  transition: background 0.2s;
}
.modal-content {
  padding: 32px 32px 18px 32px;
}
.email-box {
  background: #f4f8ff;
  border-radius: 16px;
  padding: 24px 18px 18px 18px;
  text-align: center;
  margin-bottom: 28px;
}
.email-label {
  color: #8a98a9;
  font-size: 15px;
  margin-bottom: 6px;
}
.email-value {
  color: #2575FC;
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 14px;
}
.btn-send {
  background: #2575FC;
  color: #fff;
  border: none;
  border-radius: 22px;
  padding: 8px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-send:disabled {
  background: #b3c6e6;
  cursor: not-allowed;
}
.form-group {
  margin-bottom: 18px;
}
.form-label {
  font-size: 15px;
  color: #222;
  font-weight: 500;
  margin-bottom: 8px;
  display: block;
}
.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 17px;
  background: #f8f9fa;
  color: #333;
  outline: none;
  transition: border 0.2s;
  margin-bottom: 8px;
  text-align: center;
}
.form-input:focus {
  border-color: #4A90E2;
}
.code-tip {
  color: #888;
  font-size: 14px;
  margin-bottom: 2px;
}
.code-time {
  color: #FF4D4F;
  font-weight: 600;
  font-size: 15px;
}
.modal-actions {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 10px;
  margin-bottom: 10px;
}
.btn-cancel {
  background: #f5f5f5;
  color: #888;
  border: none;
  border-radius: 8px;
  padding: 10px 28px;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-cancel:hover {
  background: #e0e0e0;
}
.btn-confirm {
  background: #b3c6e6;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 28px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-confirm:enabled {
  background: linear-gradient(90deg, #1A57DC 0%, #2575FC 100%);
}
.modal-footer-tip {
  color: #888;
  font-size: 14px;
  text-align: center;
  margin-top: 10px;
}
.resend-link {
  color: #2575FC;
  cursor: pointer;
  text-decoration: underline;
  margin-left: 2px;
}
.resend-link:hover {
  color: #1A57DC;
}
</style> 