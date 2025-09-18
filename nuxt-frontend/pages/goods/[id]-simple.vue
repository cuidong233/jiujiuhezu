<template>
  <div class="goods-detail-page">
    <AppHeader />
    
    <div class="debug-info">
      <h3>调试信息</h3>
      <p>商品ID: {{ goodsId }}</p>
      <p>加载状态: {{ loading ? '正在加载' : '加载完成' }}</p>
      <p>错误信息: {{ error || '无' }}</p>
      <p>数据: {{ JSON.stringify(goodsInfo, null, 2) }}</p>
    </div>
    
    <!-- 简单的商品信息显示 -->
    <div v-if="!loading && goodsInfo" class="goods-content">
      <h1>{{ goodsInfo.name }}</h1>
      <p>价格: ¥{{ goodsInfo.price }}</p>
      <p>描述: {{ goodsInfo.desc }}</p>
      <button @click="$router.back()">返回</button>
    </div>
    
    <!-- 加载中 -->
    <div v-else-if="loading" class="loading">
      正在加载商品信息...
    </div>
    
    <!-- 错误信息 -->
    <div v-else-if="error" class="error">
      加载失败: {{ error }}
      <button @click="loadGoods">重试</button>
    </div>
    
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const goodsId = ref(route.params.id)
const loading = ref(true)
const error = ref('')
const goodsInfo = ref<any>(null)

// 加载商品数据
async function loadGoods() {
  console.log('开始加载商品，ID:', goodsId.value)
  loading.value = true
  error.value = ''
  
  // 设置超时，避免永久等待
  const timeout = setTimeout(() => {
    console.log('加载超时，使用模拟数据')
    goodsInfo.value = {
      id: goodsId.value,
      name: '超时商品 ' + goodsId.value,
      price: 77.77,
      desc: '加载超时，显示默认数据',
      image: '/images/xiangqingzhutu1.png'
    }
    loading.value = false
    error.value = '加载超时'
  }, 3000)
  
  try {
    // 使用完整的URL路径
    const apiUrl = `http://localhost:3001/api/product/goods/${goodsId.value}`
    console.log('请求URL:', apiUrl)
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    clearTimeout(timeout)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('API响应:', data)
    
    if (data.success && data.data) {
      goodsInfo.value = {
        id: data.data.id,
        name: data.data.title || data.data.name,
        price: data.data.price,
        desc: data.data.description,
        image: data.data.image
      }
    } else {
      // 使用模拟数据
      goodsInfo.value = {
        id: goodsId.value,
        name: '测试商品 ' + goodsId.value,
        price: 99.99,
        desc: '这是一个测试商品',
        image: '/images/xiangqingzhutu1.png'
      }
    }
  } catch (err: any) {
    clearTimeout(timeout)
    console.error('加载失败:', err)
    error.value = err.message || '加载失败'
    
    // 即使API失败也显示模拟数据
    goodsInfo.value = {
      id: goodsId.value,
      name: '模拟商品 ' + goodsId.value,
      price: 88.88,
      desc: 'API加载失败，显示模拟数据',
      image: '/images/xiangqingzhutu1.png'
    }
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  console.log('页面挂载完成，准备加载数据')
  loadGoods()
})
</script>

<style scoped>
.goods-detail-page {
  min-height: 100vh;
  padding: 20px;
}

.debug-info {
  background: #f0f0f0;
  padding: 20px;
  margin: 20px;
  border-radius: 8px;
  font-family: monospace;
}

.debug-info h3 {
  margin-top: 0;
  color: #333;
}

.debug-info p {
  margin: 5px 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.goods-content {
  padding: 20px;
  margin: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.loading, .error {
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.error {
  color: red;
}

button {
  background: #235CDC;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

button:hover {
  background: #1d4ed8;
}
</style>