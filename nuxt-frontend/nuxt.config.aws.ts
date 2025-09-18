// AWS部署专用配置
export default defineNuxtConfig({
  compatibilityDate: '2025-07-01',
  devtools: { enabled: false },
  
  modules: [
    '@pinia/nuxt',
    '@nuxt/image',
  ],

  components: true,
  
  app: {
    head: {
      title: '凡图拉 - 优质商品平台',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '凡图拉 - 提供优质商品和服务的综合性平台' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ]
    }
  },
  
  // 运行时配置 - 使用环境变量或默认值
  runtimeConfig: {
    public: {
      // 动态获取API地址
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001',
      appName: '凡图拉',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  },
  
  // Nitro配置 - 用于生产环境
  nitro: {
    devProxy: {
      '/api': {
        target: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001',
        changeOrigin: true
      },
      '/uploads': {
        target: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  
  // 构建配置
  build: {
    transpile: ['axios', 'element-plus/es']
  },
  
  typescript: {
    strict: false,
    typeCheck: false
  },

  // SSR配置
  ssr: true,
  
  // 图片优化配置
  image: {
    quality: 80,
    format: ['webp', 'jpeg'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    }
  }
})