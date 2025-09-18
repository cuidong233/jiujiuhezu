<template>
  <section class="banner-section">
    <div class="banner-inner">
      <div class="banner-slider">
        <transition name="fade" mode="out-in">
          <div v-if="banners.length > 0" :key="currentIndex" class="banner-item">
            <img :src="banners[currentIndex].image" :alt="banners[currentIndex].title" class="banner-image" />
          </div>
        </transition>
      </div>
      
      <!-- 轮播指示器 -->
      <div v-if="banners.length > 1" class="banner-indicators">
        <span 
          v-for="(banner, index) in banners" 
          :key="index"
          :class="['indicator', { active: index === currentIndex }]"
          @click="goToSlide(index)"
        ></span>
      </div>
      
      <!-- 左右切换按钮 -->
      <div v-if="banners.length > 1" class="banner-controls">
        <button class="control-btn prev" @click="prevSlide">‹</button>
        <button class="control-btn next" @click="nextSlide">›</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { Banner } from '@/types/api'

const props = defineProps<{ banners: Banner[] }>()

const currentIndex = ref(0)
let timer: NodeJS.Timeout | null = null

// 自动轮播
const startAutoPlay = () => {
  stopAutoPlay()
  if (props.banners.length > 1) {
    timer = setInterval(() => {
      nextSlide()
    }, 5000) // 5秒切换一次
  }
}

const stopAutoPlay = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

// 切换到下一张
const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % props.banners.length
}

// 切换到上一张
const prevSlide = () => {
  currentIndex.value = currentIndex.value === 0 
    ? props.banners.length - 1 
    : currentIndex.value - 1
}

// 切换到指定张
const goToSlide = (index: number) => {
  currentIndex.value = index
  startAutoPlay() // 重置自动播放
}

// 监听banners变化
watch(() => props.banners, () => {
  currentIndex.value = 0
  startAutoPlay()
})

onMounted(() => {
  startAutoPlay()
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<style scoped>
.banner-section {
  width: 100vw;
  min-width: 1180px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin-top: 104px;
  margin-bottom: 40px;
}
.banner-inner {
  width: 1181px;
  height: 404px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0px 8px 32px 0px rgba(0,0,0,0.08);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.banner-slider {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.banner-item {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
}

/* 轮播指示器样式 */
.banner-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  width: 24px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.9);
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.8);
}

/* 左右切换按钮样式 */
.banner-controls {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.control-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
}

.banner-inner:hover .control-btn {
  opacity: 1;
}

.control-btn:hover {
  background: rgba(0, 0, 0, 0.5);
}

.control-btn.prev {
  left: 20px;
}

.control-btn.next {
  right: 20px;
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.banner-content {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #fff;
  z-index: 2;
}
.banner-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}
.banner-btn {
  display: inline-block;
  padding: 12px 30px;
  background: #ff6b6b;
  color: white;
  text-decoration: none;
  border-radius: 25px;
  font-weight: bold;
  transition: all 0.3s ease;
}
.banner-btn:hover {
  background: #ff5252;
  transform: translateY(-2px);
}
</style> 