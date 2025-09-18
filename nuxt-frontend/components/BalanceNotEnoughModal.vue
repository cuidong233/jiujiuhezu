<template>
  <div class="modal-mask">
    <div class="balance-modal">
      <div class="modal-header">
        <div class="modal-title">余额不足</div>
        <div class="modal-subtitle">您的账户余额不足以完成当前操作</div>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      <div class="modal-content">
        <div class="warn-icon-box">
          <svg class="warn-icon" viewBox="0 0 80 80" fill="none"><path d="M40 12L72 68H8L40 12Z" fill="#FF5B5B"/><rect x="37" y="36" width="6" height="18" rx="3" fill="#fff"/><rect x="37" y="58" width="6" height="6" rx="3" fill="#fff"/></svg>
        </div>
        <div class="main-tip">
          当前操作需要<span class="need-amount">￥{{ needAmount.toFixed(2) }}</span>，但您的账户余额不足，<br />请充值后再继续操作
        </div>
        <div class="amount-row-card2">
          <div class="amount-block-card2">
            <div class="amount-label">当前账户余额</div>
            <div class="amount-value">￥{{ balance.toFixed(2) }}</div>
          </div>
          <div class="amount-block-card2">
            <div class="amount-label">需要金额</div>
            <div class="amount-value need">￥{{ needAmount.toFixed(2) }}</div>
            <div class="amount-diff">差额: <span>￥{{ diffAmount.toFixed(2) }}</span></div>
          </div>
        </div>
        <div class="recharge-section-card2">
          <div class="recharge-title">请选择充值金额</div>
          <div class="recharge-options-card2">
            <div v-for="(item, idx) in options" :key="item.value" :class="['recharge-option-card2', {active: selectedIdx===idx}]" @click="selectOption(idx)">
              <div class="recharge-main">￥{{ item.value }}</div>
              <div class="recharge-desc">{{ item.desc }}</div>
            </div>
          </div>
          <div class="recharge-input-row">
            <input v-model.number="inputValue" type="number" min="1" placeholder="输入其他金额" @focus="selectedIdx=-1" />
            <button class="input-confirm-card2" @click="confirmInput">确定</button>
          </div>
        </div>
      </div>
      <div class="modal-actions-card">
        <button class="btn-cancel-card" @click="$emit('close')">取消</button>
        <button class="btn-confirm-card" @click="goRecharge">
          <img src="/images/yue.png" alt="余额充值" style="width:20px;height:20px;margin-right:6px;vertical-align:middle;" />
          前往钱包充值
        </button>
      </div>
      <div class="modal-tip-card">
        充值金额即时到账，可用于平台所有消费 <a href="#" class="recharge-link">查看充值说明</a>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
interface RechargeOption { value: number; desc: string }
const props = defineProps({
  balance: { type: Number, default: 0 },
  needAmount: { type: Number, default: 0 },
  options: { type: Array as () => RechargeOption[], default: () => ([
    { value: 50, desc: '无优惠' },
    { value: 100, desc: '送￥20' },
    { value: 200, desc: '送￥50' },
    { value: 500, desc: '送￥150' },
  ]) }
})
const diffAmount = computed(() => Math.max(props.needAmount - props.balance, 0))
const selectedIdx = ref(1)
const inputValue = ref<number | null>(null)
const router = useRouter()
function selectOption(idx:number) { selectedIdx.value = idx; inputValue.value = null }
function confirmInput() { selectedIdx.value = -1 }
function goRecharge() {
  router.push('/profile/wallet')
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
.balance-modal {
  width: 520px;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(255,0,0,0.10);
  display: flex;
  flex-direction: column;
}
.modal-header {
  background: linear-gradient(90deg, #FF5B5B 0%, #FF7B7B 100%);
  padding: 28px 32px 14px 32px;
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
  color: #fff0f0;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 18px 32px 0 32px;
  gap: 12px;
}
.warn-icon-box {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 18px;
}
.warn-icon {
  width: 80px;
  height: 80px;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}
.main-tip {
  font-size: 18px;
  color: #222;
  text-align: center;
  margin-bottom: 8px;
}
.need-amount {
  color: #FF5B5B;
  font-weight: 900;
  font-size: 22px;
}
.amount-row-card2 {
  display: flex;
  gap: 18px;
  margin: 18px 0 0 0;
  width: 100%;
  justify-content: center;
}
.amount-block-card2 {
  background: #F8F9FF;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(33,150,243,0.08);
  padding: 16px 18px 12px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100px;
}
.amount-label {
  color: #888;
  font-size: 13px;
  margin-bottom: 6px;
}
.amount-value {
  font-size: 20px;
  font-weight: 900;
  color: #222;
}
.amount-value.need {
  color: #FF5B5B;
}
.amount-diff {
  color: #FF5B5B;
  font-size: 12px;
  margin-top: 4px;
}
.amount-diff span {
  font-weight: 900;
  font-size: 14px;
}
.recharge-section-card2 {
  width: 100%;
  margin: 18px 0 0 0;
  background: #F8F9FF;
  border-radius: 14px;
  padding: 14px 0 10px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 8px rgba(33,150,243,0.08);
}
.recharge-title {
  font-size: 15px;
  color: #222;
  font-weight: 700;
  margin-bottom: 12px;
}
.recharge-options-card2 {
  display: flex;
  gap: 12px;
  width: 100%;
  justify-content: center;
  margin-bottom: 12px;
}
.recharge-option-card2 {
  background: #fff;
  border: 2px solid #e3eaf2;
  border-radius: 10px;
  padding: 10px 18px;
  min-width: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: border 0.2s, box-shadow 0.2s;
  font-size: 15px;
  font-weight: 700;
  color: #222;
  box-shadow: 0 1px 4px rgba(33,150,243,0.04);
}
.recharge-option-card2.active {
  border-color: #2196F3;
  color: #2196F3;
  background: #f0f7ff;
}
.recharge-desc {
  font-size: 11px;
  color: #2196F3;
  font-weight: 400;
  margin-top: 2px;
}
.recharge-input-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}
.recharge-input-row input {
  border: 2px solid #e3eaf2;
  border-radius: 10px;
  font-size: 16px;
  width: 180px;
  height: 40px;
  padding: 0 16px;
  background: #fff;
  color: #222;
  outline: none;
}
.recharge-input-row input::-webkit-outer-spin-button,
.recharge-input-row input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.recharge-input-row input[type='number'] {
  -moz-appearance: textfield;
}
.input-confirm-card2 {
  background: #2196F3;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 0 28px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  height: 40px;
  transition: background 0.2s;
  margin-left: 8px;
}
.modal-actions-card {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 14px 16px 0 16px;
  background: #fff;
}
.btn-cancel-card {
  background: #f5f5f5;
  color: #888;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-cancel-card:hover {
  background: #e0e0e0;
}
.btn-confirm-card {
  background: linear-gradient(90deg, #2196F3 0%, #2575FC 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 8px 18px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 8px 0px rgba(33,150,243,0.12);
}
.btn-icon {
  margin-right: 2px;
}
.modal-tip-card {
  background: #F8F9FF;
  color: #444;
  font-size: 13px;
  margin: 18px 0 0 0;
  text-align: center;
  border-radius: 0 0 18px 18px;
  padding: 18px 0 18px 0;
  font-weight: 500;
}
.recharge-link {
  color: #235CDC;
  text-decoration: underline;
  font-weight: 700;
}
</style> 