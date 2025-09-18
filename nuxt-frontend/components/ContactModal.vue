<template>
  <div class="modal-mask">
    <div class="contact-modal">
      <div class="modal-header">
        <span>联系客服</span>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      <div class="modal-content">
        <p>联系客服：请通过在线客服或拨打 <span class="phone">400-123-4567</span> 联系我们。</p>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
</script>
<style scoped>
.modal-mask {
  position: fixed;
  z-index: 3000;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}
.contact-modal {
  width: 320px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 24px rgba(33,150,243,0.10);
  display: flex;
  flex-direction: column;
  padding: 0 0 18px 0;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 10px 20px;
  font-size: 18px;
  font-weight: 700;
  border-bottom: 1px solid #eee;
}
.close-btn {
  background: none;
  border: none;
  font-size: 22px;
  color: #888;
  cursor: pointer;
}
.modal-content {
  padding: 18px 20px 0 20px;
  font-size: 15px;
  color: #333;
  text-align: center;
}
.phone {
  color: #2196F3;
  font-weight: 700;
}
</style> 