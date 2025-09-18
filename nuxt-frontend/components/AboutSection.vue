<template>
  <section class="about-section">
    <div class="about-bg">
      <div class="about-title">关于我们</div>
      <div class="about-subtitle">提供高品质优质服务</div>
      <div class="about-cards">
        <div class="about-card" v-for="item in cards" :key="item.title">
          <div class="about-icon">
            <img :src="item.icon" alt="icon" width="48" height="48" />
          </div>
          <div class="about-card-title">{{ item.title }}</div>
          <div class="about-card-desc">{{ item.desc }}</div>
        </div>
      </div>
      <button class="about-more-btn">查看更多 →</button>
    </div>
  </section>
</template>

<script setup lang="ts">
const cards = [
  {
    icon: '/images/about1.png',
    title: '大团队开发',
    desc: '所有商品均为团队开发，品质保障'
  },
  {
    icon: '/images/about2.png',
    title: '人工客服服务',
    desc: '提供完善的售后服务，购物无忧'
  },
  {
    icon: '/images/about3.png',
    title: '大平台更放心',
    desc: '十年开发经验，服务千万用户'
  },
  {
    icon: '/images/about4.png',
    title: '全网矩阵',
    desc: '覆盖全国平台，快速送达'
  }
]
</script>

<style scoped>
.about-section {
  width: 1920px;
  height: 663px;
  background: linear-gradient(315deg, #FFD4BF 0%, #D3F7FF 100%);
  box-shadow: inset 0px 0px 2px 0px rgba(255,255,255,0.7), inset 0px 1px 1px 0px rgba(255,255,255,0.5), inset 0px 0px 15px 0px rgba(255,255,255,0.2), 0px 4px 27px 0px rgba(255,255,255,0.2);
  border-radius: 0px 0px 0px 0px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}
.about-inner {
  width: 1211px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.about-bg {
  width: 100%;
  max-width: 1211px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.about-title {
  font-size: 38px;
  font-weight: bold;
  color: #222;
  margin-top: 48px;
  margin-bottom: 12px;
  text-align: center;
}
.about-subtitle {
  font-size: 20px;
  color: #888;
  margin-bottom: 48px;
  text-align: center;
}
.about-cards {
  display: flex;
  gap: 48px;
  justify-content: center;
  margin-bottom: 64px;
}
.about-card {
  width: 280px;
  height: 192px;
  background: #fff;
  border-radius: 30px;
  box-shadow: 0px 4px 12px 0px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
}
.about-icon {
  margin-bottom: 18px;
}
.about-card-title {
  font-size: 20px;
  font-weight: bold;
  color: #222;
  margin-bottom: 8px;
  text-align: center;
}
.about-card-desc {
  font-size: 15px;
  color: #888;
  text-align: center;
}
.about-more-btn {
  margin-top: 0;
  margin-bottom: 32px;
  width: 180px;
  height: 48px;
  background: #fff;
  border-radius: 24px;
  border: none;
  font-size: 20px;
  color: #222;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: background 0.2s;
  display: block;
  margin-left: auto;
  margin-right: auto;
}
.about-more-btn:hover {
  background: #f5f5f5;
}
</style> 