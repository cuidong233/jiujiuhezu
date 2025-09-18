<template>
  <div class="exchange-rate">
    <!-- USDT/CNY 实时汇率卡片 -->
    <el-card class="usdt-rate-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon><Coin /></el-icon>
            USDT/CNY 实时汇率
          </span>
          <div class="actions">
            <el-tag :type="rateData.source === 'Binance P2P' ? 'success' : 'warning'">
              {{ rateData.source || '等待更新' }}
            </el-tag>
            <el-button type="primary" size="small" @click="fetchUSDTRate" :loading="loading">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <div class="rate-display">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-statistic title="买入价格 (CNY)" :value="rateData.buy" :precision="2">
              <template #prefix>¥</template>
            </el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic title="卖出价格 (CNY)" :value="rateData.sell" :precision="2">
              <template #prefix>¥</template>
            </el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic title="中间价 (CNY)" :value="rateData.mid" :precision="2">
              <template #prefix>¥</template>
            </el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic title="买卖价差" :value="rateData.spread" :precision="2">
              <template #prefix>¥</template>
            </el-statistic>
          </el-col>
        </el-row>
        
        <div class="update-time">
          <el-text type="info">
            更新时间: {{ formatTime(rateData.timestamp) }}
          </el-text>
        </div>
      </div>
    </el-card>

    <!-- 货币转换器 -->
    <el-card class="converter-card">
      <template #header>
        <span class="title">
          <el-icon><RefreshRight /></el-icon>
          货币转换器
        </span>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input-number 
            v-model="converter.usdt" 
            :precision="2"
            :min="0"
            placeholder="USDT金额"
            @change="convertUSDTtoCNY"
            style="width: 100%"
          >
            <template #append>USDT</template>
          </el-input-number>
        </el-col>
        <el-col :span="4" class="exchange-icon">
          <el-icon size="24"><Sort /></el-icon>
        </el-col>
        <el-col :span="10">
          <el-input-number 
            v-model="converter.cny" 
            :precision="2"
            :min="0"
            placeholder="CNY金额"
            @change="convertCNYtoUSDT"
            style="width: 100%"
          >
            <template #append>CNY</template>
          </el-input-number>
        </el-col>
      </el-row>
    </el-card>

    <!-- 主流币种价格 -->
    <el-card class="crypto-prices-card">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon><TrendCharts /></el-icon>
            主流币种价格
          </span>
          <el-button type="primary" size="small" @click="fetchCryptoPrices" :loading="pricesLoading">
            <el-icon><Refresh /></el-icon>
            刷新价格
          </el-button>
        </div>
      </template>
      
      <el-table :data="cryptoPrices" v-loading="pricesLoading">
        <el-table-column prop="symbol" label="币种" width="120"></el-table-column>
        <el-table-column prop="price" label="价格 (USDT)">
          <template #default="scope">
            <el-text type="primary">{{ formatPrice(scope.row.price) }}</el-text>
          </template>
        </el-table-column>
        <el-table-column prop="cnyValue" label="价格 (CNY)">
          <template #default="scope">
            <el-text>¥{{ formatCNYPrice(scope.row.price) }}</el-text>
          </template>
        </el-table-column>
        <el-table-column prop="change24h" label="24h涨跌">
          <template #default="scope">
            <el-tag :type="scope.row.priceChangePercent >= 0 ? 'success' : 'danger'">
              {{ scope.row.priceChangePercent >= 0 ? '+' : '' }}{{ scope.row.priceChangePercent?.toFixed(2) || '0.00' }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="high24h" label="24h最高">
          <template #default="scope">
            {{ formatPrice(scope.row.highPrice) }}
          </template>
        </el-table-column>
        <el-table-column prop="low24h" label="24h最低">
          <template #default="scope">
            {{ formatPrice(scope.row.lowPrice) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 自动更新配置 -->
    <el-card class="config-card">
      <template #header>
        <span class="title">
          <el-icon><Setting /></el-icon>
          自动更新配置
        </span>
      </template>
      
      <el-form :model="configForm" label-width="120px">
        <el-form-item label="自动更新">
          <el-switch v-model="configForm.autoUpdate" @change="toggleAutoUpdate"></el-switch>
        </el-form-item>
        <el-form-item label="更新间隔">
          <el-input-number 
            v-model="configForm.interval" 
            :min="1"
            :max="60"
            @change="updateInterval"
          ></el-input-number>
          <span style="margin-left: 10px">分钟</span>
        </el-form-item>
        <el-form-item label="数据源">
          <el-tag type="success">币安官方API (唯一数据源)</el-tag>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { 
  Coin, 
  Refresh, 
  RefreshRight, 
  Sort, 
  TrendCharts, 
  Setting 
} from '@element-plus/icons-vue'

// API基础URL
const API_BASE = 'http://localhost:3000/api'

// 状态变量
const loading = ref(false)
const pricesLoading = ref(false)
let autoUpdateTimer = null

// USDT/CNY汇率数据
const rateData = ref({
  buy: 0,
  sell: 0,
  mid: 0,
  spread: 0,
  source: '',
  timestamp: null
})

// 货币转换器
const converter = reactive({
  usdt: 100,
  cny: 730
})

// 主流币种价格
const cryptoPrices = ref([])

// 配置表单
const configForm = reactive({
  autoUpdate: false,
  interval: 1
})

// 获取USDT/CNY汇率
const fetchUSDTRate = async () => {
  loading.value = true
  try {
    const response = await axios.get(`${API_BASE}/binance/rate/usdt-cny`)
    if (response.data.code === 0) {
      rateData.value = response.data.data
      ElMessage.success('汇率更新成功')
    } else {
      ElMessage.warning(response.data.message || '汇率更新失败，使用备用汇率')
      if (response.data.data) {
        rateData.value = response.data.data
      }
    }
  } catch (error) {
    ElMessage.error('获取汇率失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 获取主流币种价格
const fetchCryptoPrices = async () => {
  pricesLoading.value = true
  try {
    // 获取多个币种的24小时统计数据
    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT']
    const promises = symbols.map(symbol => 
      axios.get(`${API_BASE}/binance/stats/${symbol}`)
    )
    
    const responses = await Promise.all(promises)
    cryptoPrices.value = responses
      .filter(res => res.data.code === 0)
      .map(res => res.data.data)
    
    ElMessage.success('价格更新成功')
  } catch (error) {
    ElMessage.error('获取价格失败: ' + error.message)
  } finally {
    pricesLoading.value = false
  }
}

// USDT转CNY
const convertUSDTtoCNY = () => {
  if (!converter.usdt) {
    converter.cny = 0
    return
  }
  converter.cny = parseFloat((converter.usdt * (rateData.value.sell || 7.30)).toFixed(2))
}

// CNY转USDT
const convertCNYtoUSDT = () => {
  if (!converter.cny) {
    converter.usdt = 0
    return
  }
  converter.usdt = parseFloat((converter.cny / (rateData.value.buy || 7.35)).toFixed(2))
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '未更新'
  return new Date(timestamp).toLocaleString('zh-CN')
}

// 格式化价格
const formatPrice = (price) => {
  if (!price) return '0.00'
  if (price > 1000) {
    return price.toFixed(0)
  } else if (price > 10) {
    return price.toFixed(2)
  } else if (price > 1) {
    return price.toFixed(3)
  } else {
    return price.toFixed(4)
  }
}

// 格式化CNY价格
const formatCNYPrice = (usdtPrice) => {
  if (!usdtPrice) return '0.00'
  const cnyPrice = usdtPrice * (rateData.value.sell || 7.30)
  return cnyPrice.toFixed(2)
}

// 切换自动更新
const toggleAutoUpdate = (value) => {
  if (value) {
    startAutoUpdate()
    ElMessage.success('已开启自动更新')
  } else {
    stopAutoUpdate()
    ElMessage.info('已关闭自动更新')
  }
}

// 更新间隔
const updateInterval = () => {
  if (configForm.autoUpdate) {
    stopAutoUpdate()
    startAutoUpdate()
    ElMessage.success(`更新间隔已设置为 ${configForm.interval} 分钟`)
  }
}

// 开始自动更新
const startAutoUpdate = () => {
  autoUpdateTimer = setInterval(() => {
    fetchUSDTRate()
    fetchCryptoPrices()
  }, configForm.interval * 60 * 1000)
}

// 停止自动更新
const stopAutoUpdate = () => {
  if (autoUpdateTimer) {
    clearInterval(autoUpdateTimer)
    autoUpdateTimer = null
  }
}

// 组件挂载时
onMounted(() => {
  fetchUSDTRate()
  fetchCryptoPrices()
  
  // 初始化转换器
  convertUSDTtoCNY()
})

// 组件卸载时
onUnmounted(() => {
  stopAutoUpdate()
})
</script>

<style scoped>
.exchange-rate {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header .title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.card-header .actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.usdt-rate-card {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
}

.rate-display {
  padding: 20px 0;
}

.rate-display .el-statistic {
  text-align: center;
}

.update-time {
  margin-top: 20px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.converter-card {
  max-width: 800px;
}

.exchange-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--el-color-primary);
}

.crypto-prices-card .el-table {
  margin-top: 0;
}

.config-card {
  max-width: 600px;
}

.config-card .el-form {
  padding-top: 10px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .rate-display .el-col {
    margin-bottom: 16px;
  }
  
  .converter-card .el-col {
    margin-bottom: 12px;
  }
  
  .exchange-icon {
    transform: rotate(90deg);
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .usdt-rate-card {
    background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
  }
}
</style>