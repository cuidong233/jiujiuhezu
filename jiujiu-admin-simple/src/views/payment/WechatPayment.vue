<template>
  <div class="payment-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>微信支付管理</span>
          <el-tag type="success">已启用</el-tag>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 配置信息 -->
        <el-tab-pane label="配置信息" name="config">
          <el-form :model="wechatConfig" label-width="120px" style="max-width: 600px">
            <el-form-item label="商户号">
              <el-input v-model="wechatConfig.mchId" placeholder="请输入商户号" />
            </el-form-item>
            <el-form-item label="AppID">
              <el-input v-model="wechatConfig.appId" placeholder="请输入AppID" />
            </el-form-item>
            <el-form-item label="API密钥">
              <el-input v-model="wechatConfig.apiKey" type="password" placeholder="请输入API密钥" show-password />
            </el-form-item>
            <el-form-item label="回调地址">
              <el-input v-model="wechatConfig.notifyUrl" placeholder="支付回调地址" />
            </el-form-item>
            <el-form-item label="启用状态">
              <el-switch v-model="wechatConfig.enabled" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveConfig">保存配置</el-button>
              <el-button @click="testConnection">测试连接</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 交易记录 -->
        <el-tab-pane label="交易记录" name="records">
          <div class="search-bar">
            <el-form :inline="true" :model="searchForm">
              <el-form-item label="订单号">
                <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" />
              </el-form-item>
              <el-form-item label="交易状态">
                <el-select v-model="searchForm.status" placeholder="全部">
                  <el-option label="全部" value="" />
                  <el-option label="成功" value="success" />
                  <el-option label="待支付" value="pending" />
                  <el-option label="失败" value="failed" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="searchRecords">查询</el-button>
                <el-button @click="resetSearch">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <el-table :data="records" stripe style="width: 100%">
            <el-table-column prop="orderNo" label="订单号" width="200" />
            <el-table-column prop="amount" label="金额(元)" width="120">
              <template #default="{ row }">
                ¥{{ row.amount }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="userId" label="用户ID" />
            <el-table-column prop="createTime" label="创建时间" width="180" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button size="small" @click="viewDetail(row)">详情</el-button>
                <el-button size="small" type="danger" @click="refund(row)" 
                  :disabled="row.status !== 'success'">退款</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </el-tab-pane>

        <!-- 统计报表 -->
        <el-tab-pane label="统计报表" name="stats">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-card class="stat-card">
                <el-statistic title="今日交易额" :value="stats.todayAmount" prefix="¥" />
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="stat-card">
                <el-statistic title="今日订单数" :value="stats.todayCount" />
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="stat-card">
                <el-statistic title="本月交易额" :value="stats.monthAmount" prefix="¥" />
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="stat-card">
                <el-statistic title="成功率" :value="stats.successRate" suffix="%" />
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('config')

// 配置信息
const wechatConfig = reactive({
  mchId: '',
  appId: '',
  apiKey: '',
  notifyUrl: '',
  enabled: true
})

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  status: ''
})

// 交易记录
const records = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 统计数据
const stats = reactive({
  todayAmount: 12580.50,
  todayCount: 125,
  monthAmount: 358960.00,
  successRate: 98.5
})

const saveConfig = () => {
  ElMessage.success('配置保存成功')
}

const testConnection = () => {
  ElMessage.success('连接测试成功')
}

const searchRecords = () => {
  // 查询记录
}

const resetSearch = () => {
  searchForm.orderNo = ''
  searchForm.status = ''
}

const viewDetail = (row) => {
  console.log('查看详情', row)
}

const refund = (row) => {
  ElMessage.warning('退款功能开发中')
}

const getStatusType = (status) => {
  const map = {
    success: 'success',
    pending: 'warning',
    failed: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    success: '成功',
    pending: '待支付',
    failed: '失败'
  }
  return map[status] || status
}

const handleSizeChange = (val) => {
  pageSize.value = val
  searchRecords()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  searchRecords()
}

onMounted(() => {
  // 加载配置和数据
})
</script>

<style scoped>
.payment-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.el-pagination {
  margin-top: 20px;
  text-align: right;
}
</style>