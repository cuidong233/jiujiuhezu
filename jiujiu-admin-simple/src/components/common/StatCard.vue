<template>
  <el-card 
    class="stat-card" 
    :class="[`stat-card--${color}`, { 'stat-card--loading': loading }]"
    :shadow="shadow"
  >
    <div class="stat-card__content" v-loading="loading">
      <!-- 图标区域 -->
      <div class="stat-card__icon" v-if="icon || $slots.icon">
        <slot name="icon">
          <el-icon :size="iconSize" :color="iconColor">
            <component :is="icon" />
          </el-icon>
        </slot>
      </div>
      
      <!-- 数值区域 -->
      <div class="stat-card__value">
        <div class="stat-card__number">
          <slot name="value">
            <span v-if="countUp" ref="countUpRef">{{ value }}</span>
            <span v-else>{{ formattedValue }}</span>
          </slot>
          <span v-if="unit" class="stat-card__unit">{{ unit }}</span>
        </div>
        
        <div class="stat-card__title">
          <slot name="title">{{ title }}</slot>
        </div>
        
        <!-- 趋势指示器 -->
        <div 
          v-if="trend !== undefined" 
          class="stat-card__trend"
          :class="`stat-card__trend--${trendType}`"
        >
          <el-icon>
            <ArrowUp v-if="trendType === 'up'" />
            <ArrowDown v-if="trendType === 'down'" />
            <Minus v-if="trendType === 'flat'" />
          </el-icon>
          <span>{{ Math.abs(trend) }}%</span>
        </div>
      </div>
      
      <!-- 额外内容 -->
      <div v-if="$slots.extra" class="stat-card__extra">
        <slot name="extra" />
      </div>
    </div>
    
    <!-- 底部操作 -->
    <div v-if="$slots.actions" class="stat-card__actions">
      <slot name="actions" />
    </div>
  </el-card>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { ArrowUp, ArrowDown, Minus } from '@element-plus/icons-vue'

// Props定义
const props = defineProps({
  // 标题
  title: {
    type: String,
    required: true
  },
  
  // 数值
  value: {
    type: [String, Number],
    default: 0
  },
  
  // 单位
  unit: {
    type: String,
    default: ''
  },
  
  // 图标
  icon: {
    type: [String, Object],
    default: undefined
  },
  
  iconSize: {
    type: [String, Number],
    default: 24
  },
  
  iconColor: {
    type: String,
    default: undefined
  },
  
  // 颜色主题
  color: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'success', 'warning', 'danger', 'info'].includes(value)
  },
  
  // 阴影
  shadow: {
    type: String,
    default: 'hover'
  },
  
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  },
  
  // 趋势
  trend: {
    type: Number,
    default: undefined
  },
  
  // 数字格式化
  formatter: {
    type: Function,
    default: undefined
  },
  
  // 数字动画
  countUp: {
    type: Boolean,
    default: false
  },
  
  // 动画持续时间
  duration: {
    type: Number,
    default: 2000
  }
})

// 引用
const countUpRef = ref()

// 计算格式化的值
const formattedValue = computed(() => {
  if (props.formatter) {
    return props.formatter(props.value)
  }
  
  // 默认格式化逻辑
  const num = Number(props.value)
  if (isNaN(num)) return props.value
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  
  return num.toLocaleString()
})

// 计算趋势类型
const trendType = computed(() => {
  if (props.trend === undefined) return 'flat'
  if (props.trend > 0) return 'up'
  if (props.trend < 0) return 'down'
  return 'flat'
})

// 数字动画
const animateNumber = () => {
  if (!props.countUp || !countUpRef.value) return
  
  const target = Number(props.value)
  if (isNaN(target)) return
  
  const start = 0
  const duration = props.duration
  const startTime = Date.now()
  
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // 使用缓动函数
    const easeOutQuart = 1 - Math.pow(1 - progress, 4)
    const current = Math.floor(start + (target - start) * easeOutQuart)
    
    if (countUpRef.value) {
      countUpRef.value.textContent = current.toLocaleString()
    }
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  
  requestAnimationFrame(animate)
}

// 组件挂载后执行动画
onMounted(() => {
  if (props.countUp) {
    nextTick(() => {
      animateNumber()
    })
  }
})
</script>

<style scoped>
.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card__content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-card__icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--el-color-primary-light-9);
}

.stat-card--primary .stat-card__icon {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.stat-card--success .stat-card__icon {
  background-color: var(--el-color-success-light-9);
  color: var(--el-color-success);
}

.stat-card--warning .stat-card__icon {
  background-color: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
}

.stat-card--danger .stat-card__icon {
  background-color: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}

.stat-card--info .stat-card__icon {
  background-color: var(--el-color-info-light-9);
  color: var(--el-color-info);
}

.stat-card__value {
  flex: 1;
}

.stat-card__number {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-size: 24px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  line-height: 1;
  margin-bottom: 4px;
}

.stat-card__unit {
  font-size: 14px;
  font-weight: normal;
  color: var(--el-text-color-regular);
}

.stat-card__title {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin-bottom: 4px;
}

.stat-card__trend {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 500;
}

.stat-card__trend--up {
  color: var(--el-color-success);
}

.stat-card__trend--down {
  color: var(--el-color-danger);
}

.stat-card__trend--flat {
  color: var(--el-text-color-regular);
}

.stat-card__extra {
  margin-top: 8px;
}

.stat-card__actions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.stat-card--loading {
  opacity: 0.7;
}
</style>