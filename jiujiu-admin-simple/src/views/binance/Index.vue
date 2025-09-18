<template>
  <div class="binance-container">
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="充值记录" name="recharge">
        <RechargeRecords />
      </el-tab-pane>
      <el-tab-pane label="汇率管理" name="exchange">
        <ExchangeRate />
      </el-tab-pane>
      <el-tab-pane label="统计报表" name="statistics">
        <Statistics />
      </el-tab-pane>
      <el-tab-pane label="用户充值" name="userRecharge">
        <UserRecharge />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import RechargeRecords from './RechargeRecords.vue'
import ExchangeRate from './ExchangeRate.vue'
import Statistics from './Statistics.vue'
import UserRecharge from './UserRecharge.vue'

const activeTab = ref('recharge')

const handleTabClick = (tab) => {
  console.log('切换到:', tab.props.label)
}
</script>

<style scoped>
.binance-container {
  padding: 20px;
  background: var(--card-bg);
  min-height: calc(100vh - 60px);
  border-radius: 8px;
  box-shadow: var(--shadow-light);
}
</style>