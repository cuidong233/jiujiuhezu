<template>
  <div class="community-page">
    <!-- 顶部导航 -->
    <AppHeader />
    <div class="page-content">


      <!-- 标签导航区域 -->
      <div class="category-tags">
        <button 
          v-for="tag in categoryTags" 
          :key="tag.key"
          :class="['tag-btn', { active: activeTag === tag.key && activeTag !== 'all' }]"
          :style="{ background: activeTag === tag.key ? tag.color : '#fff', color: activeTag === tag.key ? '#fff' : tag.color, border: `1.5px solid ${tag.color}` }"
          :title="activeTag === tag.key && activeTag !== 'all' ? '再次点击返回所有文章' : `查看${tag.label}分类文章`"
          @click="setActiveTag(tag.key)"
        >
          <span class="tag-icon">{{ tag.icon }}</span>
          {{ tag.label }}
          <span v-if="activeTag === tag.key && activeTag !== 'all'" class="reset-hint">×</span>
        </button>
      </div>

      <!-- 文章卡片区域 -->
      <div class="articles-grid">
        <NuxtLink 
          v-for="article in filteredArticles" 
          :key="article.id"
          :to="`/article/${article.id}`"
          class="article-card"
        >
          <div class="article-image">
            <img :src="article.image" :alt="article.title" />
            </div>
          <div class="article-content">
            <h3 class="article-title">{{ article.title }}</h3>
            <p class="article-description">{{ article.description }}</p>
            <div class="article-meta">
              <span class="article-date">{{ article.date }}</span>
              <div class="article-author">
                <span class="author-avatar">{{ article.author.avatar }}</span>
                <span class="author-name">{{ article.author.name }}</span>
            </div>
            </div>
          </div>
        </NuxtLink>
          </div>

      <!-- 发布文章按钮 -->
      <div class="publish-section">
        <button class="publish-btn" @click="openPublishModal">
          <span class="publish-icon">+</span>
          发布文章
        </button>
      </div>
    </div>
    <AppFooter />
    
    <!-- 登录注册弹窗 -->
    <LoginRegisterModal :visible="modal.showLogin" @close="modal.closeLogin()" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useModalStore } from '@/stores/modal'
import { API_ENDPOINTS } from '@/config/api'

const modal = useModalStore()

// 当前激活的标签
const activeTag = ref('all')

// 分类标签数据 - 映射到后端的分类
const categoryTags = [
  { key: '设备评测', label: '设备评测', icon: '🏠', color: '#FF7A7A' },
  { key: '教程指南', label: '教程指南', icon: '📝', color: '#4CAF50' },
  { key: '家居影院', label: '家居影院', icon: '🔧', color: '#2196F3' },
  { key: '流媒体', label: '流媒体', icon: '📱', color: '#FF9800' },
  { key: '技术文章', label: '技术文章', icon: '🔒', color: '#9C27B0' }
]

// 文章数据
const articles = ref([])
const loading = ref(false)

// 从后端获取文章
const fetchArticles = async () => {
  loading.value = true
  try {
    const response = await $fetch(API_ENDPOINTS.articles.list, {
      params: {
        status: 'published',
        limit: 20
      }
    })
    
    if (response.success) {
      // 转换数据格式以适配前端显示
      articles.value = response.data.articles.map(article => ({
        id: article.id,
        title: article.title,
        description: article.description || article.subtitle || '',
        image: article.image || '/images/help1.png',
        date: article.publish_date ? new Date(article.publish_date).toLocaleDateString('zh-CN') : '2023年6月20日',
        category: article.category,
        author: {
          avatar: article.author_avatar || '👨‍💻',
          name: article.author_name || '管理员'
        }
      }))
    }
  } catch (error) {
    console.error('获取文章失败:', error)
    // 如果API失败，使用默认数据
    articles.value = [
      {
        id: 1,
        title: '电视盒子看奈飞4K完整教程：解锁高清流媒体体验',
        description: '教你如何选择合适的电视盒子，安装奈飞App解码4K画质，解决播放卡顿问题...',
        image: '/images/help1.png',
        date: '2023年6月20日',
        category: '教程指南',
        author: {
          avatar: '👨‍💻',
          name: '张科技'
        }
      }
    ]
  } finally {
    loading.value = false
  }
}

// 根据标签筛选文章
const filteredArticles = computed(() => {
  if (activeTag.value === 'all') {
    return articles.value
  }
  return articles.value.filter(article => article.category === activeTag.value)
})

// 页面加载时获取文章
onMounted(() => {
  fetchArticles()
})

// 设置激活标签
const setActiveTag = (tagKey: string) => {
  // 如果点击的是当前已激活的标签，则返回显示所有文章
  if (activeTag.value === tagKey) {
    activeTag.value = 'all'
  } else {
    activeTag.value = tagKey
  }
}

// 获取分类标签名称
const getCategoryLabel = (tagKey: string) => {
  const tag = categoryTags.find(t => t.key === tagKey)
  return tag ? tag.label : tagKey
}

// 查看文章详情
const router = useRouter()
const viewArticle = (article: any) => {
  // 所有文章都跳转到详情页面
  console.log('Navigating to article:', article.id)
  router.push(`/article/${article.id}`)
}

// 打开发布文章弹窗
const openPublishModal = () => {
  // TODO: 实现发布文章功能
  // 这里可以打开发布文章的弹窗或跳转到发布页面
}

// SEO配置
useHead({
  title: '社区帮助 - 凡图拉',
  meta: [
    { name: 'description', content: '凡图拉社区帮助中心，为您提供全面的使用指南和客服支持。' }
  ]
})
</script>

<style scoped>
.community-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.page-content {
  flex: 1;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 60px 20px 40px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

/* 标签导航样式 */
.category-tags {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 20px 0 40px;
  flex-wrap: wrap;
}

.tag-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 50px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
  color: #666;
  border: 1.5px solid #eee;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.tag-btn.active {
  color: #fff !important;
  background: var(--tag-color, #2583f6) !important;
  border: 1.5px solid var(--tag-color, #2583f6) !important;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}

.tag-btn:hover {
  opacity: 0.92;
  transform: translateY(-2px);
}

.tag-icon {
  font-size: 16px;
}

.reset-hint {
  font-size: 18px;
  margin-left: 8px;
  opacity: 0.8;
  font-weight: bold;
}

/* 文章网格样式 */
.articles-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 60px;
}

@media (max-width: 1200px) {
  .articles-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 800px) {
  .articles-grid {
    grid-template-columns: 1fr;
  }
}

/* 文章卡片样式 */
.article-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  text-decoration: none;
  color: inherit;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.article-image {
  width: 100%;
  height: 120px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.article-title {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-description {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-date {
  font-size: 12px;
  color: #999;
}

.article-author {
  display: flex;
  align-items: center;
  gap: 6px;
}

.author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #2583f6;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.author-name {
  font-size: 12px;
  color: #2583f6;
  font-weight: 500;
}

/* 发布文章按钮样式 */
.publish-section {
  display: flex;
  justify-content: center;
}

.publish-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  background: linear-gradient(135deg, #2583f6 0%, #1e70e6 100%);
  color: #fff;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(37, 131, 246, 0.3);
}

.publish-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 131, 246, 0.4);
}

.publish-icon {
  font-size: 20px;
  font-weight: bold;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-content {
    padding: 16px 16px 40px;
  }
  
  .category-tags {
    gap: 8px;
  }
  
  .tag-btn {
    padding: 8px 16px;
    font-size: 12px;
  }
  
  .articles-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .article-image {
    height: 100px;
  }
  
  .publish-btn {
    padding: 12px 24px;
    font-size: 14px;
  }
}
</style> 