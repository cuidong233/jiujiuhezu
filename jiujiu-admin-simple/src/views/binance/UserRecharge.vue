<template>
  <div class="user-recharge">
    <!-- 实时汇率显示卡片 -->
    <el-card class="rate-display-card" v-loading="rateLoading">
      <template #header>
        <div class="card-header">
          <span>
            <el-icon><Coin /></el-icon>
            实时汇率
          </span>
          <el-button text type="primary" @click="fetchExchangeRate">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="rate-item">
            <div class="rate-label">USDT/CNY 买入价</div>
            <div class="rate-value">¥{{ exchangeRate.buy }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="rate-item">
            <div class="rate-label">USDT/CNY 卖出价</div>
            <div class="rate-value">¥{{ exchangeRate.sell }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="rate-item">
            <div class="rate-label">数据来源</div>
            <div class="rate-source">
              <el-tag size="small" type="success">{{ exchangeRate.source }}</el-tag>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="rate-item">
            <div class="rate-label">更新时间</div>
            <div class="rate-time">{{ formatTime(exchangeRate.timestamp) }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 充值表单 -->
    <el-card>
      <template #header>
        <span>
          <el-icon><Wallet /></el-icon>
          用户充值
        </span>
      </template>
      
      <el-form :model="rechargeForm" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="用户账号" prop="username">
          <el-input v-model="rechargeForm.username" placeholder="请输入用户账号"></el-input>
        </el-form-item>
        
        <el-form-item label="充值币种" prop="currency">
          <el-select v-model="rechargeForm.currency" placeholder="请选择币种" @change="handleCurrencyChange">
            <el-option label="USDT" value="USDT"></el-option>
            <el-option label="BTC" value="BTC"></el-option>
            <el-option label="ETH" value="ETH"></el-option>
            <el-option label="BNB" value="BNB"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="充值金额" prop="amount">
          <el-input-number 
            v-model="rechargeForm.amount" 
            :min="0.01"
            :precision="rechargeForm.currency === 'BTC' ? 8 : 2"
            :step="rechargeForm.currency === 'BTC' ? 0.0001 : 10"
            @change="calculateCNYValue"
          ></el-input-number>
          <span style="margin-left: 10px">{{ rechargeForm.currency || 'USDT' }}</span>
        </el-form-item>
        
        <!-- 人民币价值显示 -->
        <el-form-item label="折合人民币">
          <div class="cny-value">
            <el-tag type="warning" size="large">
              ¥ {{ cnyValue.toFixed(2) }}
            </el-tag>
            <el-text type="info" size="small" style="margin-left: 10px">
              (基于当前{{ exchangeRate.source }}汇率计算)
            </el-text>
          </div>
        </el-form-item>
        
        <el-form-item label="支付方式" prop="payMethod">
          <el-radio-group v-model="rechargeForm.payMethod">
            <el-radio label="binance">币安支付</el-radio>
            <el-radio label="transfer">直接转账</el-radio>
            <el-radio label="p2p">P2P交易</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input 
            v-model="rechargeForm.remark" 
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          ></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" size="large" @click="handleSubmit">
            <el-icon><CirclePlus /></el-icon>
            生成充值订单
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="showRateDialog = true">
            <el-icon><View /></el-icon>
            查看汇率详情
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="recent-card">
      <template #header>
        <span>最近充值记录</span>
      </template>
      
      <el-table :data="recentRecords" border style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" width="200"></el-table-column>
        <el-table-column prop="username" label="用户"></el-table-column>
        <el-table-column prop="amount" label="金额">
          <template #default="scope">
            {{ scope.row.amount }} {{ scope.row.currency }}
          </template>
        </el-table-column>
        <el-table-column prop="cnyValue" label="人民币价值">
          <template #default="scope">
            <el-text type="warning">¥{{ scope.row.cnyValue }}</el-text>
          </template>
        </el-table-column>
        <el-table-column prop="exchangeRate" label="汇率">
          <template #default="scope">
            {{ scope.row.exchangeRate }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'warning'">
              {{ scope.row.status === 1 ? '已完成' : '待支付' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间"></el-table-column>
      </el-table>
    </el-card>

    <!-- 汇率详情对话框 -->
    <el-dialog 
      v-model="showRateDialog" 
      title="币安实时汇率详情"
      width="800px"
    >
      <div class="rate-dialog-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="USDT/CNY 买入价">
            <el-text type="primary" size="large">¥{{ exchangeRate.buy }}</el-text>
          </el-descriptions-item>
          <el-descriptions-item label="USDT/CNY 卖出价">
            <el-text type="success" size="large">¥{{ exchangeRate.sell }}</el-text>
          </el-descriptions-item>
          <el-descriptions-item label="中间价">
            ¥{{ exchangeRate.mid }}
          </el-descriptions-item>
          <el-descriptions-item label="买卖价差">
            ¥{{ exchangeRate.spread }}
          </el-descriptions-item>
          <el-descriptions-item label="数据来源">
            <el-tag type="success">{{ exchangeRate.source }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatTime(exchangeRate.timestamp) }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider></el-divider>

        <h4>其他币种参考价格</h4>
        <el-table :data="otherCurrencyPrices" style="width: 100%">
          <el-table-column prop="symbol" label="币种"></el-table-column>
          <el-table-column prop="price" label="USDT价格">
            <template #default="scope">
              {{ formatPrice(scope.row.price) }} USDT
            </template>
          </el-table-column>
          <el-table-column prop="cnyPrice" label="CNY价格">
            <template #default="scope">
              ¥{{ (scope.row.price * exchangeRate.sell).toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="showRateDialog = false">关闭</el-button>
        <el-button type="primary" @click="fetchExchangeRate">
          <el-icon><Refresh /></el-icon>
          刷新汇率
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { 
  Coin, 
  Refresh, 
  Wallet, 
  CirclePlus, 
  View 
} from '@element-plus/icons-vue'

const API_BASE = 'http://localhost:3000/api'

const formRef = ref()
const showRateDialog = ref(false)
const rateLoading = ref(false)

// 汇率数据
const exchangeRate = ref({
  buy: 7.35,
  sell: 7.25,
  mid: 7.30,
  spread: 0.10,
  source: 'Binance P2P',
  timestamp: new Date().toISOString()
})

// 其他币种价格
const otherCurrencyPrices = ref([])

// CNY价值
const cnyValue = ref(0)

const rechargeForm = reactive({
  username: '',
  currency: 'USDT',
  amount: 100,
  payMethod: 'binance',
  remark: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户账号', trigger: 'blur' }
  ],
  currency: [
    { required: true, message: '请选择币种', trigger: 'change' }
  ],
  amount: [
    { required: true, message: '请输入充值金额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '充值金额必须大于0', trigger: 'blur' }
  ],
  payMethod: [
    { required: true, message: '请选择支付方式', trigger: 'change' }
  ]
}

const recentRecords = ref([
  {
    orderNo: 'BN202401010003',
    username: 'user003',
    amount: 200,
    currency: 'USDT',
    cnyValue: '1460.00',
    exchangeRate: '7.30',
    status: 1,
    createTime: '2024-01-01 14:30:00'
  },
  {
    orderNo: 'BN202401010004',
    username: 'user004',
    amount: 0.01,
    currency: 'BTC',
    cnyValue: '3102.50',
    exchangeRate: '310250.00',
    status: 0,
    createTime: '2024-01-01 15:00:00'
  }
])

// 获取汇率
const fetchExchangeRate = async () => {
  rateLoading.value = true
  try {
    const response = await axios.get(`${API_BASE}/binance/rate/usdt-cny`)
    if (response.data.code === 0) {
      exchangeRate.value = response.data.data
      calculateCNYValue()
      ElMessage.success('汇率已更新')
    } else {
      ElMessage.warning('使用备用汇率')
      if (response.data.data) {
        exchangeRate.value = response.data.data
        calculateCNYValue()
      }
    }
  } catch (error) {
    ElMessage.error('获取汇率失败')
  } finally {
    rateLoading.value = false
  }
}

// 获取其他币种价格
const fetchOtherPrices = async () => {
  try {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT']
    const response = await axios.get(`${API_BASE}/binance/prices`, {
      params: { symbols: symbols.join(',') }
    })
    if (response.data.code === 0) {
      otherCurrencyPrices.value = response.data.data
    }
  } catch (error) {
    console.error('获取币种价格失败:', error)
  }
}

// 计算CNY价值
const calculateCNYValue = async () => {
  if (!rechargeForm.amount) {
    cnyValue.value = 0
    return
  }

  if (rechargeForm.currency === 'USDT') {
    cnyValue.value = rechargeForm.amount * exchangeRate.value.sell
  } else {
    // 获取其他币种的USDT价格
    try {
      const response = await axios.get(`${API_BASE}/binance/price/${rechargeForm.currency}USDT`)
      if (response.data.code === 0) {
        const usdtPrice = response.data.data.price
        cnyValue.value = rechargeForm.amount * usdtPrice * exchangeRate.value.sell
      }
    } catch (error) {
      cnyValue.value = 0
    }
  }
}

// 币种改变时重新计算
const handleCurrencyChange = () => {
  calculateCNYValue()
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '未更新'
  return new Date(timestamp).toLocaleString('zh-CN')
}

// 格式化价格
const formatPrice = (price) => {
  if (!price) return '0.00'
  if (price > 1000) return price.toFixed(0)
  if (price > 10) return price.toFixed(2)
  if (price > 1) return price.toFixed(3)
  return price.toFixed(4)
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate()
  if (!valid) return

  try {
    await ElMessageBox.confirm(
      `确认生成充值订单？\n\n充值金额：${rechargeForm.amount} ${rechargeForm.currency}\n折合人民币：¥${cnyValue.value.toFixed(2)}\n当前汇率：${exchangeRate.value.sell}\n数据来源：${exchangeRate.value.source}`,
      '充值确认',
      {
        confirmButtonText: '确认充值',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }
    )

    // 这里添加实际的充值订单生成逻辑
    const orderNo = 'BN' + Date.now()
    
    // 添加到最近记录
    recentRecords.value.unshift({
      orderNo,
      username: rechargeForm.username,
      amount: rechargeForm.amount,
      currency: rechargeForm.currency,
      cnyValue: cnyValue.value.toFixed(2),
      exchangeRate: rechargeForm.currency === 'USDT' ? 
        exchangeRate.value.sell.toFixed(2) : 
        (cnyValue.value / rechargeForm.amount).toFixed(2),
      status: 0,
      createTime: new Date().toLocaleString('zh-CN')
    })

    ElMessage.success(`充值订单已生成，订单号：${orderNo}`)
    handleReset()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('生成订单失败')
    }
  }
}

const handleReset = () => {
  formRef.value.resetFields()
  cnyValue.value = 0
}

// 组件挂载时
onMounted(() => {
  fetchExchangeRate()
  fetchOtherPrices()
  calculateCNYValue()
})
</script>

<style scoped>
.user-recharge {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.rate-display-card {
  background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.rate-item {
  text-align: center;
  padding: 10px;
}

.rate-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.rate-value {
  font-size: 20px;
  font-weight: bold;
  color: var(--el-color-primary);
}

.rate-source {
  margin-top: 5px;
}

.rate-time {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.cny-value {
  display: flex;
  align-items: center;
}

.recent-card {
  margin-top: 0;
}

.rate-dialog-content h4 {
  margin: 20px 0 10px 0;
  color: var(--el-text-color-primary);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .rate-item {
    margin-bottom: 10px;
  }
}
</style>