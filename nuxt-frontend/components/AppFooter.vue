<template>
  <footer class="app-footer">
    <div class="footer-bg">
      <div class="footer-cols">
        <div class="footer-col" v-for="(col, idx) in cols" :key="col.title">
          <div class="footer-title">{{ col.title }}</div>
          <div class="footer-underline"></div>
          <div v-if="col.items && !col.icons" class="footer-items">
            <template v-for="item in col.items" :key="item">
              <button 
                v-if="item === '个人中心'" 
                @click="handleNavClick('/profile')"
                class="footer-item footer-link footer-button"
              >
                {{ item }}
              </button>
              <button 
                v-else-if="item === '我的订单'" 
                @click="handleNavClick('/profile/orders')"
                class="footer-item footer-link footer-button"
              >
                {{ item }}
              </button>
              <button 
                v-else-if="item === '邀请推广'" 
                @click="handleNavClick('/profile/referral')"
                class="footer-item footer-link footer-button"
              >
                {{ item }}
              </button>
              <NuxtLink 
                v-else-if="item === '社区帮助'" 
                to="/community" 
                class="footer-item footer-link"
              >
                {{ item }}
              </NuxtLink>
              <NuxtLink 
                v-else-if="item === '隐私政策'" 
                to="/privacy" 
                class="footer-item footer-link"
              >
                {{ item }}
              </NuxtLink>
              <NuxtLink 
                v-else-if="item === '用户协议'" 
                to="/policy" 
                class="footer-item footer-link"
              >
                {{ item }}
              </NuxtLink>
              <NuxtLink 
                v-else-if="item === '退款政策'" 
                to="/refund" 
                class="footer-item footer-link"
              >
                {{ item }}
              </NuxtLink>
              <NuxtLink 
                v-else-if="item === '免责声明'" 
                to="/disclaimer" 
                class="footer-item footer-link"
              >
                {{ item }}
              </NuxtLink>
              <NuxtLink 
                v-else-if="item === '公司简介'" 
                to="/company" 
                class="footer-item footer-link"
              >
                {{ item }}
              </NuxtLink>
              <NuxtLink 
                v-else-if="item === '我们的使命' || item === '我们的优势'" 
                to="/about-us" 
                class="footer-item footer-link"
              >
                {{ item }}
              </NuxtLink>
              <button 
                v-else-if="item === '加入我们'" 
                @click="openJoinUs" 
                class="footer-item footer-link footer-button"
              >
                {{ item }}
              </button>
              <div v-else class="footer-item">{{ item }}</div>
            </template>
          </div>
          <div v-if="col.icons" class="footer-icons">
            <span v-for="icon in col.icons" :key="icon.label" class="footer-icon" v-html="icon.svg"></span>
          </div>
          <div v-if="col.extra && !col.partner" class="footer-extra">{{ col.extra }}</div>

          <!-- 合作伙伴板块合并到关注我们下方 -->
          <template v-if="col.partner">
            <div class="footer-partner-block">
              <div class="footer-title">合作伙伴</div>
              <div class="footer-underline"></div>
              <div class="footer-partner-list">支付宝 | 顺丰速运 | 京东物流</div>
            </div>
          </template>
        </div>
      </div>
      <div class="footer-bottom">
        © 2019-2025 凡图拉 | 云南凡图拉科技有限公司 | 滇ICP备 2025060486号-1
      </div>
    </div>
    
    <!-- 加入我们弹窗 -->
    <JoinUsModal :visible="showJoinUs" @close="closeJoinUs" />
    
    <!-- 登录注册弹窗 -->
    <LoginRegisterModal :visible="showLoginModal" @close="closeLoginModal" />
  </footer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import LoginRegisterModal from './LoginRegisterModal.vue'

const showJoinUs = ref(false)
const showLoginModal = ref(false)
const userStore = useUserStore()

function openJoinUs() {
  showJoinUs.value = true
}

function closeJoinUs() {
  showJoinUs.value = false
}

function closeLoginModal() {
  showLoginModal.value = false
}

// 处理需要登录的导航点击
function handleNavClick(route: string) {
  if (userStore.isLoggedIn) {
    // 已登录，直接跳转
    navigateTo(route)
  } else {
    // 未登录，显示登录弹窗
    showLoginModal.value = true
  }
}

// 监听登录状态变化，登录成功后自动关闭弹窗
watch(() => userStore.isLoggedIn, (newValue) => {
  if (newValue && showLoginModal.value) {
    // 用户登录成功，关闭登录弹窗
    showLoginModal.value = false
  }
})

const cols = [
  {
    title: '功能导航',
    items: ['个人中心', '我的订单', '邀请推广', '社区帮助']
  },
  {
    title: '条款与政策',
    items: ['隐私政策', '用户协议', '退款政策', '免责声明']
  },
  {
    title: '关于我们',
    items: ['公司简介', '我们的使命', '我们的优势', '加入我们']
  },
  {
    title: '帮助支持',
    items: ['联系我们', '商务合作', '发送邮件']
  },
  {
    title: '关注我们',
    extra: '获取最新促销信息和独家优惠',
    icons: [
      { label: '微信', svg: `<img src="/images/link1.png" alt="link1" style="width:24px;height:24px;" />` },
      { label: '微博', svg: `<img src="/images/link2.png" alt="link2" style="width:24px;height:24px;" />` },
      { label: '订阅', svg: `<img src="/images/link3.png" alt="link3" style="width:24px;height:24px;" />` },
      { label: '抖音', svg: `<img src="/images/link4.png" alt="link4" style="width:24px;height:24px;" />` }
    ],
    partner: true // 标记此列下方有合作伙伴
  }
]
</script>

<style scoped>
.footer-root {
  width: 1920px;
  height: 422px;
  background: #fff;
  border-radius: 0;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  box-sizing: border-box;
}
.footer-bg {
  width: 1211px;
  max-width: 1211px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 48px;
}
.footer-cols {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 0px;
}
.footer-col {
  flex: 1;
  min-width: 110px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.footer-title {
  font-family: 'Noto Sans SC', 'PingFang SC', sans-serif;
  font-weight: bold;
  font-size: 18px;
  color: #4B4B4B;
  line-height: 29px;
  margin-bottom: 2px;
  text-align: left;
  position: relative;
}
.footer-underline {
  width: 36px;
  height: 3px;
  background: #FF7A45;
  border-radius: 2px;
  margin-bottom: 8px;
}
.footer-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.footer-item {
  font-family: 'Noto Sans SC', 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 16px;
  color: #848484;
  line-height: 25.83px;
  text-align: left;
  margin-bottom: 2px;
}

.footer-link {
  text-decoration: none;
  cursor: pointer;
  transition: font-weight 0.2s ease, color 0.2s ease;
}

.footer-link:hover {
  font-weight: bold;
  color: #4B4B4B;
}

.footer-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
}

.footer-extra {
  font-family: 'Noto Sans SC', 'PingFang SC', sans-serif;
  font-size: 16px;
  color: #848484;
  line-height: 25.83px;
  margin-bottom: 8px;
}
.footer-icons {
  display: flex;
  gap: 16px;
  margin: 8px 0 0 0;
}
.footer-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.footer-partner-block {
  margin-top: 32px;
}
.footer-partner-list {
  font-family: 'Noto Sans SC', 'PingFang SC', sans-serif;
  font-size: 16px;
  color: #848484;
  line-height: 25.83px;
  margin-top: 8px;
}
.footer-bottom {
  width: 100%;
  text-align: center;
  color: #b0b0b0;
  font-size: 15px;
  margin-top: 24px;
}
.app-footer {
  background: linear-gradient(135deg, #FFD4BF 0%, #D3F7FF 100%);
  margin-top: auto;
  flex-shrink: 0;
}
</style> 