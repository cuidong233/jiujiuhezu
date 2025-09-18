<template>
  <div class="payment-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>支付宝支付管理</span>
          <el-tag type="success">已启用</el-tag>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 配置信息 -->
        <el-tab-pane label="配置信息" name="config">
          <el-form :model="alipayConfig" label-width="120px" style="max-width: 600px">
            <el-form-item label="应用ID">
              <el-input v-model="alipayConfig.appId" placeholder="请输入应用ID" />
            </el-form-item>
            <el-form-item label="商户私钥">
              <el-input 
                v-model="alipayConfig.privateKey" 
                type="textarea" 
                :rows="3"
                placeholder="请输入商户私钥" 
              />
            </el-form-item>
            <el-form-item label="支付宝公钥">
              <el-input 
                v-model="alipayConfig.publicKey" 
                type="textarea" 
                :rows="3"
                placeholder="请输入支付宝公钥" 
              />
            </el-form-item>
            <el-form-item label="回调地址">
              <el-input v-model="alipayConfig.notifyUrl" placeholder="支付回调地址" />
            </el-form-item>
            <el-form-item label="沙箱模式">
              <el-switch v-model="alipayConfig.sandbox" />
            </el-form-item>
            <el-form-item label="启用状态">
              <el-switch v-model="alipayConfig.enabled" />
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
                  <el-option label="已退款" value="refunded" />
                </el-select>
              </el-form-item>
              <el-form-item label="日期范围">
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="searchRecords">查询</el-button>
                <el-button @click="resetSearch">重置</el-button>
                <el-button type="success" @click="exportRecords">导出</el-button>
              </el-form-item>
            </el-form>
          </div>

          <el-table :data="records" stripe style="width: 100%">
            <el-table-column prop="tradeNo" label="支付宝订单号" width="220" />
            <el-table-column prop="orderNo" label="商户订单号" width="200" />
            <el-table-column prop="amount" label="金额(元)" width="120">
              <template #default="{ row }">
                <span style="color: #f56c6c; font-weight: bold;">¥{{ row.amount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="buyerId" label="买家账号" />
            <el-table-column prop="createTime" label="创建时间" width="180" />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="viewDetail(row)">详情</el-button>
                <el-button 
                  size="small" 
                  type="warning" 
                  @click="queryStatus(row)"
                  :disabled="row.status === 'success'"
                >查询</el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  @click="refund(row)" 
                  :disabled="row.status !== 'success'"
                >退款</el-button>
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
                <el-statistic title="今日交易额" :value="stats.todayAmount" prefix="¥" :precision="2" />
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="stat-card">
                <el-statistic title="今日订单数" :value="stats.todayCount" />
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="stat-card">
                <el-statistic title="本月交易额" :value="stats.monthAmount" prefix="¥" :precision="2" />
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="stat-card">
                <el-statistic title="成功率" :value="stats.successRate" suffix="%" :precision="1" />
              </el-card>
            </el-col>
          </el-row>

          <el-divider />
          
          <el-row :gutter="20">
            <el-col :span="6">
              <el-card class="stat-card">
                <el-statistic title="总交易额" :value="stats.totalAmount" prefix="¥" :precision="2" />
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="stat-card">
                <el-statistic title="总订单数" :value="stats.totalCount" />
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="stat-card">
                <el-statistic title="退款总额" :value="stats.refundAmount" prefix="¥" :precision="2" />
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="stat-card">
                <el-statistic title="退款率" :value="stats.refundRate" suffix="%" :precision="2" />
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>

        <!-- 对账管理 -->
        <el-tab-pane label="对账管理" name="reconciliation">
          <el-button type="primary" @click="downloadBill">下载对账单</el-button>
          <el-button @click="autoReconcile">自动对账</el-button>
          
          <el-table :data="billList" stripe style="width: 100%; margin-top: 20px;">
            <el-table-column prop="billDate" label="账单日期" />
            <el-table-column prop="totalAmount" label="交易总额" />
            <el-table-column prop="totalCount" label="交易笔数" />
            <el-table-column prop="status" label="对账状态" />
            <el-table-column label="操作">
              <template #default="{ row }">
                <el-button size="small" @click="viewBillDetail(row)">查看</el-button>
                <el-button size="small" type="primary" @click="downloadBillFile(row)">下载</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('config')
const dateRange = ref([])

// 配置信息
const alipayConfig = reactive({
  appId: '',
  privateKey: '',
  publicKey: '',
  notifyUrl: '',
  sandbox: false,
  enabled: true
})

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  status: ''
})

// 交易记录
const records = ref([
  {
    tradeNo: '2024123456789',
    orderNo: 'ORDER20241234',
    amount: 299.00,
    status: 'success',
    buyerId: 'ali***@example.com',
    createTime: '2024-12-25 10:30:00'
  }
])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 统计数据
const stats = reactive({
  todayAmount: 15680.50,
  todayCount: 156,
  monthAmount: 458960.00,
  successRate: 99.2,
  totalAmount: 5689420.00,
  totalCount: 45621,
  refundAmount: 12580.00,
  refundRate: 0.22
})

// 对账单列表
const billList = ref([
  {
    billDate: '2024-12-24',
    totalAmount: '58960.00',
    totalCount: 523,
    status: '已对账'
  }
])

const saveConfig = () => {
  ElMessage.success('支付宝配置保存成功')
}

const testConnection = () => {
  ElMessage.success('支付宝连接测试成功')
}

const searchRecords = () => {
  // 查询记录
  ElMessage.success('查询成功')
}

const resetSearch = () => {
  searchForm.orderNo = ''
  searchForm.status = ''
  dateRange.value = []
}

const exportRecords = () => {
  ElMessage.success('正在导出数据...')
}

const viewDetail = (row) => {
  console.log('查看详情', row)
}

const queryStatus = async (row) => {
  await ElMessageBox.confirm('确定要查询该订单的最新状态吗？', '提示')
  ElMessage.info('正在查询订单状态...')
}

const refund = async (row) => {
  await ElMessageBox.confirm(`确定要退款 ¥${row.amount} 吗？`, '退款确认')
  ElMessage.warning('正在处理退款...')
}

const downloadBill = () => {
  ElMessage.success('正在下载对账单...')
}

const autoReconcile = () => {
  ElMessage.success('正在执行自动对账...')
}

const viewBillDetail = (row) => {
  console.log('查看账单详情', row)
}

const downloadBillFile = (row) => {
  ElMessage.success(`正在下载 ${row.billDate} 的对账单...`)
}

const getStatusType = (status) => {
  const map = {
    success: 'success',
    pending: 'warning',
    failed: 'danger',
    refunded: 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    success: '成功',
    pending: '待支付',
    failed: '失败',
    refunded: '已退款'
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