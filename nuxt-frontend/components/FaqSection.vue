<template>
  <section class="faq-section">
    <div class="faq-container">
      <div class="section-header">
        <h2 class="section-title">常见问题</h2>
        <p class="section-subtitle">快速了解我们的服务</p>
      </div>
      
      <div class="faq-grid">
        <div 
          v-for="(item, index) in faqList" 
          :key="index"
          class="faq-card"
        >
          <div 
            class="faq-question"
            @click="toggleFaq(index)"
          >
            <h3 class="question-text">{{ item.title }}</h3>
            <span class="toggle-icon" :class="{ 'expanded': expandedItems.includes(index) }">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </div>
          
          <transition name="expand">
            <div v-if="expandedItems.includes(index)" class="faq-answer">
              <p>{{ item.content || item.answer }}</p>
            </div>
          </transition>
        </div>
      </div>
      
      <!-- 移除查看全部按钮，因为不需要独立页面 -->
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { commonApi } from '@/api/common'

// 展开的项目索引
const expandedItems = ref<number[]>([])

// FAQ列表
const faqList = ref([
  {
    id: 1,
    title: '如何购买商品？',
    content: '选择您需要的商品，点击购买按钮，选择支付方式完成支付即可。支付成功后，系统会自动发送CDK到您的邮箱或账户中。'
  },
  {
    id: 2,
    title: '支付后多久能收到CDK？',
    content: '支付成功后，系统会立即自动发货，您可以在"我的订单"中查看CDK信息。如遇特殊情况，请联系在线客服处理。'
  },
  {
    id: 3,
    title: '支持哪些支付方式？',
    content: '我们支持支付宝、微信支付、银行卡等多种支付方式，您可以选择最方便的方式进行支付。'
  },
  {
    id: 4,
    title: 'CDK如何使用？',
    content: '获得CDK后，请在对应平台的兑换页面输入CDK码进行兑换。具体操作步骤请参考商品详情页的使用说明。'
  },
  {
    id: 5,
    title: '可以退款吗？',
    content: '虚拟商品一经售出，如无质量问题不支持退款。如遇到CDK无法使用等问题，请及时联系客服，我们会为您处理。'
  },
  {
    id: 6,
    title: '如何联系客服？',
    content: '您可以点击页面右下角的客服按钮，或在导航栏点击"客服"进入在线客服系统，我们的客服团队会及时为您解答。'
  }
])

// 切换FAQ展开状态
const toggleFaq = (index: number) => {
  const expandedIndex = expandedItems.value.indexOf(index)
  if (expandedIndex > -1) {
    expandedItems.value.splice(expandedIndex, 1)
  } else {
    expandedItems.value.push(index)
  }
}

// 获取热门问题
const fetchHotQuestions = async () => {
  try {
    const res = await commonApi.getHotQuestions?.() || await commonApi.getQuestionList()
    if (res && res.data) {
      // 取前6个问题
      const questions = Array.isArray(res.data) ? res.data : res.data.list || []
      if (questions.length > 0) {
        faqList.value = questions.slice(0, 6).map((item: any) => ({
          id: item.id,
          title: item.title,
          content: item.content || item.answer
        }))
      }
    }
  } catch (error) {
    console.log('使用默认FAQ数据')
  }
}

onMounted(() => {
  fetchHotQuestions()
})
</script>

<style scoped>
.faq-section {
  padding: 80px 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.faq-container {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
}

.section-title {
  font-size: 36px;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
  font-family: 'Noto Sans SC', sans-serif;
}

.section-subtitle {
  font-size: 18px;
  color: #666;
  font-family: 'Noto Sans SC', sans-serif;
}

.faq-grid {
  display: grid;
  gap: 20px;
}

.faq-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.faq-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.faq-question {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  background: white;
  transition: background-color 0.3s ease;
}

.faq-question:hover {
  background: #f8f9fa;
}

.question-text {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
  font-family: 'Noto Sans SC', sans-serif;
}

.toggle-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f5ff;
  border-radius: 50%;
  color: #4A90E2;
  transition: all 0.3s ease;
}

.toggle-icon.expanded {
  transform: rotate(180deg);
  background: #4A90E2;
  color: white;
}

.faq-answer {
  padding: 0 24px 20px;
  background: #f8f9fa;
}

.faq-answer p {
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
  color: #666;
  font-family: 'Noto Sans SC', sans-serif;
}

/* 展开动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 200px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.faq-footer {
  text-align: center;
}

.view-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background: #4A90E2;
  color: white;
  text-decoration: none;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Noto Sans SC', sans-serif;
  transition: all 0.3s ease;
}

.view-all-btn:hover {
  background: #357abd;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 144, 226, 0.3);
}

.arrow-icon {
  transition: transform 0.3s ease;
}

.view-all-btn:hover .arrow-icon {
  transform: translateX(4px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .faq-section {
    padding: 60px 0;
  }
  
  .section-title {
    font-size: 28px;
  }
  
  .question-text {
    font-size: 16px;
  }
  
  .faq-answer p {
    font-size: 14px;
  }
}
</style>