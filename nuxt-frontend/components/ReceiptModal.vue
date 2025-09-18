<template>
  <div class="modal-mask" @click.self="handleClose">
    <div class="receipt-modal">
      <div class="modal-header">
        <h3>{{ isModification ? '申请修改回执单' : (existingReceipt?.receiptData ? '查看回执单' : '填写回执单信息') }}</h3>
        <span class="close-btn" @click="handleClose">×</span>
      </div>
      
      <div class="modal-body">
        <div class="order-info">
          <div class="info-item">
            <span class="label">订单编号：</span>
            <span class="value">{{ orderNo }}</span>
          </div>
          <div class="info-item">
            <span class="label">商品名称：</span>
            <span class="value">{{ productName }}</span>
          </div>
        </div>

        <div class="receipt-form">
          <div v-for="(field, index) in receiptFields" :key="`field-${index}-${field.key}`" class="form-item">
            <label :class="{ 'required': field.required }">
              {{ field.label }}
            </label>
            <div v-if="field.type === 'password'" class="password-input-wrapper">
              <input 
                :type="passwordVisible[field.key] ? 'text' : 'password'"
                :value="formData[field.key] || ''"
                @input="updateFormField(field.key, $event.target.value)"
                :placeholder="field.placeholder"
                :required="field.required"
                :disabled="isViewing && existingReceipt?.receiptData && !isModification"
                class="password-input"
              />
              <button 
                type="button"
                @click="togglePasswordVisibility(field.key)"
                class="password-toggle"
                :disabled="isViewing && existingReceipt?.receiptData && !isModification"
              >
                {{ passwordVisible[field.key] ? '🙈' : '👁️' }}
              </button>
            </div>
            <input 
              v-else-if="field.type === 'text' || field.type === 'email'" 
              :type="field.type"
              :value="formData[field.key] || ''"
              @input="updateFormField(field.key, $event.target.value)"
              :placeholder="field.placeholder"
              :required="field.required"
              :disabled="isViewing && existingReceipt?.receiptData && !isModification"
            />
            <textarea 
              v-else-if="field.type === 'textarea'"
              :value="formData[field.key] || ''"
              @input="updateFormField(field.key, $event.target.value)"
              :placeholder="field.placeholder"
              :required="field.required"
              :disabled="isViewing && existingReceipt?.receiptData && !isModification"
              rows="3"
            />
            <select 
              v-else-if="field.type === 'select'"
              :value="formData[field.key] || ''"
              @change="updateFormField(field.key, $event.target.value)"
              :required="field.required"
              :disabled="isViewing && existingReceipt?.receiptData && !isModification"
            >
              <option value="">请选择</option>
              <option v-for="option in field.options" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <div v-if="isModification" class="form-item">
            <label class="required">修改原因</label>
            <textarea 
              v-model="modificationReason"
              placeholder="请说明修改原因"
              required
              rows="3"
            />
          </div>
        </div>

        <div v-if="existingReceipt && !isModification" class="receipt-status">
          <div class="status-info">
            <span class="status-label">回执状态：</span>
            <span :class="['status-value', getStatusClass(existingReceipt.status)]">
              {{ getStatusText(existingReceipt.status) }}
            </span>
          </div>
          <div v-if="existingReceipt.modificationRequest" class="modification-info">
            <span class="mod-label">修改申请：</span>
            <span :class="['mod-status', getModStatusClass(existingReceipt.modificationRequest.status)]">
              {{ getModStatusText(existingReceipt.modificationRequest.status) }}
            </span>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button v-if="!isViewing || !existingReceipt?.receiptData || isModification" @click="handleSubmit" class="submit-btn" :disabled="loading">
          {{ loading ? '提交中...' : (isModification ? '提交修改申请' : '提交回执单') }}
        </button>
        <button v-if="isViewing && canModify && !isModification" @click="handleModifyRequest" class="modify-btn">
          申请修改
        </button>
        <button @click="handleClose" class="cancel-btn">
          {{ isViewing && !isModification ? '关闭' : '取消' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { orderApi } from '~/api/order'

const props = defineProps({
  orderNo: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    default: ''
  },
  isViewing: {
    type: Boolean,
    default: false
  },
  receiptId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'success'])

const loading = ref(false)
const formData = reactive<Record<string, any>>({})
const receiptFields = ref<any[]>([])
const existingReceipt = ref<any>(null)
const isModification = ref(false)
const modificationReason = ref('')
const passwordVisible = reactive<Record<string, boolean>>({})

const canModify = computed(() => {
  if (!existingReceipt.value) return false
  // 只有已填写且未在修改中的回执单可以申请修改
  return existingReceipt.value.receiptData && 
         Object.keys(existingReceipt.value.receiptData).length > 0 &&
         (!existingReceipt.value.modificationRequest || 
          existingReceipt.value.modificationRequest.status === 'rejected')
})

onMounted(async () => {
  await loadReceiptData()
})

const loadReceiptData = async () => {
  try {
    const response = await orderApi.getOrderReceipts(props.orderNo)
    
    if (response.data && response.data.receipts && response.data.receipts.length > 0) {
      const receipt = response.data.receipts[0]
      existingReceipt.value = receipt
      
      // 如果有配置的字段，使用配置的字段，否则使用默认字段
      if (receipt.receiptFields && Array.isArray(receipt.receiptFields)) {
        // 标准化字段格式 - 后端可能使用 'name' 而不是 'key'
        receiptFields.value = receipt.receiptFields.map(field => ({
          key: field.key || field.name,  // 兼容 name 和 key
          label: field.label || field.name || field.key,
          type: field.type || 'text',
          placeholder: field.placeholder || '',
          required: field.required !== undefined ? field.required : false,
          options: field.options || []
        }))
      } else if (receipt.receiptFields && typeof receipt.receiptFields === 'object') {
        // 如果是对象格式，转换为数组格式
        receiptFields.value = Object.entries(receipt.receiptFields).map(([key, value]: [string, any]) => ({
          key,
          label: value.label || key,
          type: value.type || 'text',
          placeholder: value.placeholder || '',
          required: value.required || false,
          options: value.options || []
        }))
      } else {
        receiptFields.value = getDefaultFields()
      }
      
      
      // 先初始化表单数据结构
      initFormData()
      
      // 如果有已填写的数据，覆盖初始值
      if (receipt.receiptData && Object.keys(receipt.receiptData).length > 0) {
        Object.keys(receipt.receiptData).forEach(key => {
          if (key in formData) {
            formData[key] = receipt.receiptData[key]
          }
        })
      }
    } else {
      // 没有回执单记录，使用默认字段
      receiptFields.value = getDefaultFields()
      // 初始化表单数据结构
      initFormData()
    }
  } catch (error) {
    // 加载失败时使用默认字段
    receiptFields.value = getDefaultFields()
    initFormData()
  }
}

// 初始化表单数据结构，确保每个字段都有独立的值
const initFormData = () => {
  // 清空现有数据
  Object.keys(formData).forEach(key => delete formData[key])
  Object.keys(passwordVisible).forEach(key => delete passwordVisible[key])
  
  // 为每个字段设置独立的初始值
  receiptFields.value.forEach(field => {
    formData[field.key] = ''
    
    // 初始化密码可见性
    if (field.type === 'password') {
      passwordVisible[field.key] = false
    }
  })
  
}

// 更新表单字段值
const updateFormField = async (key: string, value: any) => {
  // 确保只更新指定的字段
  if (key in formData) {
    formData[key] = value
  } else {
    // 如果字段不存在，添加它
    formData[key] = value
  }
  await nextTick()
}

// 切换密码可见性
const togglePasswordVisibility = (fieldKey: string) => {
  passwordVisible[fieldKey] = !passwordVisible[fieldKey]
}

const getDefaultFields = () => {
  return [
    {
      key: 'gameAccount',
      label: '游戏账号',
      type: 'text',
      placeholder: '请输入游戏账号',
      required: true
    },
    {
      key: 'gamePassword',
      label: '游戏密码',
      type: 'password',
      placeholder: '请输入游戏密码',
      required: true
    },
    {
      key: 'contact',
      label: '联系方式',
      type: 'text',
      placeholder: '请输入手机号或邮箱',
      required: true
    },
    {
      key: 'remark',
      label: '备注信息',
      type: 'textarea',
      placeholder: '请输入备注信息（选填）',
      required: false
    }
  ]
}

const handleSubmit = async () => {
  // 验证必填字段
  for (const field of receiptFields.value) {
    if (field.required && !formData[field.key]) {
      if (typeof ElMessage !== 'undefined') {
        ElMessage.warning(`请填写${field.label}`)
      } else {
        alert(`请填写${field.label}`)
      }
      return
    }
  }

  loading.value = true
  try {
    let response
    if (isModification.value) {
      // 提交修改申请
      response = await orderApi.modifyReceipt(props.orderNo, {
        receiptData: { ...formData },
        reason: modificationReason.value
      })
    } else {
      // 提交新回执单
      response = await orderApi.submitReceipt(props.orderNo, {
        receiptData: { ...formData }
      })
    }

    if (response.success || response.code === 200) {
      if (typeof ElMessage !== 'undefined') {
        ElMessage.success(isModification.value ? '修改申请已提交' : '回执单提交成功')
      } else {
        alert(isModification.value ? '修改申请已提交' : '回执单提交成功')
      }
      emit('success')
      emit('close')
    } else {
      if (typeof ElMessage !== 'undefined') {
        ElMessage.error(response.message || '提交失败')
      } else {
        alert(response.message || '提交失败')
      }
    }
  } catch (error: any) {
    if (typeof ElMessage !== 'undefined') {
      ElMessage.error(error.message || '提交失败')
    } else {
      alert(error.message || '提交失败')
    }
  } finally {
    loading.value = false
  }
}

const handleModifyRequest = () => {
  isModification.value = true
}

const handleClose = () => {
  if (isModification.value) {
    isModification.value = false
  } else {
    emit('close')
  }
}

const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    'pending': 'status-pending',
    'completed': 'status-completed',
    'processing': 'status-processing'
  }
  return map[status] || 'status-default'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    'pending': '待填写',
    'completed': '已填写',
    'processing': '处理中'
  }
  return map[status] || status
}

const getModStatusClass = (status: string) => {
  const map: Record<string, string> = {
    'pending': 'mod-pending',
    'approved': 'mod-approved',
    'rejected': 'mod-rejected'
  }
  return map[status] || 'mod-default'
}

const getModStatusText = (status: string) => {
  const map: Record<string, string> = {
    'pending': '审核中',
    'approved': '已通过',
    'rejected': '已拒绝'
  }
  return map[status] || status
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 3000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.receipt-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  font-size: 24px;
  cursor: pointer;
  color: #999;
  line-height: 1;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.order-info {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  margin-bottom: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  color: #666;
  margin-right: 10px;
}

.info-item .value {
  color: #333;
  font-weight: 500;
}

.receipt-form {
  margin-bottom: 20px;
}

.form-item {
  margin-bottom: 15px;
}

.form-item label {
  display: block;
  margin-bottom: 5px;
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.form-item label.required::after {
  content: ' *';
  color: #f56c6c;
}

.form-item input,
.form-item textarea,
.form-item select {
  width: 100%;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-item input:focus,
.form-item textarea:focus,
.form-item select:focus {
  outline: none;
  border-color: #409eff;
}

.form-item input:disabled,
.form-item textarea:disabled,
.form-item select:disabled {
  background-color: #f5f7fa;
  cursor: not-allowed;
}

.receipt-status {
  background: #f0f9ff;
  border: 1px solid #b3e5fc;
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
}

.status-info,
.modification-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.modification-info {
  margin-bottom: 0;
}

.status-label,
.mod-label {
  color: #666;
  margin-right: 10px;
}

.status-value,
.mod-status {
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.status-pending {
  color: #e6a23c;
  background: #fdf6ec;
}

.status-completed {
  color: #67c23a;
  background: #f0f9ff;
}

.status-processing {
  color: #409eff;
  background: #ecf5ff;
}

.mod-pending {
  color: #e6a23c;
  background: #fdf6ec;
}

.mod-approved {
  color: #67c23a;
  background: #f0f9ff;
}

.mod-rejected {
  color: #f56c6c;
  background: #fef0f0;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.submit-btn,
.modify-btn,
.cancel-btn {
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.submit-btn {
  background: #409eff;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #66b1ff;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modify-btn {
  background: #e6a23c;
  color: white;
}

.modify-btn:hover {
  background: #ebb563;
}

.cancel-btn {
  background: #fff;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.cancel-btn:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background: #ecf5ff;
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input {
  width: 100%;
  padding: 10px;
  padding-right: 45px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.password-input:focus {
  outline: none;
  border-color: #409eff;
}

.password-toggle {
  position: absolute;
  right: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s;
}

.password-toggle:hover:not(:disabled) {
  opacity: 0.7;
}

.password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>