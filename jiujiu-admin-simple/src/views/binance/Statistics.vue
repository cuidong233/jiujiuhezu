<template>
  <div class="statistics">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-title">今日充值总额</div>
            <div class="stat-value">{{ todayTotal }} USDT</div>
            <div class="stat-trend up">↑ 12.5%</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-title">今日充值笔数</div>
            <div class="stat-value">{{ todayCount }}</div>
            <div class="stat-trend up">↑ 8.3%</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-title">本月充值总额</div>
            <div class="stat-value">{{ monthTotal }} USDT</div>
            <div class="stat-trend down">↓ 3.2%</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-title">活跃用户数</div>
            <div class="stat-value">{{ activeUsers }}</div>
            <div class="stat-trend up">↑ 15.6%</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="chart-card">
      <template #header>
        <div class="chart-header">
          <span>充值趋势图</span>
          <el-radio-group v-model="chartType" size="small">
            <el-radio-button label="day">日</el-radio-button>
            <el-radio-button label="week">周</el-radio-button>
            <el-radio-button label="month">月</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <div class="chart-container">
        <div class="chart-placeholder">
          图表区域 - 显示充值趋势
        </div>
      </div>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <span>币种分布统计</span>
      </template>
      <el-table :data="currencyData" border style="width: 100%">
        <el-table-column prop="currency" label="币种"></el-table-column>
        <el-table-column prop="amount" label="充值金额">
          <template #default="scope">
            {{ scope.row.amount }} USDT
          </template>
        </el-table-column>
        <el-table-column prop="count" label="充值笔数"></el-table-column>
        <el-table-column prop="percentage" label="占比">
          <template #default="scope">
            <el-progress :percentage="scope.row.percentage" :text-inside="true" :stroke-width="20"></el-progress>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const todayTotal = ref('12,580.50')
const todayCount = ref(156)
const monthTotal = ref('385,920.80')
const activeUsers = ref(892)

const chartType = ref('day')

const currencyData = ref([
  {
    currency: 'USDT',
    amount: 8500,
    count: 105,
    percentage: 67.5
  },
  {
    currency: 'BTC',
    amount: 2800,
    count: 28,
    percentage: 22.3
  },
  {
    currency: 'ETH',
    amount: 980,
    count: 15,
    percentage: 7.8
  },
  {
    currency: 'BNB',
    amount: 300,
    count: 8,
    percentage: 2.4
  }
])
</script>

<style scoped>
.statistics {
  padding: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 10px;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 10px;
}

.stat-trend {
  font-size: 12px;
}

.stat-trend.up {
  color: #67c23a;
}

.stat-trend.down {
  color: #f56c6c;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 4px;
}

.chart-placeholder {
  color: #909399;
  font-size: 16px;
}

.table-card {
  margin-bottom: 20px;
}
</style>