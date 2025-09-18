<template>
  <div class="optimized-image-wrapper" :class="wrapperClass">
    <!-- 加载占位符 -->
    <div 
      v-if="!imageLoaded && showPlaceholder" 
      class="image-placeholder"
      :style="placeholderStyle"
    >
      <div class="placeholder-skeleton"></div>
    </div>
    
    <!-- 使用 NuxtImg 组件，但对uploads路径使用原生img -->
    <img
      v-if="isUploadedImage"
      v-bind="$attrs"
      :src="computedSrc"
      :alt="computedAlt"
      :title="computedTitle"
      :loading="loading"
      :width="width"
      :height="height"
      :class="['optimized-image', imageClass, { 'image-loading': !imageLoaded }]"
      @load="handleImageLoad"
      @error="handleImageError"
    />
    <NuxtImg
      v-else
      v-bind="$attrs"
      :src="src"
      :alt="computedAlt"
      :title="computedTitle"
      :loading="loading"
      :preset="preset"
      :width="width"
      :height="height"
      :sizes="computedSizes"
      :format="format"
      :quality="quality"
      :fit="fit"
      :modifiers="modifiers"
      :placeholder="placeholderSrc"
      :class="['optimized-image', imageClass, { 'image-loading': !imageLoaded }]"
      @load="handleImageLoad"
      @error="handleImageError"
    />
    
    <!-- 错误状态 -->
    <div v-if="imageError" class="image-error">
      <svg class="error-icon" width="48" height="48" viewBox="0 0 24 24" fill="none">
        <path d="M4 6h16l-1.58 14.22A2 2 0 0116.432 22H7.568a2 2 0 01-1.988-1.78L4 6z" stroke="currentColor" stroke-width="2"/>
        <path d="M7.345 3.147A2 2 0 019.154 2h5.692a2 2 0 011.81 1.147L18 6H6l1.345-2.853z" stroke="currentColor" stroke-width="2"/>
        <path d="M10 11v5M14 11v5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <span class="error-text">图片加载失败</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 定义组件属性
interface Props {
  src: string
  alt?: string
  title?: string
  width?: number | string
  height?: number | string
  loading?: 'lazy' | 'eager'
  preset?: string
  sizes?: string
  format?: string
  quality?: number
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  modifiers?: Record<string, any>
  showPlaceholder?: boolean
  placeholderSrc?: string
  imageClass?: string
  wrapperClass?: string
  seoKeywords?: string[] // SEO关键词，用于增强alt标签
  productName?: string // 商品名称
  category?: string // 分类
}

const props = withDefaults(defineProps<Props>(), {
  loading: 'lazy',
  showPlaceholder: true,
  quality: 80,
  fit: 'cover',
  format: 'webp',
})

// 状态管理
const imageLoaded = ref(false)
const imageError = ref(false)

// 计算属性：判断是否是上传的图片
const isUploadedImage = computed(() => {
  return props.src && props.src.startsWith('/uploads/')
})

// 计算属性：处理上传图片的src
const computedSrc = computed(() => {
  if (isUploadedImage.value) {
    // 在开发环境，uploads路径已经被代理
    // 在生产环境，需要加上完整的域名
    const config = useRuntimeConfig()
    const isDev = process.env.NODE_ENV === 'development'
    return isDev ? props.src : `${config.public.apiBase}${props.src}`
  }
  return props.src
})

// 计算属性：生成SEO友好的alt文本
const computedAlt = computed(() => {
  if (props.alt) return props.alt
  
  // 根据不同场景生成alt文本
  if (props.productName) {
    const altParts = [props.productName]
    if (props.category) altParts.push(props.category)
    if (props.seoKeywords?.length) {
      altParts.push(...props.seoKeywords.slice(0, 2))
    }
    altParts.push('高清图片')
    return altParts.join(' - ')
  }
  
  // 默认alt文本
  return '凡图拉平台图片'
})

// 计算属性：生成title文本
const computedTitle = computed(() => {
  if (props.title) return props.title
  
  // 根据alt生成title
  if (computedAlt.value !== '凡图拉平台图片') {
    return `查看${computedAlt.value}`
  }
  
  return undefined
})

// 计算响应式尺寸
const computedSizes = computed(() => {
  if (props.sizes) return props.sizes
  
  // 默认响应式尺寸策略
  if (props.width && typeof props.width === 'number') {
    if (props.width <= 400) {
      return 'xs:100vw sm:50vw md:33vw'
    } else if (props.width <= 800) {
      return 'xs:100vw sm:75vw md:50vw lg:33vw'
    } else {
      return 'xs:100vw sm:100vw md:75vw lg:50vw'
    }
  }
  
  return 'xs:100vw sm:100vw md:100vw'
})

// 占位符样式
const placeholderStyle = computed(() => {
  const style: Record<string, string> = {}
  
  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  
  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
    
    // 计算宽高比
    if (props.width && props.height) {
      const w = typeof props.width === 'number' ? props.width : parseInt(props.width)
      const h = typeof props.height === 'number' ? props.height : parseInt(props.height)
      style.aspectRatio = `${w} / ${h}`
    }
  }
  
  return style
})

// 图片加载成功处理
const handleImageLoad = () => {
  imageLoaded.value = true
  imageError.value = false
}

// 图片加载失败处理
const handleImageError = (event: Event) => {
  imageError.value = true
  imageLoaded.value = false
  console.error('图片加载失败:', props.src, event)
}
</script>

<style scoped>
.optimized-image-wrapper {
  position: relative;
  display: inline-block;
  overflow: hidden;
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.placeholder-skeleton {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    #f3f4f6 0%,
    #e5e7eb 50%,
    #f3f4f6 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.optimized-image {
  display: block;
  width: 100%;
  height: auto;
  transition: opacity 0.3s ease;
}

.optimized-image.image-loading {
  opacity: 0;
}

.image-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #9ca3af;
}

.error-icon {
  color: #d1d5db;
}

.error-text {
  font-size: 14px;
  color: #6b7280;
}

/* 预设样式类 */
.optimized-image-wrapper.product-main {
  width: 600px;
  height: 600px;
  border-radius: 8px;
  overflow: hidden;
}

.optimized-image-wrapper.product-thumb {
  width: 100px;
  height: 100px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.optimized-image-wrapper.product-thumb:hover {
  transform: scale(1.05);
}

.optimized-image-wrapper.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
}

.optimized-image-wrapper.banner {
  width: 100%;
  height: auto;
  max-height: 500px;
  overflow: hidden;
}

/* 懒加载动画 */
.optimized-image-wrapper[data-lazy="true"] .optimized-image {
  opacity: 0;
  transition: opacity 0.5s ease;
}

.optimized-image-wrapper[data-lazy="true"] .optimized-image.loaded {
  opacity: 1;
}
</style>