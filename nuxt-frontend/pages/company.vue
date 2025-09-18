<template>
  <div class="company-page">
    <!-- 顶部导航 -->
    <AppHeader />

    <!-- 页面内容区域 -->
    <div class="page-content">
      <div class="content-container">
        <div class="header-section">
          <h1 class="main-title">关于我们</h1>
          <h2 class="sub-title">公司简介</h2>
        </div>
        
        <div class="content-section">
          <div class="content-blocks-container">
            <div class="highlighted-block top-block">
              <p class="content-paragraph highlighted-merged">
                凡图拉成立于2019年，是一家专注于数字商品充值、礼品卡服务与虚拟支付卡解决方案的多元化数字平台。自创立以来，我们始终秉持「简单实用」的产品理念，为全球用户提供快捷、安全、稳定的数字消费体验。
              </p>
              
              <p class="content-paragraph highlighted-merged">
                在最初的几年中，凡图拉仅由几位热爱数字内容的技术成员维护，主要以人工处理海外平台充值订单为主。面对复杂的支付环境和不断变化的内容平台政策，我们不断进行系统升级与流程优化。到2021年，凡图拉上线了自研订单管理系统和钱包功能，正式步入平台化运营。
              </p>
            </div>
            
            <div class="white-block">
              <p class="content-paragraph white-merged">
                截至目前，凡图拉已稳定运行超过五年，累计注册用户突破10,000人，服务范围覆盖30多个国家和地区。我们支持用户以加密货币、数字钱包、支付宝等多种方式充值余额，并通过平台进行代充、代付、兑换礼品卡等多项操作。
              </p>
              
              <p class="content-paragraph white-merged">
                我们的核心业务包括但不限于：<br/>
                • 海外内容平台会员充值与代付服务，摇醒化呈现，保障用户认知与合规<br/>
                • 数字礼品卡发售与兑换服务，如奢当劳卡、Netflix礼品卡等<br/>
                • 虚拟支付卡服务，如万事达虚拟卡，用于海外订阅与购物<br/>
                • 平台钱包余额管理与自动退款系统，用户追款权退至平台钱包，暂不支持提现
              </p>
            </div>
            
            <div class="highlighted-block bottom-block">
              <p class="content-paragraph highlighted-merged">
                凡图拉目前采用邮箱注册 + 验证码登录机制，无需实名或手机号，降低了使用门槛。我们支持全自动发货与微信/Telegram/WhatsApp客服售后体系，确保用户下单无忧、售后有保。
              </p>
              
              <p class="content-paragraph highlighted-merged">
                随着全球数字化消费的持续增长，凡图拉正加快布局数字礼品卡市场与虚拟支付卡业务，致力于成为华语用户首选的跨境数字商品服务平台。我们将不断扩展服务品类、提升平台稳定性，并探索全球节点部署，真正实现"数字生活，无国界"。
              </p>
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
// SEO配置
useHead({
  title: '公司简介 - 凡图拉',
  meta: [
    { name: 'description', content: '了解凡图拉公司的发展历程、企业文化和核心价值观。' },
    { name: 'keywords', content: '凡图拉,公司简介,企业介绍,关于我们' }
  ]
})
</script>

<style scoped>
.company-page {
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
  width: 760px;
  height: 909px;
  background: #F8F9FA;
  padding: 40px;
  border-radius: 0px 0px 0px 0px;
  line-height: 1.8;
  margin: 0 auto;
  box-sizing: border-box;
  overflow-y: auto;
}

.content-paragraph {
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 400;
  font-size: 16px;
  color: #555555;
  line-height: 1.8;
  margin-bottom: 20px;
  text-align: justify;
  text-justify: inter-ideograph;
}

.content-paragraph:last-child {
  margin-bottom: 0;
}

.content-blocks-container {
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.highlighted-block {
  background: #E6F7FF;
  padding: 15px 20px;
  margin: 0;
}

.top-block {
  border-radius: 8px 8px 0 0;
}

.bottom-block {
  border-radius: 0 0 8px 8px;
}

.white-block {
  background: #FFFFFF;
  padding: 15px 20px;
  margin: 0;
  border-left: 1px solid #E6F7FF;
  border-right: 1px solid #E6F7FF;
}

.content-paragraph.highlighted-merged,
.content-paragraph.white-merged {
  background: transparent;
  padding: 0;
  margin-bottom: 20px;
}

.content-paragraph.highlighted-merged:last-child,
.content-paragraph.white-merged:last-child {
  margin-bottom: 0;
}
</style> 