import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import axios from 'axios'

import App from './App.vue'
import router from './router'
import './style.css'

// 导入通用组件
import { DataTable, FormDialog, StatusTag, StatCard } from './components/common'

// 创建应用实例
const app = createApp(App)

// 创建Pinia实例
const pinia = createPinia()
app.use(pinia)

// 导入stores
import { useAuthStore } from './stores/auth'
import { useCommonStore } from './stores/common'
import ErrorHandler from './utils/errorHandler'

// 配置axios
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002'
axios.defaults.timeout = 10000

// 请求拦截器
axios.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    
    // 添加认证token
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    
    // 添加请求ID用于追踪
    config.headers['x-request-id'] = Date.now().toString()
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 统一错误处理
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      router.push('/login')
    }
    
    // 使用错误处理器
    ErrorHandler.handle(error, {
      showMessage: true,
      context: 'API请求'
    })
    
    return Promise.reject(error)
  }
)

// 使用Element Plus
app.use(ElementPlus, {
  locale: zhCn,
})

// 注册所有Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册通用组件
app.component('DataTable', DataTable)
app.component('FormDialog', FormDialog)
app.component('StatusTag', StatusTag)
app.component('StatCard', StatCard)

// 使用路由
app.use(router)

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue全局错误:', err, info)
  ErrorHandler.handle(err, {
    showMessage: true,
    context: `Vue组件: ${vm?.$options.name || 'Unknown'}`
  })
}

// 全局警告处理
app.config.warnHandler = (msg, vm, trace) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn('Vue警告:', msg, trace)
  }
}

// 全局属性
app.config.globalProperties.$http = axios
app.config.globalProperties.$errorHandler = ErrorHandler

// 添加路由调试
router.isReady().then(() => {
  console.log('✅ 路由已准备就绪')
  if (process.env.NODE_ENV === 'development') {
    console.log('所有路由:', router.getRoutes().map(r => r.path))
  }
})

// 初始化应用状态
const initApp = async () => {
  try {
    const authStore = useAuthStore()
    const commonStore = useCommonStore()
    
    // 初始化通用状态
    commonStore.init()
    
    // 初始化认证状态
    await authStore.init()
    
    console.log('✅ 应用初始化完成')
  } catch (error) {
    console.error('❌ 应用初始化失败:', error)
    ErrorHandler.handle(error, {
      showMessage: true,
      context: '应用初始化'
    })
  }
}

// 挂载应用并初始化
app.mount('#app')
initApp()
