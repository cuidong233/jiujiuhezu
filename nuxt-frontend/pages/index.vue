<template>
  <div class="home-page">
    <AppHeader />
    <!-- 页面内容 -->
    
    <!-- 轮播图区域 -->
    <BannerSection :banners="banners" />

    <!-- 商品区（只保留一个） -->
    <GoodsSection :goodsList="hotGoods" />

    <!-- 常见问题区域 -->
    <FaqSection />

    <!-- 关于我们区域 -->
    <AboutSection />

    <!-- 页脚 -->
    <AppFooter />
    
    <!-- 登录注册弹窗已移至全局app.vue中 -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useModalStore } from '@/stores/modal'
import { commonApi } from '@/api/common'
import { goodsApi } from '@/api/goods'
import type { Banner, Goods } from '@/types/api'
import AppHeader from '@/components/AppHeader.vue'

// SEO配置
useHead({
  title: '凡图拉 - 优质商品平台',
  meta: [
    { name: 'description', content: '凡图拉提供优质商品和服务，精选各类商品，确保品质与价格的完美平衡。' },
    { name: 'keywords', content: '凡图拉,商品,购物,电商,优质商品' },
    { property: 'og:title', content: '凡图拉 - 优质商品平台' },
    { property: 'og:description', content: '凡图拉提供优质商品和服务，精选各类商品，确保品质与价格的完美平衡。' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://fantula.com' }
  ]
})

const banners = ref([
  {
    id: 1,
    image: '/images/banner.png',
    link: '',
    title: '凡图拉 - 优质商品平台'
  }
])
const hotGoods = ref<Goods[]>([])

const fetchHomeData = async () => {
  try {
    // 获取轮播图数据
    const bannerRes = await commonApi.getBannerList()
    if (bannerRes && bannerRes.success && bannerRes.data) {
      // 转换数据格式：img -> image
      banners.value = bannerRes.data.map(item => ({
        id: item.id,
        image: item.img.startsWith('http') ? item.img : `${window.location.origin}${item.img}`,
        title: item.title || '轮播图',
        link: ''
      }))
    }
    
    // 获取商品数据（不限定热门，显示所有商品）
    const goodsRes = await goodsApi.getGoodsList({ limit: 100, page: 1 })
    if (goodsRes && goodsRes.success && goodsRes.data) {
      // 处理分页数据或直接数据
      hotGoods.value = goodsRes.data.list || goodsRes.data
    }
  } catch (error) {
    console.error('首页数据获取失败:', error)
  }
}
onMounted(fetchHomeData)

const modal = useModalStore()
</script>

<style scoped>
.home-page {
  background: #f8f9fa;
}
</style> 