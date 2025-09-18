<template>
  <div class="about-us-page">
    <AppHeader />
    <!-- 页面内容区域 -->
    <div class="page-content">
              <div class="content-container">
          <div class="header-section">
            <h1 class="main-title">关于我们</h1>
            <h2 class="sub-title">我们的使命、我们的优势</h2>
          </div>
          
          <div class="content-section">
            <div class="mission-section">
              <h3 class="section-title">我们的使命</h3>
              <div class="section-content">
                <p class="content-paragraph">
                  在全球数字化浪潮推动下，人们对跨境消费与虚拟商品的需求日益增长，而支付渠道、平台限制、地域门槛却仍然存在。凡图拉的使命，就是要打破这些壁垒，让数字服务触手可及、轻松使用。我们致力于打造一个安全、灵活、无需实名即可使用的数字商品平台，帮助用户轻松获取海外订阅、虚拟会员、礼品卡与数字支付服务。无论你身处何地，只需注册邮箱账户，即可进入一个稳定高效的虚拟消费生态。未来，我们希望成为华语用户首选的全球数字商品平台，让每一笔代充、每一张礼品卡、每一次交易，都变得简单可靠、有温度。
                </p>
              </div>
            </div>
            
            <div class="advantages-section">
              <h3 class="section-title">我们的优势</h3>
              <div class="advantages-list">
                <div class="advantage-item">
                  <div class="advantage-icon">💎</div>
                  <div class="advantage-content">
                    <h4 class="advantage-title">五年以上稳定运营经验</h4>
                    <p class="advantage-desc">
                      自2019年起稳步发展，凡图拉拥有成熟的运营体系和用户信任基础，是市场中为数不多持续运营超过五年的数字商品平台。
                    </p>
                  </div>
                </div>
                
                <div class="advantage-item">
                  <div class="advantage-icon">💎</div>
                  <div class="advantage-content">
                    <h4 class="advantage-title">极简账户机制，无需实名注册</h4>
                    <p class="advantage-desc">
                      平台仅需邮箱注册登录，无需手机号、无需实名验证，轻松开启安全交易体验，深受用户欢迎。
                    </p>
                  </div>
                </div>
                
                <div class="advantage-item">
                  <div class="advantage-icon">💎</div>
                  <div class="advantage-content">
                    <h4 class="advantage-title">支持多种支付方式与退款机制</h4>
                    <p class="advantage-desc">
                      支持支付宝、数字钱包、USDT 等多渠道支付，支持平台钱包余额退款（不支持原路退回），满足灵活的用户场景。
                    </p>
                  </div>
                </div>
                
                <div class="advantage-item">
                  <div class="advantage-icon">💎</div>
                  <div class="advantage-content">
                    <h4 class="advantage-title">代冲+礼品卡+虚拟支付卡 多业务融合</h4>
                    <p class="advantage-desc">
                      从代充代付业务出发，逐步拓展至麦当劳、Netflix 等主流平台的礼品卡发售，以及万事达等虚拟卡服务，打造多元化数字服务平台。
                    </p>
                  </div>
                </div>
                
                <div class="advantage-item">
                  <div class="advantage-icon">💎</div>
                  <div class="advantage-content">
                    <h4 class="advantage-title">自动发货+双线售后体系</h4>
                    <p class="advantage-desc">
                      平台支持自动发货系统，并提供微信、Telegram、WhatsApp 客服支持，实现全天候响应与人工售后处理。
                    </p>
                  </div>
                </div>
                
                <div class="advantage-item">
                  <div class="advantage-icon">💎</div>
                  <div class="advantage-content">
                    <h4 class="advantage-title">品牌定位清晰且合规意识强</h4>
                    <p class="advantage-desc">
                      商品页面均采用模糊展示方式，规避高风险关键词与品牌敏感度，确保平台在运营中的合法性与可持续性。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>

    <!-- 页脚 -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
// SEO配置
useHead({
  title: '关于我们 - 凡图拉',
  meta: [
    { name: 'description', content: '了解凡图拉的使命愿景和核心优势，我们致力于为用户提供优质服务。' },
    { name: 'keywords', content: '凡图拉,关于我们,我们的使命,我们的优势,企业愿景' }
  ]
})
</script>

<style scoped>
.about-us-page {
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.page-content {
  flex: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 60px 20px;
}

.content-container {
  width: 100%;
  max-width: 1200px;
  background: white;
  border-radius: 16px;
  padding: 60px 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin: 0 auto;
}

.header-section {
  text-align: center;
  margin-bottom: 50px;
}

.main-title {
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 700;
  font-size: 36px;
  color: #4A90E2;
  margin-bottom: 10px;
  letter-spacing: 1px;
}

.sub-title {
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 400;
  font-size: 20px;
  color: #888888;
  margin: 0;
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 50px;
}

.mission-section {
  background: #E6F7FF;
  padding: 30px;
  border-radius: 16px;
}

.advantages-section {
  background: #F8F9FA;
  padding: 30px;
  border-radius: 16px;
}

.section-title {
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 600;
  font-size: 24px;
  color: #1A3A6C;
  margin-bottom: 25px;
  padding-bottom: 0;
  border-bottom: none;
}

.section-content {
  margin-top: 20px;
}

.content-paragraph {
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 400;
  font-size: 16px;
  color: #555555;
  line-height: 1.8;
  margin: 0;
  text-align: justify;
  text-justify: inter-ideograph;
}

.advantages-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.advantage-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.advantage-icon {
  font-size: 20px;
  min-width: 24px;
  margin-top: 2px;
}

.advantage-content {
  flex: 1;
}

.advantage-title {
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 600;
  font-size: 18px;
  color: #1A3A6C;
  margin: 0 0 10px 0;
}

.advantage-desc {
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 400;
  font-size: 15px;
  color: #666666;
  line-height: 1.6;
  margin: 0;
  text-align: justify;
  text-justify: inter-ideograph;
}
</style> 