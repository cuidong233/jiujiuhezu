<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :top="top"
    :modal="modal"
    :lock-scroll="lockScroll"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :show-close="showClose"
    :before-close="handleBeforeClose"
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <!-- 对话框内容 -->
    <div class="dialog-content" v-loading="loading">
      <slot :form="form" :rules="rules" :loading="loading">
        <!-- 默认表单 -->
        <el-form
          v-if="!$slots.default"
          ref="formRef"
          :model="form"
          :rules="rules"
          :label-width="labelWidth"
          :label-position="labelPosition"
          :size="size"
        >
          <template v-for="field in fields" :key="field.prop">
            <el-form-item
              :label="field.label"
              :prop="field.prop"
              :required="field.required"
            >
              <!-- 输入框 -->
              <el-input
                v-if="field.type === 'input'"
                v-model="form[field.prop]"
                :placeholder="field.placeholder"
                :disabled="field.disabled"
                v-bind="field.attrs"
              />
              
              <!-- 数字输入框 -->
              <el-input-number
                v-else-if="field.type === 'number'"
                v-model="form[field.prop]"
                :min="field.min"
                :max="field.max"
                :step="field.step"
                :precision="field.precision"
                :disabled="field.disabled"
                style="width: 100%"
                v-bind="field.attrs"
              />
              
              <!-- 下拉选择 -->
              <el-select
                v-else-if="field.type === 'select'"
                v-model="form[field.prop]"
                :placeholder="field.placeholder"
                :disabled="field.disabled"
                :multiple="field.multiple"
                :clearable="field.clearable !== false"
                style="width: 100%"
                v-bind="field.attrs"
              >
                <el-option
                  v-for="option in field.options"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                  :disabled="option.disabled"
                />
              </el-select>
              
              <!-- 单选组 -->
              <el-radio-group
                v-else-if="field.type === 'radio'"
                v-model="form[field.prop]"
                :disabled="field.disabled"
                v-bind="field.attrs"
              >
                <el-radio
                  v-for="option in field.options"
                  :key="option.value"
                  :value="option.value"
                  :disabled="option.disabled"
                >
                  {{ option.label }}
                </el-radio>
              </el-radio-group>
              
              <!-- 复选框组 -->
              <el-checkbox-group
                v-else-if="field.type === 'checkbox'"
                v-model="form[field.prop]"
                :disabled="field.disabled"
                v-bind="field.attrs"
              >
                <el-checkbox
                  v-for="option in field.options"
                  :key="option.value"
                  :value="option.value"
                  :disabled="option.disabled"
                >
                  {{ option.label }}
                </el-checkbox>
              </el-checkbox-group>
              
              <!-- 开关 -->
              <el-switch
                v-else-if="field.type === 'switch'"
                v-model="form[field.prop]"
                :active-value="field.activeValue !== undefined ? field.activeValue : true"
                :inactive-value="field.inactiveValue !== undefined ? field.inactiveValue : false"
                :active-text="field.activeText"
                :inactive-text="field.inactiveText"
                :disabled="field.disabled"
                v-bind="field.attrs"
              />
              
              <!-- 日期选择 -->
              <el-date-picker
                v-else-if="field.type === 'date'"
                v-model="form[field.prop]"
                :type="field.dateType || 'date'"
                :placeholder="field.placeholder"
                :disabled="field.disabled"
                :format="field.format"
                :value-format="field.valueFormat"
                style="width: 100%"
                v-bind="field.attrs"
              />
              
              <!-- 文本域 -->
              <el-input
                v-else-if="field.type === 'textarea'"
                v-model="form[field.prop]"
                type="textarea"
                :rows="field.rows || 4"
                :placeholder="field.placeholder"
                :disabled="field.disabled"
                v-bind="field.attrs"
              />
              
              <!-- 自定义字段 -->
              <slot
                v-else
                :name="`field-${field.prop}`"
                :field="field"
                :form="form"
              />
            </el-form-item>
          </template>
        </el-form>
      </slot>
    </div>

    <!-- 对话框底部 -->
    <template #footer>
      <slot name="footer" :form="form" :loading="loading" :submit="handleSubmit" :cancel="handleCancel">
        <div class="dialog-footer">
          <el-button @click="handleCancel" :disabled="loading">
            {{ cancelText }}
          </el-button>
          <el-button 
            type="primary" 
            @click="handleSubmit" 
            :loading="loading"
            :disabled="loading"
          >
            {{ confirmText }}
          </el-button>
        </div>
      </slot>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

// Props定义
const props = defineProps({
  // 对话框基础配置
  modelValue: {
    type: Boolean,
    default: false
  },
  
  title: {
    type: String,
    default: '编辑'
  },
  
  width: {
    type: [String, Number],
    default: '600px'
  },
  
  top: {
    type: String,
    default: '15vh'
  },
  
  modal: {
    type: Boolean,
    default: true
  },
  
  lockScroll: {
    type: Boolean,
    default: true
  },
  
  closeOnClickModal: {
    type: Boolean,
    default: false
  },
  
  closeOnPressEscape: {
    type: Boolean,
    default: true
  },
  
  showClose: {
    type: Boolean,
    default: true
  },
  
  // 表单配置
  form: {
    type: Object,
    default: () => ({})
  },
  
  rules: {
    type: Object,
    default: () => ({})
  },
  
  fields: {
    type: Array,
    default: () => []
  },
  
  labelWidth: {
    type: String,
    default: '100px'
  },
  
  labelPosition: {
    type: String,
    default: 'right'
  },
  
  size: {
    type: String,
    default: 'default'
  },
  
  // 状态
  loading: {
    type: Boolean,
    default: false
  },
  
  // 按钮文本
  confirmText: {
    type: String,
    default: '确定'
  },
  
  cancelText: {
    type: String,
    default: '取消'
  },
  
  // 验证配置
  validateOnSubmit: {
    type: Boolean,
    default: true
  },
  
  resetOnClose: {
    type: Boolean,
    default: true
  }
})

// 事件定义
const emit = defineEmits([
  'update:modelValue',
  'submit',
  'cancel',
  'opened',
  'closed',
  'before-close'
])

// 引用
const formRef = ref()

// 对话框显示状态
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 处理提交
const handleSubmit = async () => {
  if (props.validateOnSubmit && formRef.value) {
    try {
      await formRef.value.validate()
    } catch (error) {
      ElMessage.error('表单验证失败，请检查输入')
      return
    }
  }
  
  emit('submit', props.form)
}

// 处理取消
const handleCancel = () => {
  emit('cancel')
  visible.value = false
}

// 处理关闭前
const handleBeforeClose = (done) => {
  const result = emit('before-close')
  if (result !== false) {
    done()
  }
}

// 处理打开后
const handleOpened = () => {
  // 聚焦第一个输入框
  nextTick(() => {
    const firstInput = formRef.value?.$el.querySelector('input, textarea, select')
    if (firstInput) {
      firstInput.focus()
    }
  })
  
  emit('opened')
}

// 处理关闭后
const handleClosed = () => {
  if (props.resetOnClose && formRef.value) {
    formRef.value.resetFields()
  }
  
  emit('closed')
}

// 暴露方法
defineExpose({
  formRef,
  validate: () => formRef.value?.validate(),
  validateField: (prop) => formRef.value?.validateField(prop),
  resetFields: () => formRef.value?.resetFields(),
  clearValidate: () => formRef.value?.clearValidate()
})
</script>

<style scoped>
.dialog-content {
  min-height: 100px;
}

.dialog-footer {
  text-align: right;
}

.dialog-footer .el-button {
  margin-left: 10px;
}
</style>