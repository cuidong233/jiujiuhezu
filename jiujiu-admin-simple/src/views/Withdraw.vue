<template>
  <div class="withdraw-management">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="提现状态">
          <el-select v-model="searchForm.status" placeholder="请选择">
            <el-option label="全部" value=""></el-option>
            <el-option label="待审核" value="0"></el-option>
            <el-option label="审核通过" value="1"></el-option>
            <el-option label="已打款" value="2"></el-option>
            <el-option label="已拒绝" value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="申请时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <template #header>
        <div class="card-header">
          <span>提现申请列表</span>
          <div>
            <el-tag type="info">待处理: {{ pendingCount }}</el-tag>
            <el-tag type="success" style="margin-left: 10px">今日完成: {{ todayComplete }}</el-tag>
          </div>
        </div>
      </template>

      <el-table :data="withdrawList" border style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="orderNo" label="提现单号" width="180"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="amount" label="提现金额">
          <template #default="scope">
            <span style="color: #f56c6c; font-weight: bold">¥{{ scope.row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fee" label="手续费">
          <template #default="scope">
            ¥{{ scope.row.fee }}
          </template>
        </el-table-column>
        <el-table-column prop="realAmount" label="实际到账">
          <template #default="scope">
            <span style="color: #67c23a">¥{{ scope.row.realAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="提现方式">
          <template #default="scope">
            <el-tag>{{ getWithdrawType(scope.row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="account" label="收款账号" width="150">
          <template #default="scope">
            <el-tooltip :content="scope.row.account" placement="top">
              <span>{{ scope.row.account.substr(0, 4) }}****{{ scope.row.account.substr(-4) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="申请时间" width="160"></el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <template v-if="scope.row.status === 0">
              <el-button type="text" @click="handleApprove(scope.row)">通过</el-button>
              <el-button type="text" @click="handleReject(scope.row)">拒绝</el-button>
            </template>
            <template v-else-if="scope.row.status === 1">
              <el-button type="text" @click="handlePay(scope.row)">打款</el-button>
            </template>
            <el-button type="text" @click="handleDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <el-card class="stat-card">
      <template #header>
        <span>提现统计</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-title">今日提现总额</div>
            <div class="stat-value">¥28,580</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-title">今日提现笔数</div>
            <div class="stat-value">45</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-title">本月提现总额</div>
            <div class="stat-value">¥685,920</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-title">平均处理时长</div>
            <div class="stat-value">2.5小时</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const searchForm = reactive({
  username: '',
  status: '',
  dateRange: []
})

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const pendingCount = ref(12)
const todayComplete = ref(33)

const withdrawList = ref([])
const loading = ref(false)

// 获取提现列表
const getWithdrawList = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: currentPage.value,
      pageSize: pageSize.value
    })
    
    if (searchForm.status) {
      params.append('status', mapStatusToApi(searchForm.status))
    }
    
    if (searchForm.username) {
      params.append('userId', searchForm.username)
    }
    
    const response = await fetch(`/api/withdraw/list?${params}`)
    const result = await response.json()
    
    if (result.code === 0) {
      withdrawList.value = result.data.list.map(item => ({
        id: item.id,
        orderNo: item.orderId,
        username: item.userName,
        amount: item.amount,
        fee: item.fee,
        realAmount: item.actualAmount,
        type: item.method || 'bank',
        account: item.account,
        status: mapStatusFromApi(item.status),
        createTime: item.createdTime
      }))
      total.value = result.data.total
    }
  } catch (error) {
    console.error('获取提现列表失败:', error)
    ElMessage.error('获取提现列表失败')
  } finally {
    loading.value = false
  }
}

// 状态映射函数
const mapStatusToApi = (status) => {
  const map = {
    '0': 'pending',
    '1': 'reviewing',
    '2': 'completed',
    '3': 'rejected'
  }
  return map[status] || ''
}

const mapStatusFromApi = (status) => {
  const map = {
    'pending': 0,
    'reviewing': 1,
    'processing': 1,
    'completed': 2,
    'rejected': 3
  }
  return map[status] || 0
}

// 格式化账号
const formatAccount = (item) => {
  if (item.bankCard) return item.bankCard
  if (item.alipayAccount) return item.alipayAccount
  if (item.wechatAccount) return item.wechatAccount
  if (item.cryptoAddress) return item.cryptoAddress.substr(0, 6) + '****' + item.cryptoAddress.substr(-4)
  return 'N/A'
}

const getWithdrawType = (type) => {
  const types = {
    alipay: '支付宝',
    wechat: '微信',
    bank: '银行卡',
    usdt: 'USDT'
  }
  return types[type] || '未知'
}

const getStatusType = (status) => {
  const types = ['warning', 'primary', 'success', 'danger']
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = ['待审核', '审核通过', '已打款', '已拒绝']
  return texts[status] || '未知'
}

const handleSearch = () => {
  currentPage.value = 1
  getWithdrawList()
  ElMessage.success('查询成功')
}

const handleReset = () => {
  searchForm.username = ''
  searchForm.status = ''
  searchForm.dateRange = []
  handleSearch()
}

const handleApprove = async (row) => {
  await ElMessageBox.confirm('确认通过该提现申请？', '提示')
  try {
    const response = await fetch(`/api/withdraw/review/${row.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'completed',
        operatorId: 'admin',
        operatorName: '管理员'
      })
    })
    const result = await response.json()
    if (result.code === 0) {
      ElMessage.success('审核通过')
      getWithdrawList()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleReject = async (row) => {
  const { value } = await ElMessageBox.prompt('请输入拒绝原因', '拒绝提现', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '请输入拒绝原因'
  })
  try {
    const response = await fetch(`/api/withdraw/review/${row.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'rejected',
        rejectReason: value,
        operatorId: 'admin',
        operatorName: '管理员'
      })
    })
    const result = await response.json()
    if (result.code === 0) {
      ElMessage.warning('已拒绝')
      getWithdrawList()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handlePay = async (row) => {
  await ElMessageBox.confirm('确认已完成打款？', '确认打款')
  ElMessage.success('打款成功')
  row.status = 2
}

const handleDetail = (row) => {
  ElMessage.info('查看详情: ' + row.orderNo)
}

const handleSizeChange = (val) => {
  pageSize.value = val
  getWithdrawList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getWithdrawList()
}

// 初始化
onMounted(() => {
  getWithdrawList()
})
</script>

<style scoped>
.withdraw-management {
  padding: 20px;
  background: var(--bg-color);
  min-height: calc(100vh - 60px);
}

.search-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-card {
  margin-top: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
}

.stat-title {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-primary);
}

.el-pagination {
  margin-top: 20px;
  text-align: right;
}
</style>