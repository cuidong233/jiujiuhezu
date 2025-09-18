import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '首页' }
      },
      // 路由重定向 - 兼容旧路径
      { path: 'product', redirect: '/product/list' },
      { path: 'cdk', redirect: '/product/cdk' },
      { path: 'order', redirect: '/product/order' },
      { path: 'work', redirect: '/customer/work' },
      { path: 'activity', redirect: '/marketing/activity' },
      { path: 'vip', redirect: '/marketing/vip' },
      { path: 'payment/wechat', redirect: '/finance/wechat' },
      { path: 'payment/alipay', redirect: '/finance/alipay' },
      { path: 'payment/binance', redirect: '/finance/binance' },
      { path: 'withdraw', redirect: '/finance/withdraw' },
      { path: 'article', redirect: '/content/article' },
      { path: 'banner', redirect: '/content/banner' },
      { path: 'question', redirect: '/content/question' },
      {
        path: 'system/user',
        name: 'User',
        component: () => import('../views/system/User.vue'),
        meta: { title: '管理员管理' }
      },
      {
        path: 'system/role',
        name: 'Role',
        component: () => import('../views/system/Role.vue'),
        meta: { title: '角色管理' }
      },
      {
        path: 'system/dept',
        name: 'Dept',
        component: () => import('../views/system/Dept.vue'),
        meta: { title: '部门管理' }
      },
      // 商品管理
      {
        path: 'product/list',
        name: 'Product',
        component: () => import('../views/Product.vue'),
        meta: { title: '商品管理' }
      },
      {
        path: 'product/cdk',
        name: 'CDK',
        component: () => import('../views/CDK.vue'),
        meta: { title: 'CDK管理' }
      },
      {
        path: 'product/order',
        name: 'Order',
        component: () => import('../views/Order.vue'),
        meta: { title: '订单管理' }
      },
      // 营销管理
      {
        path: 'marketing/activity',
        name: 'Activity',
        component: () => import('../views/Activity.vue'),
        meta: { title: '活动中心' }
      },
      {
        path: 'marketing/vip',
        name: 'VIP',
        component: () => import('../views/VIP.vue'),
        meta: { title: 'VIP管理' }
      },
      // 客服管理
      {
        path: 'customer/work',
        name: 'Work',
        component: () => import('../views/Work.vue'),
        meta: { title: '工单管理' }
      },
      {
        path: 'config',
        name: 'Config',
        component: () => import('../views/Config.vue'),
        meta: { title: '配置中心' }
      },
      {
        path: 'content/article',
        name: 'Article',
        component: () => import('../views/Article.vue'),
        meta: { title: '文章管理' }
      },
      {
        path: 'content/banner',
        name: 'Banner',
        component: () => import('../views/Banner.vue'),
        meta: { title: '轮播图管理' }
      },
      {
        path: 'content/question',
        name: 'ContentQuestion',
        component: () => import('../views/QuestionSimple.vue'),
        meta: { title: '问题管理' }
      },
      // 财务管理
      {
        path: 'finance/wechat',
        name: 'WechatPayment',
        component: () => import('../views/payment/WechatPayment.vue'),
        meta: { title: '微信支付' }
      },
      {
        path: 'finance/alipay',
        name: 'AlipayPayment',
        component: () => import('../views/payment/AlipayPayment.vue'),
        meta: { title: '支付宝' }
      },
      {
        path: 'finance/binance',
        name: 'BinancePayment',
        component: () => import('../views/binance/Index.vue'),
        meta: { title: '币安支付' }
      },
      {
        path: 'finance/withdraw',
        name: 'Withdraw',
        component: () => import('../views/Withdraw.vue'),
        meta: { title: '提现管理' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 添加路由守卫
router.beforeEach((to, from, next) => {
  console.log('路由跳转:', from.path, '->', to.path)
  
  // 获取token
  const token = localStorage.getItem('admin_token')
  
  // 如果是登录页，直接放行
  if (to.path === '/login') {
    next()
    return
  }
  
  // 如果没有token，跳转到登录页
  if (!token) {
    next('/login')
    return
  }
  
  // 有token，放行
  next()
})

export default router