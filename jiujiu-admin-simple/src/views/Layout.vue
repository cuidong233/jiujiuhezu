<template>
  <el-container class="layout-container">
    <el-aside width="200px" class="aside">
      <div class="logo">久久合租管理系统</div>
      <el-menu
        :default-active="activeMenu"
        router
        :unique-opened="true"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        
        <el-sub-menu index="product-manage">
          <template #title>
            <el-icon><ShoppingBag /></el-icon>
            <span>商品管理</span>
          </template>
          <el-menu-item index="/product/list">
            <el-icon><Goods /></el-icon>
            商品管理
          </el-menu-item>
          <el-menu-item index="/product/cdk">
            <el-icon><Key /></el-icon>
            CDK管理
          </el-menu-item>
          <el-menu-item index="/product/order">
            <el-icon><List /></el-icon>
            订单管理
          </el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="marketing">
          <template #title>
            <el-icon><Present /></el-icon>
            <span>营销管理</span>
          </template>
          <el-menu-item index="/marketing/activity">
            <el-icon><Ticket /></el-icon>
            活动中心
          </el-menu-item>
          <el-menu-item index="/marketing/vip">
            <el-icon><Trophy /></el-icon>
            VIP管理
          </el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="content">
          <template #title>
            <el-icon><Management /></el-icon>
            <span>内容管理</span>
          </template>
          <el-menu-item index="/content/article">
            <el-icon><Document /></el-icon>
            文章管理
          </el-menu-item>
          <el-menu-item index="/content/banner">
            <el-icon><Picture /></el-icon>
            轮播图管理
          </el-menu-item>
          <el-menu-item index="/content/question">
            <el-icon><QuestionFilled /></el-icon>
            问题管理
          </el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="customer">
          <template #title>
            <el-icon><Service /></el-icon>
            <span>客服管理</span>
          </template>
          <el-menu-item index="/customer/work">
            <el-icon><Tickets /></el-icon>
            工单管理
          </el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="finance">
          <template #title>
            <el-icon><CreditCard /></el-icon>
            <span>财务管理</span>
          </template>
          <el-menu-item index="/finance/wechat">
            <el-icon><ChatDotRound /></el-icon>
            微信支付
          </el-menu-item>
          <el-menu-item index="/finance/alipay">
            <el-icon><Wallet /></el-icon>
            支付宝
          </el-menu-item>
          <el-menu-item index="/finance/binance">
            <el-icon><Coin /></el-icon>
            币安支付
          </el-menu-item>
          <el-menu-item index="/finance/withdraw">
            <el-icon><Money /></el-icon>
            提现管理
          </el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/system/user">
            <el-icon><User /></el-icon>
            管理员管理
          </el-menu-item>
          <el-menu-item index="/system/role">
            <el-icon><UserFilled /></el-icon>
            角色管理
          </el-menu-item>
          <el-menu-item index="/system/dept">
            <el-icon><OfficeBuilding /></el-icon>
            部门管理
          </el-menu-item>
        </el-sub-menu>
        
        <el-menu-item index="/config">
          <el-icon><Tools /></el-icon>
          <span>基础设置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentTitle">{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-icon><UserFilled /></el-icon>
              {{ userInfo.name }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  HomeFilled,
  Setting,
  ShoppingBag,
  Goods,
  Key,
  Tickets,
  Ticket,
  List,
  Van,
  Present,
  Tools,
  Document,
  Picture,
  Management,
  Service,
  Coin,
  Trophy,
  Wallet,
  Money,
  QuestionFilled,
  User,
  UserFilled,
  OfficeBuilding,
  ArrowDown,
  CreditCard,
  ChatDotRound
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => route.path)
const currentTitle = computed(() => route.meta?.title)

const userInfo = ref(JSON.parse(localStorage.getItem('user') || '{}'))

const handleLogout = async () => {
  await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  ElMessage.success('退出成功')
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.aside {
  background-color: var(--sidebar-bg);
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.1);
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  background-color: var(--card-bg);
  box-shadow: var(--shadow-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 5px;
}

.main {
  background-color: var(--bg-color);
  padding: 0;
  overflow-y: auto;
}
</style>