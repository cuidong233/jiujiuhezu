<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>工单管理</span>
          <el-button type="primary" @click="handleAdd">新建工单</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="工单状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="审核中" value="reviewing" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item label="工单类型">
          <el-select v-model="searchForm.type" placeholder="请选择" clearable>
            <el-option label="账号问题" value="account" />
            <el-option label="充值问题" value="recharge" />
            <el-option label="退款申请" value="refund" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="searchForm.priority" placeholder="请选择" clearable>
            <el-option label="低" value="low" />
            <el-option label="普通" value="normal" />
            <el-option label="高" value="high" />
            <el-option label="紧急" value="urgent" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="orderNo" label="工单编号" width="150" />
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">{{ getTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="80">
          <template #default="{ row }">
            <el-tag :type="getPriorityTagType(row.priority)">{{ getPriorityName(row.priority) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">{{ getStatusName(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="userName" label="用户" width="100" />
        <el-table-column prop="assigneeName" label="处理人" width="100" />
        <el-table-column prop="createdTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleView(row)">查看</el-button>
            <el-button size="small" type="primary" link @click="handleReply(row)">回复</el-button>
            <el-button size="small" type="success" link @click="handleProcess(row)" v-if="row.status === 'pending'">处理</el-button>
            <el-button size="small" type="danger" link @click="handleClose(row)" v-if="row.status !== 'completed'">关闭</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px"
      />
    </el-card>

    <!-- 查看详情对话框 -->
    <el-dialog v-model="viewDialogVisible" title="工单详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="工单编号">{{ currentWork.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(currentWork.status)">{{ getStatusName(currentWork.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="标题" :span="2">{{ currentWork.title }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ getTypeName(currentWork.type) }}</el-descriptions-item>
        <el-descriptions-item label="优先级">
          <el-tag :type="getPriorityTagType(currentWork.priority)">{{ getPriorityName(currentWork.priority) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="用户">{{ currentWork.userName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentWork.userPhone }}</el-descriptions-item>
        <el-descriptions-item label="处理人">{{ currentWork.assigneeName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentWork.createdTime }}</el-descriptions-item>
        <el-descriptions-item label="问题描述" :span="2">{{ currentWork.description }}</el-descriptions-item>
        <el-descriptions-item label="回复内容" :span="2">{{ currentWork.reply || '暂无回复' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 回复对话框 -->
    <el-dialog v-model="replyDialogVisible" title="回复工单" width="600px">
      <el-form :model="replyForm" label-width="100px">
        <el-form-item label="工单编号">
          <el-input v-model="replyForm.orderNo" disabled />
        </el-form-item>
        <el-form-item label="回复内容" required>
          <el-input
            v-model="replyForm.content"
            type="textarea"
            :rows="5"
            placeholder="请输入回复内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="replyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleReplySubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 新建工单对话框 -->
    <el-dialog v-model="addDialogVisible" title="新建工单" width="600px">
      <el-form :model="addForm" label-width="100px">
        <el-form-item label="标题" required>
          <el-input v-model="addForm.title" placeholder="请输入工单标题" />
        </el-form-item>
        <el-form-item label="类型" required>
          <el-select v-model="addForm.type" placeholder="请选择工单类型">
            <el-option label="账号问题" value="account" />
            <el-option label="充值问题" value="recharge" />
            <el-option label="退款申请" value="refund" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" required>
          <el-select v-model="addForm.priority" placeholder="请选择优先级">
            <el-option label="低" value="low" />
            <el-option label="普通" value="normal" />
            <el-option label="高" value="high" />
            <el-option label="紧急" value="urgent" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户信息" required>
          <el-input v-model="addForm.userName" placeholder="用户姓名" style="width: 48%; margin-right: 2%" />
          <el-input v-model="addForm.userPhone" placeholder="联系电话" style="width: 48%" />
        </el-form-item>
        <el-form-item label="问题描述" required>
          <el-input
            v-model="addForm.description"
            type="textarea"
            :rows="5"
            placeholder="请详细描述问题"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  status: '',
  type: '',
  priority: ''
})

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 当前工单
const currentWork = ref({})

// 对话框
const viewDialogVisible = ref(false)
const replyDialogVisible = ref(false)
const addDialogVisible = ref(false)

// 回复表单
const replyForm = reactive({
  workId: '',
  orderNo: '',
  content: ''
})

// 新建表单
const addForm = reactive({
  title: '',
  type: 'account',
  priority: 'normal',
  userName: '',
  userPhone: '',
  description: ''
})

// 获取工单列表
const getWorkList = async () => {
  loading.value = true
  try {
    // 模拟API调用
    const response = await fetch(`/api/work/list?page=${pagination.page}&pageSize=${pagination.pageSize}&status=${searchForm.status}&type=${searchForm.type}&priority=${searchForm.priority}`)
    const result = await response.json()
    
    if (result.code === 0) {
      tableData.value = result.data.list
      pagination.total = result.data.total
    }
  } catch (error) {
    ElMessage.error('获取工单列表失败')
  } finally {
    loading.value = false
  }
}

// 查询
const handleSearch = () => {
  pagination.page = 1
  getWorkList()
}

// 重置
const handleReset = () => {
  searchForm.status = ''
  searchForm.type = ''
  searchForm.priority = ''
  handleSearch()
}

// 分页改变
const handleSizeChange = () => {
  getWorkList()
}

const handleCurrentChange = () => {
  getWorkList()
}

// 查看详情
const handleView = (row) => {
  currentWork.value = row
  viewDialogVisible.value = true
}

// 回复
const handleReply = (row) => {
  replyForm.workId = row.id
  replyForm.orderNo = row.orderNo
  replyForm.content = ''
  replyDialogVisible.value = true
}

// 提交回复
const handleReplySubmit = async () => {
  if (!replyForm.content) {
    ElMessage.warning('请输入回复内容')
    return
  }
  
  try {
    // 模拟API调用
    const response = await fetch('/api/work/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workId: replyForm.workId,
        content: replyForm.content,
        operator: 'admin',
        operatorId: 'admin'
      })
    })
    const result = await response.json()
    
    if (result.code === 0) {
      ElMessage.success('回复成功')
      replyDialogVisible.value = false
      getWorkList()
    }
  } catch (error) {
    ElMessage.error('回复失败')
  }
}

// 处理工单
const handleProcess = async (row) => {
  try {
    const response = await fetch(`/api/work/${row.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'processing'
      })
    })
    const result = await response.json()
    
    if (result.code === 0) {
      ElMessage.success('工单已开始处理')
      getWorkList()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 关闭工单
const handleClose = (row) => {
  ElMessageBox.confirm('确定要关闭该工单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await fetch(`/api/work/${row.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          closedTime: new Date().toISOString()
        })
      })
      const result = await response.json()
      
      if (result.code === 0) {
        ElMessage.success('工单已关闭')
        getWorkList()
      }
    } catch (error) {
      ElMessage.error('操作失败')
    }
  })
}

// 新建工单
const handleAdd = () => {
  Object.assign(addForm, {
    title: '',
    type: 'account',
    priority: 'normal',
    userName: '',
    userPhone: '',
    description: ''
  })
  addDialogVisible.value = true
}

// 提交新建
const handleAddSubmit = async () => {
  if (!addForm.title || !addForm.userName || !addForm.userPhone || !addForm.description) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  try {
    const response = await fetch('/api/work/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addForm)
    })
    const result = await response.json()
    
    if (result.code === 0) {
      ElMessage.success('工单创建成功')
      addDialogVisible.value = false
      getWorkList()
    }
  } catch (error) {
    ElMessage.error('创建失败')
  }
}

// 辅助函数
const getStatusName = (status) => {
  const map = {
    pending: '待处理',
    processing: '处理中',
    reviewing: '审核中',
    completed: '已完成'
  }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = {
    pending: 'warning',
    processing: '',
    reviewing: 'info',
    completed: 'success'
  }
  return map[status] || ''
}

const getTypeName = (type) => {
  const map = {
    account: '账号问题',
    recharge: '充值问题',
    refund: '退款申请',
    other: '其他'
  }
  return map[type] || type
}

const getTypeTagType = (type) => {
  const map = {
    account: '',
    recharge: 'warning',
    refund: 'danger',
    other: 'info'
  }
  return map[type] || ''
}

const getPriorityName = (priority) => {
  const map = {
    low: '低',
    normal: '普通',
    high: '高',
    urgent: '紧急'
  }
  return map[priority] || priority
}

const getPriorityTagType = (priority) => {
  const map = {
    low: 'info',
    normal: '',
    high: 'warning',
    urgent: 'danger'
  }
  return map[priority] || ''
}

// 初始化
onMounted(() => {
  getWorkList()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}
</style>