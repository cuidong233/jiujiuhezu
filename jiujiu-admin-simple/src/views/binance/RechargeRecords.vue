<template>
  <div class="recharge-records">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card class="stat-card">
          <el-statistic title="今日充值笔数" :value="statistics.todayCount" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <el-statistic title="今日充值金额" :value="statistics.todayAmount" prefix="¥" :precision="2" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <el-statistic title="待处理订单" :value="statistics.pendingCount" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <el-statistic title="成功率" :value="statistics.successRate" suffix="%" :precision="1" />
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <template #header>
        <div class="card-header">
          <span>充值订单管理</span>
          <div>
            <el-button type="success" size="small" @click="handleBatchConfirm" :disabled="!selectedRows.length">
              批量确认 ({{ selectedRows.length }})
            </el-button>
            <el-button type="primary" size="small" @click="handleExport">导出记录</el-button>
          </div>
        </div>
      </template>
      
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户">
          <el-input v-model="searchForm.username" placeholder="用户账号/ID" clearable></el-input>
        </el-form-item>
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderNo" placeholder="订单号" clearable></el-input>
        </el-form-item>
        <el-form-item label="支付方式">
          <el-select v-model="searchForm.payMethod" placeholder="全部" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="支付宝" value="alipay"></el-option>
            <el-option label="微信" value="wechat"></el-option>
            <el-option label="USDT" value="binance"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="待支付" value="0"></el-option>
            <el-option label="已完成" value="1"></el-option>
            <el-option label="已取消" value="2"></el-option>
            <el-option label="已退款" value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            clearable
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-table 
        :data="tableData" 
        border 
        style="width: 100%" 
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="orderNo" label="订单号" width="200" show-overflow-tooltip></el-table-column>
        <el-table-column prop="username" label="用户" width="120"></el-table-column>
        <el-table-column prop="payMethod" label="支付方式" width="100">
          <template #default="scope">
            <el-tag :type="getPayMethodType(scope.row.payMethod)">
              {{ getPayMethodText(scope.row.payMethod) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="充值金额">
          <template #default="scope">
            <div>
              <div v-if="scope.row.payMethod === 'binance'">
                {{ scope.row.usdtAmount }} USDT
                <el-text type="info" size="small" style="display: block;">
                  汇率: {{ scope.row.exchangeRate }}
                </el-text>
              </div>
              <div v-else>
                ¥{{ scope.row.amount }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="realAmount" label="实付金额(CNY)">
          <template #default="scope">
            <el-text type="warning" style="font-weight: bold;">¥{{ scope.row.realAmount }}</el-text>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleView(scope.row)">详情</el-button>
            <el-button type="success" link @click="handleConfirm(scope.row)" v-if="scope.row.status === 0">确认</el-button>
            <el-button type="danger" link @click="handleCancel(scope.row)" v-if="scope.row.status === 0">取消</el-button>
            <el-button type="warning" link @click="handleRefund(scope.row)" v-if="scope.row.status === 1">退款</el-button>
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
      ></el-pagination>
    </el-card>

    <!-- 订单详情对话框 -->
    <el-dialog v-model="detailDialog" title="充值订单详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="用户">{{ currentOrder.username }}</el-descriptions-item>
        <el-descriptions-item label="支付方式">{{ getPayMethodText(currentOrder.payMethod) }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentOrder.status)">
            {{ getStatusText(currentOrder.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="充值金额">
          <span v-if="currentOrder.payMethod === 'binance'">
            {{ currentOrder.usdtAmount }} USDT
          </span>
          <span v-else>¥{{ currentOrder.amount }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="实付金额">¥{{ currentOrder.realAmount }}</el-descriptions-item>
        <el-descriptions-item label="汇率" v-if="currentOrder.payMethod === 'binance'">
          {{ currentOrder.exchangeRate }}
        </el-descriptions-item>
        <el-descriptions-item label="数据来源" v-if="currentOrder.payMethod === 'binance'">
          {{ currentOrder.rateSource || 'Binance P2P' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ currentOrder.createTime }}</el-descriptions-item>
        <el-descriptions-item label="支付时间" :span="2">{{ currentOrder.payTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentOrder.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const API_BASE = 'http://localhost:3000/api'

// 搜索表单
const searchForm = reactive({
  username: '',
  orderNo: '',
  payMethod: '',
  status: '',
  dateRange: null
})

// 统计数据
const statistics = ref({
  todayCount: 0,
  todayAmount: 0,
  pendingCount: 0,
  successRate: 0
})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const selectedRows = ref([])

// 分页
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 详情对话框
const detailDialog = ref(false)
const currentOrder = ref({})

// 获取充值记录列表
const getRechargeList = async () => {
  loading.value = true
  try {
    // 模拟数据
    const mockData = []
    for (let i = 0; i < 57; i++) {
      const payMethods = ['alipay', 'wechat', 'binance']
      const payMethod = payMethods[i % 3]
      const status = i % 4 === 0 ? 0 : i % 4 === 1 ? 1 : i % 4 === 2 ? 2 : 1
      
      mockData.push({
        id: i + 1,
        orderNo: `RCH${Date.now()}${i}`,
        username: `user${100 + i}`,
        payMethod: payMethod,
        amount: 100 + i * 10,
        usdtAmount: payMethod === 'binance' ? ((100 + i * 10) / 7.30).toFixed(2) : null,
        realAmount: 100 + i * 10,
        exchangeRate: payMethod === 'binance' ? '7.30' : null,
        rateSource: payMethod === 'binance' ? 'Binance P2P' : null,
        status: status,
        createTime: new Date(Date.now() - i * 3600000).toLocaleString('zh-CN'),
        payTime: status === 1 ? new Date(Date.now() - i * 3600000 + 600000).toLocaleString('zh-CN') : null
      })
    }
    
    // 应用筛选
    let filtered = [...mockData]
    
    if (searchForm.username) {
      filtered = filtered.filter(item => item.username.includes(searchForm.username))
    }
    if (searchForm.orderNo) {
      filtered = filtered.filter(item => item.orderNo.includes(searchForm.orderNo))
    }
    if (searchForm.payMethod) {
      filtered = filtered.filter(item => item.payMethod === searchForm.payMethod)
    }
    if (searchForm.status !== '') {
      filtered = filtered.filter(item => item.status === parseInt(searchForm.status))
    }
    
    // 分页
    total.value = filtered.length
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    tableData.value = filtered.slice(start, end)
    
    // 更新统计
    updateStatistics(mockData)
  } catch (error) {
    console.error('获取充值记录失败:', error)
    ElMessage.error('获取充值记录失败')
  } finally {
    loading.value = false
  }
}

// 更新统计数据
const updateStatistics = (data) => {
  const today = new Date().toDateString()
  const todayOrders = data.filter(item => new Date(item.createTime).toDateString() === today)
  
  statistics.value.todayCount = todayOrders.length
  statistics.value.todayAmount = todayOrders.reduce((sum, item) => sum + item.realAmount, 0)
  statistics.value.pendingCount = data.filter(item => item.status === 0).length
  
  const completedCount = data.filter(item => item.status === 1).length
  const totalCount = data.filter(item => item.status !== 2).length
  statistics.value.successRate = totalCount > 0 ? (completedCount / totalCount * 100) : 0
}

// 获取支付方式类型
const getPayMethodType = (method) => {
  const types = {
    'alipay': 'primary',
    'wechat': 'success',
    'binance': 'warning'
  }
  return types[method] || 'info'
}

// 获取支付方式文本
const getPayMethodText = (method) => {
  const texts = {
    'alipay': '支付宝',
    'wechat': '微信',
    'binance': 'USDT'
  }
  return texts[method] || method
}

// 获取状态类型
const getStatusType = (status) => {
  const types = ['warning', 'success', 'info', 'danger']
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = ['待支付', '已完成', '已取消', '已退款']
  return texts[status] || '未知'
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getRechargeList()
}

// 重置
const handleReset = () => {
  searchForm.username = ''
  searchForm.orderNo = ''
  searchForm.payMethod = ''
  searchForm.status = ''
  searchForm.dateRange = null
  handleSearch()
}

// 查看详情
const handleView = (row) => {
  currentOrder.value = row
  detailDialog.value = true
}

// 确认充值
const handleConfirm = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确认用户 ${row.username} 的充值订单 ${row.orderNo} 已支付？`,
      '确认充值',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    row.status = 1
    row.payTime = new Date().toLocaleString('zh-CN')
    ElMessage.success('充值确认成功')
    getRechargeList()
  } catch {
    // 用户取消
  }
}

// 取消订单
const handleCancel = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消订单 ${row.orderNo} 吗？`,
      '取消订单',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    row.status = 2
    ElMessage.success('订单已取消')
    getRechargeList()
  } catch {
    // 用户取消
  }
}

// 退款
const handleRefund = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要退款订单 ${row.orderNo} 吗？退款金额：¥${row.realAmount}`,
      '退款确认',
      {
        confirmButtonText: '确定退款',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    row.status = 3
    ElMessage.success('退款成功')
    getRechargeList()
  } catch {
    // 用户取消
  }
}

// 批量确认
const handleBatchConfirm = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要确认的订单')
    return
  }
  
  const pendingOrders = selectedRows.value.filter(row => row.status === 0)
  if (pendingOrders.length === 0) {
    ElMessage.warning('没有待确认的订单')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要批量确认 ${pendingOrders.length} 个订单吗？`,
      '批量确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    pendingOrders.forEach(order => {
      order.status = 1
      order.payTime = new Date().toLocaleString('zh-CN')
    })
    
    ElMessage.success(`成功确认 ${pendingOrders.length} 个订单`)
    getRechargeList()
  } catch {
    // 用户取消
  }
}

// 导出记录
const handleExport = () => {
  ElMessage.success('正在导出充值记录...')
  // 实际导出逻辑
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val
  getRechargeList()
}

// 当前页改变
const handleCurrentChange = (val) => {
  currentPage.value = val
  getRechargeList()
}

// 初始化
onMounted(() => {
  getRechargeList()
})
</script>

<style scoped>
.recharge-records {
  padding: 20px;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.el-pagination {
  margin-top: 20px;
  text-align: right;
}
</style>