<template>
  <div class="dashboard">
    <!-- 快捷操作栏 -->
    <el-row :gutter="20" class="quick-actions">
      <el-col :span="24">
        <el-card>
          <div class="action-buttons">
            <el-button size="large" @click="handleOrder">
              <el-icon><ShoppingCart /></el-icon>
              新建订单
            </el-button>
            <el-button size="large" @click="handleProduct">
              <el-icon><ShoppingBag /></el-icon>
              商品管理
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4" v-for="item in statCards" :key="item.title">
        <el-card class="stat-card" :style="{ background: item.color }">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40"><component :is="item.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">{{ item.title }}</div>
              <div class="stat-value">{{ item.value }}</div>
              <div class="stat-trend">
                <span :class="item.trend > 0 ? 'up' : 'down'">
                  {{ item.trend > 0 ? '↑' : '↓' }} {{ Math.abs(item.trend) }}%
                </span>
                <span class="trend-text">较昨日</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>收入趋势</span>
              <el-radio-group v-model="revenueRange" size="small" @change="updateRevenueChart">
                <el-radio-button label="week">近7天</el-radio-button>
                <el-radio-button label="month">近30天</el-radio-button>
                <el-radio-button label="year">近一年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <v-chart class="chart" :option="revenueChartOption" autoresize />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>待处理订单</span>
              <el-tag type="warning">{{ pendingOrdersData.total }}</el-tag>
            </div>
          </template>
          <v-chart class="chart" :option="pendingOrdersOption" autoresize />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>实时订单</span>
              <el-tag type="success">实时更新</el-tag>
            </div>
          </template>
          <v-chart class="chart" :option="realtimeOrderOption" autoresize />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span>支付方式统计</span>
          </template>
          <v-chart class="chart" :option="paymentMethodOption" autoresize />
        </el-card>
      </el-col>
    </el-row>

    <!-- 实时数据表格 -->
    <el-card class="data-card">
      <template #header>
        <div class="chart-header">
          <span>最新交易</span>
          <el-button type="text" @click="refreshTransactions">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      <el-table :data="transactions" style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="user" label="用户" />
        <el-table-column prop="amount" label="金额">
          <template #default="scope">
            <span style="color: #67c23a; font-weight: bold">¥{{ scope.row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'recharge' ? 'success' : 'primary'">
              {{ scope.row.type === 'recharge' ? '充值' : '消费' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="method" label="支付方式">
          <template #default="scope">
            <el-tag>{{ getPaymentMethodLabel(scope.row.method) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="时间" width="180">
          <template #default="scope">
            {{ formatTime(scope.row.time) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart, GaugeChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent
} from 'echarts/components'
import {
  Wallet,
  WalletFilled,
  User,
  ShoppingCart,
  ShoppingBag,
  TrendCharts,
  Refresh,
  Coin
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()

// 注册ECharts组件
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  GaugeChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent
])

// API基础URL
const API_BASE_URL = 'http://localhost:3002/api'

// 获取token
const getToken = () => {
  return localStorage.getItem('token') || ''
}

// axios实例配置
const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => response.data,
  error => {
    // 暂时不处理401错误的跳转，避免登录循环
    if (error.response?.status === 401) {
      console.warn('API请求需要认证')
    } else if (error.response) {
      console.error('API请求失败:', error.response.data?.msg || error.message)
    }
    return Promise.reject(error)
  }
)

// 统计卡片数据
const statCards = ref([
  {
    title: '总收入',
    value: '¥0',
    trend: 0,
    icon: Wallet,
    color: '#5856d6'
  },
  {
    title: '今日收入',
    value: '¥0',
    trend: 0,
    icon: Wallet,
    color: '#5856d6'
  },
  {
    title: '本月收入',
    value: '¥0',
    trend: 0,
    icon: TrendCharts,
    color: '#5856d6'
  },
  {
    title: '新增用户',
    value: '0',
    trend: 0,
    icon: User,
    color: '#5856d6'
  },
  {
    title: '今日订单',
    value: '0',
    trend: 0,
    icon: ShoppingCart,
    color: '#5856d6'
  },
  {
    title: '活跃用户',
    value: '0',
    trend: 0,
    icon: TrendCharts,
    color: '#5856d6'
  }
])

// 收入趋势图
const revenueRange = ref('week')
const revenueChartOption = ref({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    }
  },
  legend: {
    data: ['收入', '订单数'],
    top: 10
  },
  grid: {
    left: 80,
    right: 80,
    bottom: 60,
    top: 60,
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: []
  },
  yAxis: [
    {
      type: 'value',
      name: '收入(元)',
      nameTextStyle: {
        padding: [0, 0, 0, 20]
      },
      axisLabel: {
        formatter: '¥{value}',
        margin: 12
      }
    },
    {
      type: 'value',
      name: '订单数',
      nameTextStyle: {
        padding: [0, 20, 0, 0]
      },
      axisLabel: {
        formatter: '{value}',
        margin: 12
      }
    }
  ],
  series: [
    {
      name: '收入',
      type: 'line',
      smooth: true,
      itemStyle: {
        color: '#5470c6'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(84, 112, 198, 0.5)' },
            { offset: 1, color: 'rgba(84, 112, 198, 0)' }
          ]
        }
      },
      data: []
    },
    {
      name: '订单数',
      type: 'line',
      smooth: true,
      yAxisIndex: 1,
      itemStyle: {
        color: '#91cc75'
      },
      data: []
    }
  ]
})

// 待处理订单饼图
const pendingOrdersData = ref({
  total: 0,
  pendingModification: 0,
  unshipped: 0,
  pendingReceipt: 0,
  breakdown: []
})

const pendingOrdersOption = ref({
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      name: '待处理订单',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: []
    }
  ]
})

// 实时订单仪表盘
const realtimeOrderOption = ref({
  tooltip: {
    formatter: '{a} <br/>{b} : {c}%'
  },
  series: [
    {
      name: '完成率',
      type: 'gauge',
      progress: {
        show: true,
        width: 18
      },
      axisLine: {
        lineStyle: {
          width: 18
        }
      },
      axisTick: {
        show: false
      },
      splitLine: {
        length: 15,
        lineStyle: {
          width: 2,
          color: '#999'
        }
      },
      axisLabel: {
        distance: 25,
        color: '#999',
        fontSize: 12
      },
      anchor: {
        show: true,
        showAbove: true,
        size: 25,
        itemStyle: {
          borderWidth: 10
        }
      },
      title: {
        show: false
      },
      detail: {
        valueAnimation: true,
        fontSize: 40,
        offsetCenter: [0, '70%'],
        formatter: '{value}%'
      },
      data: [
        {
          value: 0,
          name: '订单完成率'
        }
      ]
    }
  ]
})

// 支付方式统计
const paymentMethodOption = ref({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    left: 60,
    right: 60,
    bottom: 40,
    top: 40,
    containLabel: true
  },
  xAxis: {
    type: 'value'
  },
  yAxis: {
    type: 'category',
    data: []
  },
  series: [
    {
      name: '使用次数',
      type: 'bar',
      data: [],
      label: {
        show: true,
        position: 'right'
      }
    }
  ]
})

// 最新交易数据
const transactions = ref([])

// 定时器
let timer = null
let dataRefreshTimer = null

// 加载统计数据
const loadDashboardStats = async () => {
  try {
    const response = await request.get('/dashboard/stats')
    if (response.code === 0) {
      const data = response.data
      
      // 更新统计卡片
      // 总收入
      if (data.totalRevenue) {
        statCards.value[0].value = `¥${parseFloat(data.totalRevenue.value).toLocaleString()}`
        statCards.value[0].trend = data.totalRevenue.trend
      }
      
      // 今日收入
      statCards.value[1].value = `¥${parseFloat(data.todayRevenue.value).toLocaleString()}`
      statCards.value[1].trend = data.todayRevenue.trend
      
      // 本月收入
      if (data.thisMonthRevenue) {
        statCards.value[2].value = `¥${parseFloat(data.thisMonthRevenue.value).toLocaleString()}`
        statCards.value[2].trend = data.thisMonthRevenue.trend
      }
      
      // 新增用户
      statCards.value[3].value = data.newUsers.value.toLocaleString()
      statCards.value[3].trend = data.newUsers.trend
      
      // 今日订单
      statCards.value[4].value = data.todayOrders.value.toLocaleString()
      statCards.value[4].trend = data.todayOrders.trend
      
      // 活跃用户
      statCards.value[5].value = data.activeUsers.value.toLocaleString()
      statCards.value[5].trend = data.activeUsers.trend
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载收入趋势
const loadRevenueTrend = async () => {
  try {
    const response = await request.get(`/dashboard/revenue-trend?range=${revenueRange.value}`)
    if (response.code === 0) {
      const data = response.data
      const dates = []
      const revenues = []
      const orders = []
      
      data.forEach(item => {
        dates.push(item.date)
        revenues.push(item.revenue)
        orders.push(item.orders)
      })
      
      revenueChartOption.value.xAxis.data = dates
      revenueChartOption.value.series[0].data = revenues
      revenueChartOption.value.series[1].data = orders
    }
  } catch (error) {
    console.error('加载收入趋势失败:', error)
  }
}

// 加载待处理订单统计
const loadPendingOrders = async () => {
  try {
    const response = await request.get('/dashboard/pending-orders')
    if (response.code === 0) {
      const data = response.data
      pendingOrdersData.value = data
      
      const chartData = data.breakdown.map(item => ({
        value: item.value,
        name: item.name,
        itemStyle: { 
          color: getPendingOrderColor(item.name) 
        }
      })).filter(item => item.value > 0) // 只显示有数据的项
      
      // 如果没有待处理订单，显示一个提示
      if (chartData.length === 0) {
        chartData.push({
          value: 1,
          name: '暂无待处理',
          itemStyle: { color: '#e0e0e0' }
        })
      }
      
      pendingOrdersOption.value.series[0].data = chartData
    }
  } catch (error) {
    console.error('加载待处理订单失败:', error)
  }
}

// 加载支付方式统计
const loadPaymentMethods = async () => {
  try {
    const response = await request.get('/dashboard/payment-methods')
    if (response.code === 0) {
      const data = response.data
      const methods = []
      const counts = []
      
      data.forEach(item => {
        methods.push(getPaymentMethodLabel(item.method))
        counts.push({
          value: item.count,
          itemStyle: { color: getPaymentMethodColor(item.method) }
        })
      })
      
      paymentMethodOption.value.yAxis.data = methods
      paymentMethodOption.value.series[0].data = counts
    }
  } catch (error) {
    console.error('加载支付方式统计失败:', error)
  }
}

// 加载订单完成率
const loadOrderCompletionRate = async () => {
  try {
    const response = await request.get('/dashboard/order-completion-rate')
    if (response.code === 0) {
      const data = response.data
      realtimeOrderOption.value.series[0].data[0].value = data.rate
    }
  } catch (error) {
    console.error('加载订单完成率失败:', error)
  }
}

// 加载最新交易
const loadRecentTransactions = async () => {
  try {
    const response = await request.get('/dashboard/recent-transactions')
    if (response.code === 0) {
      transactions.value = response.data
    }
  } catch (error) {
    console.error('加载最新交易失败:', error)
  }
}

// 刷新交易数据
const refreshTransactions = () => {
  loadRecentTransactions()
}

// 获取待处理订单颜色
const getPendingOrderColor = (type) => {
  const colors = {
    '待修改回执单': '#f56c6c',
    '待发货': '#e6a23c',
    '待填写回执单': '#f56c6c',
    '暂无待处理': '#e0e0e0'
  }
  return colors[type] || '#e6a23c'
}

// 获取支付方式颜色
const getPaymentMethodColor = (method) => {
  const colors = {
    'alipay': '#1890ff',
    'wechat': '#52c41a',
    'binance': '#faad14',
    'bank': '#f5222d',
    'usdt': '#722ed1'
  }
  return colors[method] || '#5470c6'
}

// 获取支付方式标签
const getPaymentMethodLabel = (method) => {
  const labels = {
    'alipay': '支付宝',
    'wechat': '微信',
    'binance': '币安',
    'bank': '银行卡',
    'usdt': 'USDT'
  }
  return labels[method] || method
}

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    'completed': 'success',
    'success': 'success',
    'pending': 'warning',
    'processing': 'warning',
    'failed': 'danger'
  }
  return types[status] || 'info'
}

// 获取状态标签
const getStatusLabel = (status) => {
  const labels = {
    'completed': '成功',
    'success': '成功',
    'pending': '待处理',
    'processing': '处理中',
    'failed': '失败'
  }
  return labels[status] || status
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 快捷操作处理函数
const handleOrder = () => {
  router.push('/order')
}

const handleProduct = () => {
  router.push('/product')
}

// 更新收入图表
const updateRevenueChart = () => {
  loadRevenueTrend()
}

// 加载所有数据
const loadAllData = async () => {
  await Promise.all([
    loadDashboardStats(),
    loadRevenueTrend(),
    loadPendingOrders(),
    loadPaymentMethods(),
    loadOrderCompletionRate(),
    loadRecentTransactions()
  ])
}

onMounted(() => {
  // 初始加载数据
  loadAllData()
  
  // 设置定时刷新（每30秒刷新一次）
  dataRefreshTimer = setInterval(() => {
    loadDashboardStats()
    loadOrderCompletionRate()
    loadRecentTransactions()
    loadPendingOrders() // 也刷新待处理订单
  }, 30000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
  if (dataRefreshTimer) {
    clearInterval(dataRefreshTimer)
  }
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
  background: #f8f9fa;
  min-height: calc(100vh - 60px);
}

.quick-actions {
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  flex: 1;
  min-width: 150px;
  height: 50px;
  font-size: 16px;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  color: white;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-card :deep(.el-card__body) {
  padding: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  opacity: 0.9;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-trend {
  font-size: 12px;
  opacity: 0.8;
}

.stat-trend .up {
  color: #52c41a;
}

.stat-trend .down {
  color: #ff4d4f;
}

.trend-text {
  margin-left: 5px;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  height: 400px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.chart-card :deep(.el-card__body) {
  height: calc(100% - 56px);
  padding: 20px;
  box-sizing: border-box;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart {
  height: 350px;
  width: 100%;
}

.data-card {
  margin-bottom: 20px;
}

.stat-card {
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}
</style>