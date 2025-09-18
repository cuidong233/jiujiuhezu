<template>
  <div class="modal-mask">
    <div class="change-password-modal">
      <div class="modal-header-center">
        <span class="modal-title">账户安全中心</span>
        <div class="modal-title-underline"></div>
        <div class="modal-subtitle">管理您的账户安全设置</div>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      <form class="modal-form" @submit.prevent>
        <div class="form-group">
          <label class="form-label">当前密码</label>
          <input type="password" v-model="currentPassword" class="form-input" placeholder="请输入当前密码" />
        </div>
        <div class="form-group">
          <label class="form-label">新密码</label>
          <input type="password" v-model="newPassword" class="form-input" placeholder="请输入新密码" @input="checkStrength" />
        </div>
        <div class="password-strength">
          密码强度：<span :class="strengthClass">{{ strengthText }}</span>
        </div>
        <ul class="password-rules">
          <li :class="{ passed: newPassword.length >= 8 }">至少8个字符</li>
          <li :class="{ passed: /\d/.test(newPassword) }">包含数字</li>
          <li :class="{ passed: /[a-zA-Z]/.test(newPassword) }">包含字母</li>
          <li :class="{ passed: /[^a-zA-Z0-9]/.test(newPassword) }">包含特殊字符（可选）</li>
        </ul>
        <div class="form-group">
          <label class="form-label">确认新密码</label>
          <input type="password" v-model="confirmPassword" class="form-input" placeholder="请再次输入新密码" />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="$emit('close')">取消</button>
          <button type="submit" class="btn-confirm" :disabled="!canSubmit">更改密码</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const strength = ref(0)

const checkStrength = () => {
  let s = 0
  if (newPassword.value.length >= 8) s++
  if (/\d/.test(newPassword.value)) s++
  if (/[a-zA-Z]/.test(newPassword.value)) s++
  if (/[^a-zA-Z0-9]/.test(newPassword.value)) s++
  strength.value = s
}

const strengthText = computed(() => {
  const arr = ['弱', '弱', '中', '强', '很强']
  return arr[strength.value >= 0 && strength.value < arr.length ? strength.value : 0]
})
const strengthClass = computed(() => {
  const arr = ['weak', 'weak', 'medium', 'strong', 'very-strong']
  return arr[strength.value >= 0 && strength.value < arr.length ? strength.value : 0]
})

const canSubmit = computed(() => {
  return (
    currentPassword.value &&
    newPassword.value.length >= 8 &&
    /\d/.test(newPassword.value) &&
    /[a-zA-Z]/.test(newPassword.value) &&
    confirmPassword.value === newPassword.value
  )
})
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
.change-password-modal {
  width: 420px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  padding: 32px 32px 24px 32px;
  position: relative;
  animation: modalIn 0.2s cubic-bezier(.4,2,.6,1) 1;
}
@keyframes modalIn {
  0% { transform: scale(0.92); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.modal-header-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin-bottom: 24px;
}
.modal-title {
  font-size: 32px;
  font-weight: 700;
  color: #222;
  text-align: center;
  margin-bottom: 8px;
}
.modal-title-underline {
  width: 80px;
  height: 5px;
  background: #2575FC;
  border-radius: 3px;
  margin: 0 auto 12px auto;
}
.modal-subtitle {
  color: #8a98a9;
  font-size: 17px;
  margin-bottom: 0;
  text-align: center;
}
.modal-close {
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  font-size: 28px;
  color: #888;
  cursor: pointer;
  line-height: 1;
  padding: 0 4px;
  border-radius: 4px;
  transition: background 0.2s;
}
.modal-close:hover {
  background: #f0f0f0;
  color: #333;
}
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-label {
  font-size: 15px;
  color: #222;
  font-weight: 500;
}
.form-input {
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  background: #f8f9fa;
  color: #333;
  outline: none;
  transition: border 0.2s;
}
.form-input:focus {
  border-color: #4A90E2;
}
.password-strength {
  font-size: 14px;
  color: #888;
  margin-bottom: 2px;
}
.weak { color: #ff4d4f; }
.medium { color: #faad14; }
.strong, .very-strong { color: #52c41a; }
.password-rules {
  list-style: none;
  padding: 0;
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #888;
}
.password-rules li {
  margin-bottom: 2px;
  position: relative;
  padding-left: 18px;
}
.password-rules li.passed::before {
  content: '•';
  color: #52c41a;
  position: absolute;
  left: 0;
}
.password-rules li:not(.passed)::before {
  content: '•';
  color: #ccc;
  position: absolute;
  left: 0;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 10px;
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
  background: linear-gradient(90deg, #1A57DC 0%, #2575FC 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 28px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-confirm:disabled {
  background: #b3c6e6;
  cursor: not-allowed;
}
</style> 