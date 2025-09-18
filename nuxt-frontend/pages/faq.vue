<template>
  <div class="faq-page">
    <!-- 顶部导航 -->
    <AppHeader />
    <div class="page-content">
      <div class="content-container">
        <div class="header-section">
          <h1 class="main-title">帮助中心</h1>
          <p class="main-subtitle">我们整理了用户最常见的问题，帮助您快速找到答案</p>
        </div>
        
        <div class="search-section">
          <h3 class="search-title">有问题？快速搜索解答</h3>
          <div class="search-box">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="输入您的问题关键词..." 
              class="search-input"
              @keyup.enter="handleSearch"
            />
            <button @click="handleSearch" class="search-btn">搜索</button>
          </div>
        </div>

        <div class="category-section">
          <button 
            v-for="category in categories" 
            :key="category.key"
            :class="['category-btn', { active: activeCategory === category.key }]"
            @click="setActiveCategory(category.key)"
          >
            {{ category.label }}
          </button>
        </div>

        <!-- 常见问题解答标题板块 -->
        <div class="faq-header-section">
          <div class="faq-header">
            <div class="faq-icon">
              <img src="/images/wenhao.png" alt="问号" />
            </div>
            <h3 class="faq-title">常见问题解答</h3>
          </div>
        </div>

        <!-- 问题列表板块 -->
        <div class="faq-list-section">
          <div class="faq-list">
            <div 
              v-for="(faq, index) in filteredFaqs" 
              :key="index"
              class="faq-item"
              @click="toggleFaq(index)"
            >
              <div class="faq-question">
                {{ faq.title }}
              </div>
              <div v-if="faq.content && expandedItems.includes(index)" class="faq-answer">
                {{ faq.content }}
              </div>
            </div>
          </div>
        </div>

        <div class="contact-section">
          <h3 class="contact-title">没有找到您的问题？</h3>
          <p class="contact-desc">我们的客服团队随时为您提供帮助，平均响应时间不超过3分钟，解决率高达99.8%!</p>
          <button class="contact-btn">
            <span class="contact-icon">
              <img src="/images/kefu.png" alt="客服" />
            </span>
            联系在线客服
          </button>
        </div>
      </div>
    </div>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { commonApi } from '@/api/common'

useHead({
  title: '帮助中心 - 凡图拉',
  meta: [
    { name: 'description', content: '凡图拉帮助中心，提供常见问题解答，帮助您快速了解平台使用方法和相关政策。' },
    { name: 'keywords', content: '凡图拉,帮助中心,常见问题,FAQ,帮助,客服,使用指南' }
  ]
})

const searchQuery = ref('')
const activeCategory = ref('all')
const expandedItems = ref<number[]>([])

const categories = ref<any[]>([])
const faqs = ref<any[]>([])

// 获取FAQ数据
const fetchFaqs = async () => {
  const res = await commonApi.getQuestionList()
  if (res && res.data) {
    faqs.value = res.data
    // 自动生成分类
    const cats = Array.from(new Set(res.data.map((item: any) => item.categoryName || '未分组')))
    categories.value = [{ key: 'all', label: '全部问题' }, ...cats.map(c => ({ key: c, label: c }))]
  }
}
onMounted(fetchFaqs)

const filteredFaqs = computed(() => {
  let result = faqs.value
  if (activeCategory.value !== 'all') {
    result = result.filter(faq => faq.categoryName === activeCategory.value)
  }
  if (searchQuery.value.trim()) {
    result = result.filter(faq => 
      faq.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (faq.content && faq.content.toLowerCase().includes(searchQuery.value.toLowerCase()))
    )
  }
  return result
})

const handleSearch = () => {}
const setActiveCategory = (category: string) => { activeCategory.value = category }
const toggleFaq = (index: number) => {
  const expandedIndex = expandedItems.value.indexOf(index)
  if (expandedIndex > -1) {
    expandedItems.value.splice(expandedIndex, 1)
  } else {
    expandedItems.value.push(index)
  }
}
</script>

<style scoped>
.faq-page {
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.page-content {
  flex: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 60px 20px;
}

.content-container {
  width: 100%;
  max-width: 900px;
  background: white;
  border-radius: 16px;
  padding: 60px 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin: 0 auto;
}

.header-section {
  text-align: center;
  margin-bottom: 50px;
}

.main-title {
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 700;
  font-size: 36px;
  color: #4A90E2;
  margin-bottom: 10px;
  letter-spacing: 1px;
}

.main-subtitle {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 16px;
  color: #666;
  margin-top: 10px;
}

.search-section {
  background: #fff;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
  text-align: center;
}

.search-title {
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 600;
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  max-width: 600px;
  margin: 0 auto;
  gap: 0;
}

.search-input {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid #e1e5e9;
  border-right: none;
  border-radius: 25px 0 0 25px;
  font-size: 16px;
  outline: none;
  font-family: 'Noto Sans SC', sans-serif;
}

.search-input:focus {
  border-color: #4A90E2;
}

.search-btn {
  padding: 12px 30px;
  background: #4A90E2;
  color: white;
  border: none;
  border-radius: 0 25px 25px 0;
  font-size: 16px;
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.search-btn:hover {
  background: #357abd;
}

.category-section {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.category-btn {
  padding: 10px 25px;
  border: 2px solid #e1e5e9;
  background: white;
  border-radius: 25px;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-btn:hover {
  border-color: #4A90E2;
  color: #4A90E2;
}

.category-btn.active {
  background: #4A90E2;
  border-color: #4A90E2;
  color: white;
}

/* 常见问题解答标题板块 */
.faq-header-section {
  background: #E6F7FF;
  padding: 20px 30px;
  border-radius: 16px 16px 0 0;
  margin-bottom: 0;
}

/* 问题列表板块 */
.faq-list-section {
  background: white;
  padding: 30px;
  border-radius: 0 0 16px 16px;
  margin-bottom: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.faq-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 25px;
}

.faq-icon {
  font-size: 24px;
}

.faq-icon img {
  width: 24px;
  height: 24px;
  display: block;
}

.faq-title {
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 600;
  font-size: 20px;
  color: #4A90E2;
  margin: 0;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.faq-item {
  background: transparent;
  border-radius: 0;
  padding: 20px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  border-bottom: 1px solid #e1e5e9;
}

.faq-item:hover {
  background: rgba(74, 144, 226, 0.05);
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-question {
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 600;
  font-size: 16px;
  color: #333;
  line-height: 1.5;
}

.faq-answer {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.contact-section {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.contact-title {
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 600;
  font-size: 24px;
  color: #4A90E2;
  margin-bottom: 15px;
}

.contact-desc {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
  line-height: 1.6;
}

.contact-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 15px 30px;
  background: #4A90E2;
  color: white;
  border: none;
  border-radius: 25px;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.contact-btn:hover {
  background: #357abd;
}

.contact-icon {
  font-size: 18px;
}

.contact-icon img {
  width: 18px;
  height: 18px;
  display: block;
}
</style>
