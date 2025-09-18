<template>
  <div class="article-detail-page">
    <AppHeader />
    
    <div class="page-content">
      <!-- 文章详情内容区域 -->
      <div class="article-container">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载文章中...</p>
        </div>
        <div v-else-if="currentArticle" class="article-content">
          <!-- 文章分类标签 -->
          <div class="article-category">
            <span class="category-tag">{{ currentArticle.category }}</span>
          </div>
          
          <!-- 文章标题 -->
          <h1 class="article-title">
            <div v-if="currentArticle.subtitle" class="title-line-1">{{ currentArticle.title }}</div>
            <div v-if="currentArticle.subtitle" class="title-line-2">{{ currentArticle.subtitle }}</div>
            <div v-else>{{ currentArticle.title }}</div>
          </h1>
          
          <!-- 文章元信息 -->
          <div class="article-meta">
            <div class="author-section">
              <img :src="currentArticle.author.avatar" :alt="currentArticle.author.name" class="author-avatar">
              <div class="author-details">
                <div class="author-info">
                  <span class="author-name">{{ currentArticle.author.name }}</span>
                </div>
                <div class="meta-info">
                  <span class="article-date">{{ currentArticle.date }}</span>
                  <span class="meta-divider">•</span>
                  <span class="read-time">阅读时间 {{ currentArticle.readTime }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 内容框容器 -->
          <div class="content-container">                        
          <!-- 文章内容 -->  
          <div class="article-body" v-if="currentArticle.content" v-html="currentArticle.content">
          </div>
          <div class="article-body" v-else>
            <!-- 如果没有content字段，显示默认内容 -->
            <div class="intro-section">
              <p class="content-text">
                {{ currentArticle.description || '文章内容加载中...' }}
              </p>
            </div>
            
            <!-- 提示框 -->
            <div class="tip-notice">
              <p><strong>提示：</strong>本文适用于各种主流电视盒子（如NVIDIA Shield TV、Apple TV、小米盒子国际版等），也适用于部分智能电视。教程中使用的设备为NVIDIA Shield TV Pro 2019。</p>
            </div>
            
            <!-- 准备工作 -->
            <div class="section-block">
              <h2 class="section-title">准备工作</h2>
              <p class="content-text">在开始之前，请确保您已准备好以下内容。这些是观看奈飞4K内容的基本要求：</p>
              
              <!-- 三列要求 -->
              <div class="requirements-grid">
                <div class="requirement-column">
                  <h3>硬件要求</h3>
                  <ul>
                    <li>支持4K和Netflix认证的电视盒子</li>
                    <li>4K HDR电视（HDMI 2.0接口）</li>
                    <li>高速HDMI 2.0线缆（18Gbps）</li>
                    <li>支持5.1声道或杜比全景声的音响系统</li>
                  </ul>
                </div>
                
                <div class="requirement-column">
                  <h3>网络要求</h3>
                  <ul>
                    <li>稳定的宽带网络（建议100Mbps以上）</li>
                    <li>支持5GHz频段的路由器</li>
                    <li>奈飞支持的DNS服务（可选）</li>
                  </ul>
                </div>
                
                <div class="requirement-column">
                  <h3>账号要求</h3>
                  <ul>
                    <li>Netflix高级会员账号（支持4K）</li>
                    <li>支持解锁奈飞的网络环境</li>
                    <li>支付方式（信用卡/PayPal）</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <!-- 详细步骤 -->
            <div class="section-block">
              <h2 class="section-title">详细步骤</h2>
              
              <!-- 步骤1：选择合适的电视盒子 -->
              <div class="step-section">
                <div class="step-header">
                  <span class="step-number">1</span>
                  <h3 class="step-title">选择合适的电视盒子</h3>
                </div>
                
                <p class="content-text">
                  并非所有电视盒子都支持奈飞4K播放。以下是经过测试确实支持奈飞4K的设备：
                </p>
                
                <div class="device-list">
                  <div class="device-item">
                    <strong>NVIDIA Shield TV Pro (2019)</strong> - 最佳性能，支持杜比视界和全景声
                  </div>
                  <div class="device-item">
                    <strong>Apple TV 4K (2022)</strong> - 优秀的生态系统，流畅体验
                  </div>
                  <div class="device-item">
                    <strong>小米盒子国际版</strong> - 性价比之选，支持4K但不支持杜比视界
                  </div>
                  <div class="device-item">
                    <strong>Chromecast with Google TV</strong> - 小巧便携，支持4K HDR
                  </div>
                </div>
                
                <!-- 设备展示图片 -->
                <div class="device-showcase">
                  <img src="/images/tv-box-interface.jpg" alt="智能电视盒子界面展示" class="showcase-image" />
                </div>
                
                <div class="warning-notice">
                  <p><strong>注意：</strong>国内版电视盒子（如天猫魔盒、当贝盒子）通常无法直接安装官方奈飞应用，即便安装也无法播放4K内容。</p>
                </div>
              </div>
              
              <!-- 步骤2：配置网络环境 -->
              <div class="step-section">
                <div class="step-header">
                  <span class="step-number">2</span>
                  <h3 class="step-title">配置网络环境</h3>
                </div>
                
                <p class="content-text">
                  由于奈飞对地区内容的限制，我们需要配置正确的网络环境：
                </p>
                
                <div class="network-steps">
                  <div class="network-step">
                    使用支持奈飞的网络服务（确保可以访问奈飞库）
                  </div>
                  <div class="network-step">
                    在路由器或电视盒子设置中配置网络参数
                  </div>
                  <div class="network-step">
                    测试网络速度（奈飞4K需要至少25Mbps稳定速度）
                  </div>
                </div>
                
                <div class="tip-box">
                  <h4>网络优化技巧：</h4>
                  <p>使用网线连接代替WiFi可以获得更稳定的速度。如果必须使用WiFi，请确保使用5GHz频段并靠近路由器。</p>
                </div>
              </div>
              
              <!-- 步骤3：安装奈飞应用 -->
              <div class="step-section">
                <div class="step-header">
                  <span class="step-number">3</span>
                  <h3 class="step-title">安装奈飞应用</h3>
                </div>
                
                <p class="content-text">
                  在设备上安装官方Netflix应用：
                </p>
                
                <div class="install-steps">
                  <div class="install-step">
                    在Google Play商店（Android TV设备）或App Store（Apple TV）搜索"Netflix"
                  </div>
                  <div class="install-step">
                    下载并安装最新版应用
                  </div>
                  <div class="install-step">
                    打开应用并登录您的Netflix账号
                  </div>
                </div>
                
                <!-- 应用界面展示图片 -->
                <div class="app-showcase">
                  <img src="/images/netflix-apps-interface.jpg" alt="电视盒子应用界面展示" class="showcase-image" />
                </div>
                
                <div class="warning-notice">
                  <p><strong>注意：</strong>请确保安装的是官方Netflix应用，而非第三方修改版，否则可能无法播放4K内容。</p>
                </div>
              </div>
              
              <!-- 步骤4：配置播放设置 -->
              <div class="step-section">
                <div class="step-header">
                  <span class="step-number">4</span>
                  <h3 class="step-title">配置播放设置</h3>
                </div>
                
                <p class="content-text">
                  登录后，进入账户设置调整播放参数：
                </p>
                
                <div class="config-steps">
                  <div class="config-step">
                    进入"账户设置"→"播放设置"
                  </div>
                  <div class="config-step">
                    将数据使用设置为"高"（4K所需）
                  </div>
                  <div class="config-step">
                    打开"测试参与"选项以获取最新功能
                  </div>
                  <div class="config-step">
                    设置首选字幕样式（大小、颜色等）
                  </div>
                </div>
                
                <!-- 设备配置展示图片 -->
                <div class="config-showcase">
                  <img src="/images/device-setup-config.jpg" alt="设备配置和设置界面" class="showcase-image" />
                </div>
              </div>
              
              <!-- 步骤5：验证4K播放效果 -->
              <div class="step-section">
                <div class="step-header">
                  <span class="step-number">5</span>
                  <h3 class="step-title">验证4K播放效果</h3>
                </div>
                
                <p class="content-text">
                  播放奈飞内容时，如何确认是否达到4K画质：
                </p>
                
                <div class="verify-steps">
                  <div class="verify-step">
                    在播放界面按"信息"按钮（不同设备按键不同）
                  </div>
                  <div class="verify-step">
                    查看分辨率信息（应显示2160p）
                  </div>
                  <div class="verify-step">
                    检查HDR标志（DV或HDR10）
                  </div>
                  <div class="verify-step">
                    注意音轨信息（DD+或Atmos）
                  </div>
                </div>
                
                <p class="content-text">
                  您也可以播放奈飞官方测试视频（搜索"Test Patterns"）来验证分辨率。
                </p>
              </div>
              
              <!-- 常见问题解答 -->
              <div class="section-block">
                <h2 class="section-title">常见问题解答</h2>
                
                <!-- 问题1 -->
                <div class="faq-item faq-item-orange">
                  <div class="faq-question">
                    <h3>为什么我的奈飞只显示HD，没有4K选项？</h3>
                  </div>
                  <div class="faq-answer">
                    <p>可能原因：1）您的账号不是高级会员；2）设备不支持4K播放；3）网络速度不足；4）内容在该地区没有4K版本。请逐一检查这些因素。</p>
                  </div>
                </div>
                
                <!-- 问题2 -->
                <div class="faq-item faq-item-green">
                  <div class="faq-question">
                    <h3>如何获得中文字幕？</h3>
                  </div>
                  <div class="faq-answer">
                    <p>奈飞大部分内容都提供中文字幕。播放时点击"字幕和音轨"图标，选择"中文(简体)"即可。如果某些内容没有中文，可能是地区限制导致。</p>
                  </div>
                </div>
                
                <!-- 问题3 -->
                <div class="faq-item faq-item-blue">
                  <div class="faq-question">
                    <h3>为什么播放时经常缓冲？</h3>
                  </div>
                  <div class="faq-answer">
                    <p>缓冲通常由网络问题引起：1）网络速度不足；2）WiFi信号不稳定；3）DNS解析问题。建议使用网线连接，更换DNS服务器（如Google DNS 8.8.8.8），或升级网络带宽。</p>
                  </div>
                </div>
              </div>
              
              <!-- 总结 -->
              <div class="section-block">
                <h2 class="section-title">总结</h2>
                
                <p class="content-text">
                  通过本文的指导，您应该已经成功在电视盒子上配置好了奈飞4K播放环境。享受4K HDR带来的视觉盛宴和杜比全景声的沉浸式体验吧！如果在配置过程中遇到任何问题，欢迎在评论区留言，我会尽力解答。
                </p>
                
                <div class="final-tip">
                  <p><strong>最后提示：</strong>奈飞的4K内容在不断更新，建议关注奈飞官方社交媒体或使用第三方服务（如Unogs）查询最新4K内容。同时，保持设备和应用的更新，以获得最佳体验。</p>
                </div>
              </div>
            </div>
          </div>
          </div>
          
          <!-- 相关推荐板块 -->
          <div class="related-section">
            <h2 class="related-title">相关推荐</h2>
            <div class="related-articles">
              <div class="related-article">
                <div class="related-image">
                  <img src="/images/related-1.jpg" alt="Apple TV 4K评测" />
                </div>
                <div class="related-content">
                  <div class="related-category">设备评测</div>
                  <h3 class="related-article-title">2023年Apple TV 4K全面评测：值得购买吗？</h3>
                  <div class="related-author">
                    <img src="/images/head1.png" alt="李评测" class="author-avatar-small" />
                    <span class="author-name-small">李评测</span>
                    <span class="publish-date-small">2023-06-15</span>
                  </div>
                </div>
              </div>
              
              <div class="related-article">
                <div class="related-image">
                  <img src="/images/related-2.jpg" alt="家庭影院搭建" />
                </div>
                <div class="related-content">
                  <div class="related-category">家居影院</div>
                  <h3 class="related-article-title">打造完美家庭影院：从入门到专业的完整指南</h3>
                  <div class="related-author">
                    <img src="/images/head2.png" alt="王影音" class="author-avatar-small" />
                    <span class="author-name-small">王影音</span>
                    <span class="publish-date-small">2023-06-10</span>
                  </div>
                </div>
              </div>
              
              <div class="related-article">
                <div class="related-image">
                  <img src="/images/related-3.jpg" alt="流媒体平台对比" />
                </div>
                <div class="related-content">
                  <div class="related-category">流媒体</div>
                  <h3 class="related-article-title">五大流媒体平台对比：Netflix、Disney+、HBO哪家强？</h3>
                  <div class="related-author">
                    <img src="/images/head3.png" alt="赵媒体" class="author-avatar-small" />
                    <span class="author-name-small">赵媒体</span>
                    <span class="publish-date-small">2023-06-05</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="content-placeholder">
          <h1>文章不存在</h1>
          <p>抱歉，您访问的文章不存在。</p>
          <button class="back-btn" @click="$router.go(-1)">返回上一页</button>
        </div>
      </div>
    </div>
    
    <AppFooter />
    
    <!-- 登录注册弹窗 -->
    <LoginRegisterModal :visible="modal.showLogin" @close="modal.closeLogin()" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useModalStore } from '@/stores/modal'
import { API_ENDPOINTS } from '@/config/api'

const modal = useModalStore()
const route = useRoute()

// 获取文章ID
const articleId = route.params.id

// 文章数据
const currentArticle = ref(null)
const loading = ref(true)
const relatedArticles = ref([])

// 从后端获取文章详情
const fetchArticle = async () => {
  loading.value = true
  try {
    const response = await $fetch(API_ENDPOINTS.articles.detail(articleId))
    
    if (response.success) {
      const article = response.data.article
      currentArticle.value = {
        id: article.id,
        title: article.title,
        subtitle: article.subtitle,
        description: article.description,
        content: article.content,
        image: article.image || '/images/help1.png',
        date: article.publish_date ? new Date(article.publish_date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) : '2023年6月20日',
        category: article.category,
        readTime: article.read_time || '8分钟',
        author: {
          avatar: article.author_avatar || '/images/zhangkeji.png',
          name: article.author_name || '管理员'
        },
        views: article.views || 0,
        likes: article.likes || 0
      }
      
      // 设置相关文章
      if (response.data.relatedArticles) {
        relatedArticles.value = response.data.relatedArticles
      }
    }
  } catch (error) {
    console.error('获取文章详情失败:', error)
    // 使用默认内容作为fallback
    currentArticle.value = {
      id: 1,
      title: '文章加载失败',
      description: '抱歉，文章内容加载失败，请稍后重试。',
      content: '',
      image: '/images/help1.png',
      date: '2023年6月20日',
      category: '教程指南',
      readTime: '8分钟',
      author: {
        avatar: '/images/zhangkeji.png',
        name: '张科技'
      }
    }
  } finally {
    loading.value = false
  }
}

// 页面加载时获取文章
onMounted(() => {
  fetchArticle()
})

// SEO配置 - 使用computed来响应式更新
const pageTitle = computed(() => currentArticle.value ? currentArticle.value.title : '文章详情')

useHead({
  title: computed(() => `${pageTitle.value} - 凡图拉`),
  meta: computed(() => [
    { name: 'description', content: currentArticle.value?.description || '凡图拉文章详情页面' },
    { name: 'keywords', content: currentArticle.value ? `${currentArticle.value.title},流媒体,教程,技术支持,${currentArticle.value.author?.name || ''}` : '凡图拉,文章' },
    { name: 'author', content: currentArticle.value?.author?.name || '凡图拉' },
    { name: 'robots', content: 'index, follow' },
    { name: 'article:published_time', content: currentArticle.value?.date || '' },
    { name: 'article:author', content: currentArticle.value?.author?.name || '' },
    // Open Graph
    { property: 'og:title', content: `${pageTitle.value} - 凡图拉` },
    { property: 'og:description', content: currentArticle.value?.description || '凡图拉文章详情页面' },
    { property: 'og:type', content: 'article' },
    { property: 'og:image', content: currentArticle.value?.image || '/images/default-og.jpg' },
    { property: 'og:url', content: `https://yourdomain.com/article/${articleId}` },
    { property: 'article:published_time', content: currentArticle.value?.date || '' },
    { property: 'article:author', content: currentArticle.value?.author?.name || '' },
    { property: 'article:section', content: currentArticle.value?.category || '' },
    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: `${pageTitle.value} - 凡图拉` },
    { name: 'twitter:description', content: currentArticle.value?.description || '凡图拉文章详情页面' },
    { name: 'twitter:image', content: currentArticle.value?.image || '/images/default-og.jpg' }
  ]),
  link: [
    { rel: 'canonical', href: `https://yourdomain.com/article/${articleId}` }
  ],
  script: computed(() => currentArticle.value ? [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": currentArticle.value.title,
        "description": currentArticle.value.description,
        "image": [currentArticle.value.image],
        "datePublished": currentArticle.value.date,
        "dateModified": currentArticle.value.date,
        "author": {
          "@type": "Person",
          "name": currentArticle.value.author?.name || '管理员'
        },
        "publisher": {
          "@type": "Organization",
          "name": "凡图拉",
          "logo": {
            "@type": "ImageObject",
            "url": "https://yourdomain.com/images/logo.png"
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://yourdomain.com/article/${articleId}`
        }
      })
    }
  ] : [])
})
</script>

<style scoped>
.article-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 60vh;
}

.article-container {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

/* 文章内容区域 */
.article-content {
  max-width: 800px;
  margin: 0 auto;
}

/* 内容框容器 */
.content-container {
  width: 100%;
  max-width: 1272px;
  min-height: 800px;
  background: #FFFFFF;
  box-shadow: 0px 5px 24px 0px rgba(0,0,0,0.08);
  border-radius: 24px 24px 24px 24px;
  margin: 0 auto;
  padding: 40px;
  box-sizing: border-box;
}

.content-placeholder {
  text-align: center;
  padding: 60px 20px;
}

.content-placeholder h1 {
  font-size: 32px;
  color: #222;
  margin-bottom: 20px;
  font-weight: 700;
  line-height: 1.3;
  text-align: left;
}

/* 加载状态样式 */
.loading-state {
  text-align: center;
  padding: 100px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 20px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2583f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: #666;
  font-size: 16px;
}

/* 分类标签 */
.article-category {
  margin-bottom: 20px;
  text-align: center;
}

.category-tag {
  display: inline-block;
  background: #2583f6;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

/* 文章标题 */
.article-title {
  font-size: 36px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.3;
  margin-bottom: 24px;
  text-align: center;
}

.title-line-1 {
  margin-bottom: 8px;
}

.title-line-2 {
  margin-bottom: 0;
}

/* 文章元信息 */
.article-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e5e5;
}

.author-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.author-info {
  display: flex;
  align-items: center;
  justify-content: center;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.author-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.meta-divider {
  color: #ccc;
  font-weight: normal;
  font-size: 14px;
}

.article-date,
.read-time {
  font-size: 14px;
  color: #666;
}



/* 文章正文 */
.article-body {
  font-size: 16px;
  line-height: 1.7;
  color: #333;
}

.intro-section {
  margin-bottom: 30px;
}

.content-text {
  font-size: 16px;
  color: #333;
  line-height: 1.8;
  margin-bottom: 20px;
}

/* 提示框样式 */
.tip-notice {
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  padding: 16px 20px;
  margin: 30px 0;
  border-radius: 4px;
}

.tip-notice p {
  margin: 0;
  color: #1976d2;
  font-size: 14px;
  line-height: 1.6;
}

/* 章节块样式 */
.section-block {
  margin-bottom: 50px;
}

/* 章节标题样式 */
.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
  position: relative;
  padding-bottom: 8px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: #2196f3;
}

/* 三列要求网格 */
.requirements-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  margin-top: 30px;
}

.requirement-column {
  background: #F8FAFC;
  padding: 24px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid #f0f0f0;
}

.requirement-column h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
  text-align: center;
}

.requirement-column ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.requirement-column li {
  padding: 8px 0;
  color: #555;
  font-size: 14px;
  line-height: 1.5;
  border-bottom: 1px solid #f0f0f0;
}

.requirement-column li:last-child {
  border-bottom: none;
}



.placeholder-text {
  font-size: 16px;
  color: #666;
  text-align: center;
  margin-top: 40px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .article-container {
    padding: 20px;
  }
  
  .article-title {
    font-size: 28px;
  }
  
  .article-meta {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .intro-text {
    font-size: 16px;
    padding: 16px;
  }
  


  .content-container {
    width: 100%;
    min-height: auto;
    padding: 20px;
  }

  .requirements-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .requirement-column {
    padding: 20px 16px;
  }

  .section-title {
    font-size: 20px;
  }
}

.back-btn {
  margin-top: 20px;
  padding: 12px 24px;
  background: #2583f6;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.back-btn:hover {
  background: #1e70e6;
}

@media (max-width: 768px) {
  .page-content {
    padding: 20px 16px;
  }
  
  .article-container {
    padding: 20px;
  }
  
  .content-placeholder {
    padding: 40px 20px;
  }
  
  .content-placeholder h1 {
    font-size: 24px;
  }
  
  .author-section {
    gap: 8px;
  }
  
  .author-details {
    gap: 2px;
  }
  
  .meta-info {
    gap: 6px;
  }
  
  .author-avatar {
    width: 32px;
    height: 32px;
  }
  
  .author-name {
    font-size: 14px;
  }
  
  .article-date,
  .read-time {
    font-size: 12px;
  }
  
  .meta-divider {
    font-size: 12px;
  }
}

/* 步骤样式 */
.step-section {
  margin: 40px 0;
  padding: 30px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.step-number {
  width: 40px;
  height: 40px;
  background: #2196f3;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 18px;
}

.step-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

/* 设备列表样式 */
.device-list {
  margin: 20px 0;
}

.device-item {
  padding: 16px 20px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 15px;
  line-height: 1.5;
  transition: box-shadow 0.3s ease;
}

.device-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.device-item strong {
  color: #1a1a1a;
}

/* 设备展示图片 */
.device-showcase {
  margin: 30px 0;
  text-align: center;
}

.showcase-image {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

/* 警告提示框 */
.warning-notice {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 16px 20px;
  margin-top: 24px;
}

.warning-notice p {
  margin: 0;
  color: #856404;
  font-size: 14px;
  line-height: 1.6;
}

/* 网络步骤样式 */
.network-steps {
  margin: 20px 0;
}

.network-step {
  padding: 12px 0;
  padding-left: 24px;
  position: relative;
  font-size: 15px;
  line-height: 1.6;
  color: #333;
}

.network-step::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #2196f3;
  font-weight: bold;
  font-size: 18px;
}

/* 安装步骤样式 */
.install-steps {
  margin: 20px 0;
}

.install-step {
  padding: 12px 0;
  padding-left: 24px;
  position: relative;
  font-size: 15px;
  line-height: 1.6;
  color: #333;
}

.install-step::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #2196f3;
  font-weight: bold;
  font-size: 18px;
}

/* 应用展示样式 */
.app-showcase {
  margin: 30px 0;
  text-align: center;
}

/* 配置步骤样式 */
.config-steps {
  margin: 20px 0;
}

.config-step {
  padding: 12px 0;
  padding-left: 24px;
  position: relative;
  font-size: 15px;
  line-height: 1.6;
  color: #333;
}

.config-step::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #2196f3;
  font-weight: bold;
  font-size: 18px;
}

/* 配置展示样式 */
.config-showcase {
  margin: 30px 0;
  text-align: center;
}

/* 验证步骤样式 */
.verify-steps {
  margin: 20px 0;
}

.verify-step {
  padding: 12px 0;
  padding-left: 24px;
  position: relative;
  font-size: 15px;
  line-height: 1.6;
  color: #333;
}

  .verify-step::before {
    content: '•';
    position: absolute;
    left: 0;
    color: #2196f3;
    font-weight: bold;
    font-size: 18px;
  }

/* FAQ样式 */
.faq-item {
  margin: 30px 0;
  border-radius: 12px;
  overflow: hidden;
  border: none;
}

/* 不同颜色的FAQ项 */
.faq-item-orange {
  background: #fff8f3;
}

.faq-item-green {
  background: #f3f9f3;
}

.faq-item-blue {
  background: #f3f8ff;
}

.faq-question {
  padding: 20px 24px;
  border-bottom: none;
}

/* 不同颜色FAQ问题的背景 */
.faq-item-orange .faq-question {
  background: #ffeee6;
}

.faq-item-green .faq-question {
  background: #e8f5e8;
}

.faq-item-blue .faq-question {
  background: #e8f2ff;
}

.faq-question h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.4;
}

.faq-answer {
  padding: 20px 24px;
  background: transparent;
}

.faq-answer p {
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
  color: #555;
}

/* 最后提示框样式 */
.final-tip {
  background: #e3f2fd;
  border: 1px solid #90caf9;
  border-left: 4px solid #2196f3;
  border-radius: 8px;
  padding: 20px 24px;
  margin-top: 30px;
}

.final-tip p {
  margin: 0;
  color: #1976d2;
  font-size: 15px;
  line-height: 1.7;
}

/* 提示框样式 */
.tip-box {
  background: #e8f5e8;
  border: 1px solid #c3e6c3;
  border-radius: 8px;
  padding: 20px;
  margin-top: 24px;
}

.tip-box h4 {
  margin: 0 0 12px 0;
  color: #2e7d32;
  font-size: 16px;
  font-weight: 600;
}

.tip-box p {
  margin: 0;
  color: #388e3c;
  font-size: 14px;
  line-height: 1.6;
}

/* 移动端响应式调整 */
@media (max-width: 768px) {
  .step-section {
    padding: 20px;
    margin: 30px 0;
  }
  
  .step-header {
    gap: 12px;
  }
  
  .step-number {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
  
  .step-title {
    font-size: 18px;
  }
  
  .device-item {
    padding: 12px 16px;
    font-size: 14px;
  }
  
  .network-step {
    font-size: 14px;
    padding-left: 20px;
  }
  
  .install-step {
    font-size: 14px;
    padding-left: 20px;
  }
  
  .config-step {
    font-size: 14px;
    padding-left: 20px;
  }
  
  .verify-step {
    font-size: 14px;
    padding-left: 20px;
  }
  
  .faq-question {
    padding: 16px 20px;
  }
  
  .faq-question h3 {
    font-size: 16px;
  }
  
  .faq-answer {
    padding: 16px 20px;
  }
  
  .faq-answer p {
    font-size: 14px;
  }
  
  .final-tip {
    padding: 16px 20px;
    margin-top: 24px;
  }
  
  .final-tip p {
    font-size: 14px;
  }
}

/* 相关推荐样式 */
.related-section {
  margin-top: 50px;
  padding-top: 40px;
}

.related-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 30px;
  position: relative;
  padding-bottom: 8px;
}

.related-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: #2196f3;
}

.related-articles {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.related-article {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.related-article:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.related-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.related-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.related-article:hover .related-image img {
  transform: scale(1.05);
}

.related-content {
  padding: 20px;
}

.related-category {
  display: inline-block;
  background: #f0f8ff;
  color: #2196f3;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 12px;
}

.related-article-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.4;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar-small {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.author-name-small {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.publish-date-small {
  font-size: 12px;
  color: #666;
  margin-left: auto;
}

/* 相关推荐响应式设计 */
@media (max-width: 768px) {
  .related-section {
    margin-top: 30px;
    padding-top: 30px;
  }
  
  .related-title {
    font-size: 20px;
    margin-bottom: 20px;
  }
  
  .related-articles {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .related-image {
    height: 160px;
  }
  
  .related-content {
    padding: 16px;
  }
  
  .related-article-title {
    font-size: 15px;
  }
}
</style> 