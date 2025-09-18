<template>
  <el-tag 
    :type="tagType" 
    :size="size"
    :effect="effect"
    :round="round"
    :closable="closable"
    @close="$emit('close')"
  >
    <el-icon v-if="icon" class="tag-icon">
      <component :is="icon" />
    </el-icon>
    {{ text }}
  </el-tag>
</template>

<script setup>
import { computed } from 'vue'

// Props定义
const props = defineProps({
  // 状态值
  status: {
    type: [String, Number],
    required: true
  },
  
  // 状态映射配置
  statusMap: {
    type: Object,
    default: () => ({})
  },
  
  // 默认配置
  defaultText: {
    type: String,
    default: '未知'
  },
  
  defaultType: {
    type: String,
    default: 'info'
  },
  
  // 标签配置
  size: {
    type: String,
    default: 'default'
  },
  
  effect: {
    type: String,
    default: 'light'
  },
  
  round: {
    type: Boolean,
    default: false
  },
  
  closable: {
    type: Boolean,
    default: false
  },
  
  // 自定义文本和类型
  text: {
    type: String,
    default: undefined
  },
  
  type: {
    type: String,
    default: undefined
  },
  
  icon: {
    type: [String, Object],
    default: undefined
  }
})

// 事件定义
defineEmits(['close'])

// 计算标签文本
const text = computed(() => {
  if (props.text !== undefined) {
    return props.text
  }
  
  const config = props.statusMap[props.status]
  if (config) {
    return typeof config === 'string' ? config : config.text
  }
  
  return props.defaultText
})

// 计算标签类型
const tagType = computed(() => {
  if (props.type !== undefined) {
    return props.type
  }
  
  const config = props.statusMap[props.status]
  if (config && typeof config === 'object') {
    return config.type || props.defaultType
  }
  
  return props.defaultType
})

// 计算图标
const icon = computed(() => {
  if (props.icon !== undefined) {
    return props.icon
  }
  
  const config = props.statusMap[props.status]
  if (config && typeof config === 'object') {
    return config.icon
  }
  
  return undefined
})
</script>

<style scoped>
.tag-icon {
  margin-right: 4px;
}
</style>