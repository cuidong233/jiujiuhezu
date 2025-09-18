<template>
  <div v-if="visible" class="modal-mask" @click.self="close">
    <div class="join-modal">
      <div class="modal-header">
        <div class="modal-header-inner">
          <div class="modal-title">加入我们的社群</div>
          <div class="modal-subtitle">扫码添加客服微信，获取专属服务</div>
          <button class="modal-close" @click="close">×</button>
        </div>
      </div>
      
      <div class="modal-body">
        <div class="wechat-content">
          <div class="qr-section">
            <div class="qr-container">
              <img src="/images/weixin.png" alt="微信二维码" class="qr-code" />
            </div>
          </div>
          
          <div class="wechat-info">
            <div class="wechat-id">
              <span class="wechat-label">客服微信：</span>
              <span class="wechat-value">Companyservice</span>
            </div>
            
                         <div class="copy-section">
               <button class="copy-btn" @click="copyWechatId">📋 复制微信号</button>
             </div>
           </div>
           
           <!-- 添加客服步骤 -->
           <div class="steps-section">
             <div class="steps-title">添加客服步骤</div>
             <div class="steps-container">
               <div class="step-item">
                 <div class="step-number">1</div>
                 <div class="step-text">下载二维码图片到电脑</div>
               </div>
               <div class="step-item">
                 <div class="step-number">2</div>
                 <div class="step-text">打开手机微信扫一扫</div>
               </div>
               <div class="step-item">
                 <div class="step-number">3</div>
                 <div class="step-text">点击加入社群</div>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ visible: boolean }>()
const emit = defineEmits(['close'])

function close() {
  emit('close')
}

function copyWechatId() {
  const wechatId = 'Companyservice'
  if (navigator.clipboard) {
    navigator.clipboard.writeText(wechatId).then(() => {
      alert('微信号已复制到剪贴板')
    }).catch(() => {
      fallbackCopy(wechatId)
    })
  } else {
    fallbackCopy(wechatId)
  }
}

function fallbackCopy(text: string) {
  const textArea = document.createElement('textarea')
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.select()
  try {
    document.execCommand('copy')
    alert('微信号已复制到剪贴板')
  } catch (err) {
    alert('复制失败，请手动复制微信号：' + text)
  }
  document.body.removeChild(textArea)
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.join-modal {
  width: 680px;
  max-height: 90vh;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.modal-header {
  background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
  padding: 40px 32px 32px;
  position: relative;
}

.modal-header-inner {
  text-align: center;
  color: #fff;
}

.modal-title {
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 700;
  font-size: 28px;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.modal-subtitle {
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 400;
  font-size: 16px;
  opacity: 0.9;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 20px;
  background: none;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 40px 32px;
  max-height: calc(90vh - 120px);
  overflow-y: auto;
}

.wechat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.qr-section {
  display: flex;
  justify-content: center;
}

.qr-container {
  width: 280px;
  height: 280px;
  background: #E8E8E8;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.qr-code {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.wechat-info {
  text-align: center;
  width: 100%;
}

.wechat-id {
  margin-bottom: 24px;
}

.wechat-label {
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 400;
  font-size: 18px;
  color: #333;
  margin-right: 8px;
}

.wechat-value {
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 600;
  font-size: 18px;
  color: #333;
}

.copy-section {
  display: flex;
  justify-content: center;
}

.copy-btn {
  background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
  color: #fff;
  border: none;
  padding: 12px 32px;
  border-radius: 24px;
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.copy-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

.steps-section {
  width: 100%;
  background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
  border-radius: 16px;
  padding: 24px;
  color: #fff;
}

.steps-title {
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 600;
  font-size: 18px;
  text-align: center;
  margin-bottom: 20px;
  color: #fff;
}

.steps-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.step-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.step-number {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 600;
  font-size: 18px;
  color: #fff;
  margin-bottom: 12px;
}

.step-text {
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: #fff;
  line-height: 1.4;
  opacity: 0.95;
}
</style> 