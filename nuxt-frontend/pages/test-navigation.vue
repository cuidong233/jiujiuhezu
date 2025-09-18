<template>
  <div class="test-navigation">
    <h1>路由测试页面</h1>
    
    <div class="navigation-test">
      <h2>测试导航功能</h2>
      
      <div class="button-group">
        <h3>使用 navigateTo (推荐)</h3>
        <el-button @click="testNavigateTo('/profile')">个人中心</el-button>
        <el-button @click="testNavigateTo('/profile/orders')">我的订单</el-button>
        <el-button @click="testNavigateTo('/profile/wallet')">我的钱包</el-button>
        <el-button @click="testNavigateTo('/profile/notifications')">通知页面</el-button>
      </div>

      <div class="button-group">
        <h3>使用 router.push</h3>
        <el-button @click="testRouterPush('/profile')">个人中心</el-button>
        <el-button @click="testRouterPush('/profile/orders')">我的订单</el-button>
        <el-button @click="testRouterPush('/profile/wallet')">我的钱包</el-button>
      </div>

      <div class="button-group">
        <h3>使用 NuxtLink</h3>
        <NuxtLink to="/profile" class="link-button">
          <el-button>个人中心</el-button>
        </NuxtLink>
        <NuxtLink to="/profile/orders" class="link-button">
          <el-button>我的订单</el-button>
        </NuxtLink>
        <NuxtLink to="/profile/wallet" class="link-button">
          <el-button>我的钱包</el-button>
        </NuxtLink>
      </div>
    </div>

    <div class="route-info">
      <h2>当前路由信息</h2>
      <pre>{{ routeInfo }}</pre>
    </div>

    <div class="console-output">
      <h2>控制台输出</h2>
      <pre>{{ consoleOutput }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute, navigateTo } from '#app'

const router = useRouter()
const route = useRoute()
const consoleOutput = ref('')

const routeInfo = computed(() => {
  return {
    path: route.path,
    fullPath: route.fullPath,
    name: route.name,
    params: route.params,
    query: route.query
  }
})

const addLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString('zh-CN')
  consoleOutput.value += `[${timestamp}] ${message}\n`
}

const testNavigateTo = async (path: string) => {
  addLog(`尝试使用 navigateTo 导航到: ${path}`)
  try {
    await navigateTo(path)
    addLog(`✅ 导航成功: ${path}`)
  } catch (error: any) {
    addLog(`❌ 导航失败: ${error.message}`)
    console.error('NavigateTo 错误:', error)
  }
}

const testRouterPush = async (path: string) => {
  addLog(`尝试使用 router.push 导航到: ${path}`)
  try {
    await router.push(path)
    addLog(`✅ 导航成功: ${path}`)
  } catch (error: any) {
    addLog(`❌ 导航失败: ${error.message}`)
    console.error('Router.push 错误:', error)
  }
}

onMounted(() => {
  addLog('页面已加载')
  addLog(`当前路径: ${route.path}`)
})
</script>

<style scoped>
.test-navigation {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #333;
  margin-bottom: 30px;
}

h2 {
  color: #666;
  margin-bottom: 15px;
  margin-top: 30px;
}

h3 {
  color: #999;
  margin-bottom: 10px;
}

.button-group {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

.button-group .el-button {
  margin-right: 10px;
  margin-bottom: 10px;
}

.link-button {
  display: inline-block;
  margin-right: 10px;
  margin-bottom: 10px;
}

.route-info,
.console-output {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}

pre {
  background: white;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 14px;
  line-height: 1.5;
  font-family: 'Courier New', monospace;
}
</style>