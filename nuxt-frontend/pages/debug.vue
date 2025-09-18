<template>
  <div style="padding: 20px; font-family: monospace;">
    <h1>🔍 调试页面 - 登录状态检查</h1>
    
    <div style="margin: 20px 0; padding: 15px; background: #f0f0f0; border-radius: 5px;">
      <h2>Cookie状态：</h2>
      <p><strong>token (useCookie):</strong> {{ tokenFromCookie || '空' }}</p>
      <p><strong>document.cookie:</strong> {{ documentCookie }}</p>
    </div>

    <div style="margin: 20px 0; padding: 15px; background: #f0f0f0; border-radius: 5px;">
      <h2>LocalStorage状态：</h2>
      <p><strong>token:</strong> {{ localStorageToken || '空' }}</p>
      <p><strong>user:</strong> {{ localStorageUser }}</p>
    </div>

    <div style="margin: 20px 0; padding: 15px; background: #f0f0f0; border-radius: 5px;">
      <h2>UserStore状态：</h2>
      <p><strong>isLoggedIn:</strong> {{ userStore.isLoggedIn }}</p>
      <p><strong>token:</strong> {{ userStore.token || '空' }}</p>
      <p><strong>user:</strong> {{ JSON.stringify(userStore.user) }}</p>
    </div>

    <div style="margin: 20px 0;">
      <button @click="testSetCookie" style="padding: 10px 20px; margin-right: 10px;">
        测试设置Cookie
      </button>
      <button @click="testLogin" style="padding: 10px 20px; margin-right: 10px;">
        测试登录
      </button>
      <button @click="refreshPage" style="padding: 10px 20px; margin-right: 10px;">
        刷新页面
      </button>
      <button @click="clearAll" style="padding: 10px 20px;">
        清除所有数据
      </button>
    </div>

    <div style="margin: 20px 0; padding: 15px; background: #ffffcc; border-radius: 5px;">
      <h3>测试结果：</h3>
      <pre>{{ testResult }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const tokenFromCookie = ref('')
const documentCookie = ref('')
const localStorageToken = ref('')
const localStorageUser = ref('')
const testResult = ref('')

// 读取所有状态
const refreshStatus = () => {
  // Cookie状态
  const tokenCookie = useCookie('token', {
    httpOnly: false,
    secure: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7
  })
  tokenFromCookie.value = tokenCookie.value || ''
  
  if (process.client) {
    documentCookie.value = document.cookie
    localStorageToken.value = localStorage.getItem('token') || ''
    const userStr = localStorage.getItem('user')
    localStorageUser.value = userStr ? JSON.parse(userStr) : null
  }
}

// 测试设置Cookie
const testSetCookie = () => {
  const testToken = 'test_token_' + Date.now()
  const tokenCookie = useCookie('token', {
    httpOnly: false,
    secure: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7
  })
  tokenCookie.value = testToken
  
  testResult.value = `设置token为: ${testToken}\n`
  testResult.value += `立即读取: ${tokenCookie.value}\n`
  
  if (process.client) {
    // 也尝试原生方式设置
    document.cookie = `token2=${testToken}; path=/; max-age=${60 * 60 * 24 * 7}`
    testResult.value += `document.cookie: ${document.cookie}`
  }
  
  setTimeout(refreshStatus, 100)
}

// 测试登录
const testLogin = async () => {
  testResult.value = '正在测试登录...\n'
  
  try {
    const res = await $fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      body: {
        email: 'newtest@example.com',
        password: 'test123'
      }
    })
    
    if (res.code === 0 && res.data) {
      const token = res.data.tokenValue
      
      // 使用useCookie设置
      const tokenCookie = useCookie('token', {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7
      })
      tokenCookie.value = token
      
      // 同时保存到localStorage
      if (process.client) {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(res.data))
      }
      
      testResult.value += `✅ 登录成功\n`
      testResult.value += `Token: ${token}\n`
      testResult.value += `Cookie设置后: ${tokenCookie.value}\n`
      
      userStore.setUser(res.data, token)
      
      setTimeout(refreshStatus, 100)
    } else {
      testResult.value += `❌ 登录失败: ${res.msg}\n`
    }
  } catch (error) {
    testResult.value += `❌ 错误: ${error.message}\n`
  }
}

// 刷新页面
const refreshPage = () => {
  window.location.reload()
}

// 清除所有数据
const clearAll = () => {
  // 清除cookie
  const tokenCookie = useCookie('token')
  tokenCookie.value = null
  
  // 清除localStorage
  if (process.client) {
    localStorage.clear()
    // 清除所有cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })
  }
  
  // 清除store
  userStore.logout()
  
  testResult.value = '✅ 已清除所有数据'
  setTimeout(refreshStatus, 100)
}

onMounted(() => {
  refreshStatus()
  
  // 显示初始化信息
  testResult.value = '页面加载时的状态：\n'
  testResult.value += `SSR: ${!process.client}\n`
  testResult.value += `Client: ${process.client}\n`
  testResult.value += `UserStore isLoggedIn: ${userStore.isLoggedIn}\n`
})
</script>