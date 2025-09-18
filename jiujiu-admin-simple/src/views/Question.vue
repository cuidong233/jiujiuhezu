<template>
  <div class="question-management">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="问题分类">
          <el-select v-model="searchForm.category" placeholder="请选择" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option v-for="cat in categories" :key="cat.code" :label="cat.name" :value="cat.code"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="启用" value="active"></el-option>
            <el-option label="停用" value="inactive"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="请输入关键词" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">添加Q&A</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="Q&A列表" name="list">
        <el-table :data="questionList" border style="width: 100%" v-loading="loading">
          <el-table-column prop="order" label="排序" width="80">
            <template #default="{ row }">
              <el-input-number v-model="row.order" :min="1" size="small" @change="handleOrderChange(row)" />
            </template>
          </el-table-column>
          <el-table-column prop="title" label="问题标题" min-width="200" show-overflow-tooltip />
          <el-table-column prop="categoryName" label="分类" width="100" />
          <el-table-column prop="views" label="浏览量" width="90" />
          <el-table-column prop="helpful" label="有用" width="80">
            <template #default="{ row }">
              <span style="color: #67c23a">{{ row.helpful }}</span>
            </template>
          </el-table-column>
          <el-table-column label="标签" width="120">
            <template #default="{ row }">
              <el-tag v-if="row.isTop" type="danger" size="small">置顶</el-tag>
              <el-tag v-if="row.isHot" type="warning" size="small" style="margin-left: 5px">热门</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-switch v-model="row.status" active-value="active" inactive-value="inactive" @change="handleStatusChange(row)" />
            </template>
          </el-table-column>
          <el-table-column prop="updatedTime" label="更新时间" width="160" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
              <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

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
      </el-tab-pane>

      <el-tab-pane label="分类管理" name="categories">
        <el-button type="primary" style="margin-bottom: 20px" @click="handleAddCategory">添加分类</el-button>
        <el-table :data="categories" border style="width: 100%">
          <el-table-column prop="order" label="排序" width="80" />
          <el-table-column prop="name" label="分类名称" />
          <el-table-column prop="code" label="分类代码" />
          <el-table-column prop="description" label="描述" />
          <el-table-column prop="questionCount" label="问题数" width="80" />
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'info'">
                {{ row.status === 'active' ? '启用' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleEditCategory(row)">编辑</el-button>
              <el-button type="danger" link size="small" @click="handleDeleteCategory(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="统计分析" name="statistics">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card>
              <el-statistic title="问题总数" :value="statistics.totalQuestions" />
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card>
              <el-statistic title="总浏览量" :value="statistics.totalViews" />
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card>
              <el-statistic title="有用反馈" :value="statistics.totalHelpful" suffix="次" />
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card>
              <el-statistic title="平均满意度" :value="statistics.satisfaction" suffix="%" />
            </el-card>
          </el-col>
        </el-row>

        <el-card style="margin-top: 20px">
          <template #header>
            <span>热门问题TOP10</span>
          </template>
          <el-table :data="hotQuestions" border>
            <el-table-column type="index" label="排名" width="60" />
            <el-table-column prop="title" label="问题" />
            <el-table-column prop="views" label="浏览量" width="100" />
            <el-table-column prop="helpful" label="有用数" width="100" />
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 添加/编辑Q&A对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="问题标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入问题标题" />
        </el-form-item>
        <el-form-item label="问题分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类">
            <el-option v-for="cat in categories" :key="cat.code" :label="cat.name" :value="cat.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="问题内容" prop="question">
          <el-input v-model="form.question" type="textarea" :rows="3" placeholder="请输入用户的问题描述" />
        </el-form-item>
        <el-form-item label="答案内容" prop="answer">
          <el-input v-model="form.answer" type="textarea" :rows="6" placeholder="请输入问题的答案" />
        </el-form-item>
        <el-form-item label="关键词">
          <el-tag v-for="tag in form.keywords" :key="tag" closable @close="removeKeyword(tag)" style="margin-right: 10px">
            {{ tag }}
          </el-tag>
          <el-input
            v-if="keywordInputVisible"
            ref="keywordInputRef"
            v-model="keywordInputValue"
            size="small"
            style="width: 100px"
            @keyup.enter="handleKeywordInputConfirm"
            @blur="handleKeywordInputConfirm"
          />
          <el-button v-else size="small" @click="showKeywordInput">+ 添加关键词</el-button>
        </el-form-item>
        <el-form-item label="设置">
          <el-checkbox v-model="form.isTop">置顶</el-checkbox>
          <el-checkbox v-model="form.isHot" style="margin-left: 20px">热门</el-checkbox>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.order" :min="1" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="inactive">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog v-model="viewDialogVisible" title="Q&A详情" width="700px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="问题标题">{{ currentQuestion.title }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ currentQuestion.categoryName }}</el-descriptions-item>
        <el-descriptions-item label="问题内容">{{ currentQuestion.question }}</el-descriptions-item>
        <el-descriptions-item label="答案">
          <div style="white-space: pre-wrap">{{ currentQuestion.answer }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="关键词">
          <el-tag v-for="keyword in currentQuestion.keywords" :key="keyword" style="margin-right: 5px">
            {{ keyword }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="统计">
          浏览：{{ currentQuestion.views }} | 有用：{{ currentQuestion.helpful }} | 无用：{{ currentQuestion.notHelpful }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentQuestion.updatedTime }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 配置API基础URL
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3002'

const activeTab = ref('list')
const loading = ref(false)

// 搜索表单
const searchForm = reactive({
  category: '',
  status: '',
  keyword: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 列表数据
const questionList = ref([])
const categories = ref([])
const hotQuestions = ref([])

// 统计数据
const statistics = reactive({
  totalQuestions: 0,
  totalViews: 0,
  totalHelpful: 0,
  satisfaction: 95.5
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('添加Q&A')
const viewDialogVisible = ref(false)
const currentQuestion = ref({})

// 表单
const formRef = ref()
const form = reactive({
  id: '',
  title: '',
  category: '',
  question: '',
  answer: '',
  keywords: [],
  isTop: false,
  isHot: false,
  order: 1,
  status: 'active'
})

// 表单验证规则
const rules = {
  title: [{ required: true, message: '请输入问题标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  question: [{ required: true, message: '请输入问题内容', trigger: 'blur' }],
  answer: [{ required: true, message: '请输入答案内容', trigger: 'blur' }]
}

// 关键词输入
const keywordInputVisible = ref(false)
const keywordInputValue = ref('')
const keywordInputRef = ref()

// 获取问题列表
const getQuestionList = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: pagination.page,
      pageSize: pagination.pageSize,
      category: searchForm.category,
      status: searchForm.status,
      keyword: searchForm.keyword
    })
    
    const response = await fetch(`${baseURL}/api/question/list?${params}`)
    const result = await response.json()
    
    if (result.code === 0) {
      questionList.value = result.data.list
      pagination.total = result.data.total
      
      // 更新统计
      statistics.totalQuestions = result.data.total
      statistics.totalViews = result.data.list.reduce((sum, item) => sum + item.views, 0)
      statistics.totalHelpful = result.data.list.reduce((sum, item) => sum + item.helpful, 0)
    }
  } catch (error) {
    console.error('获取问题列表失败:', error)
    // 使用模拟数据
    questionList.value = [
      {
        id: '1',
        title: '如何充值到账户？',
        category: 'recharge',
        categoryName: '充值相关',
        question: '请问如何给我的账户充值？',
        answer: '您可以通过支付宝、微信、银行卡等方式充值...',
        keywords: ['充值', '支付'],
        views: 1580,
        helpful: 423,
        notHelpful: 5,
        status: 'active',
        isTop: true,
        isHot: true,
        order: 1,
        updatedTime: '2024-12-01 10:00:00'
      }
    ]
    pagination.total = 1
  } finally {
    loading.value = false
  }
}

// 获取分类列表
const getCategories = async () => {
  try {
    const response = await fetch(`${baseURL}/api/question/categories`)
    const result = await response.json()
    
    if (result.code === 0) {
      categories.value = result.data
    }
  } catch (error) {
    console.error('获取分类失败:', error)
    // 使用模拟数据
    categories.value = [
      { id: '1', code: 'recharge', name: '充值相关', description: '充值问题', order: 1, questionCount: 5, status: 'active' },
      { id: '2', code: 'withdraw', name: '提现相关', description: '提现问题', order: 2, questionCount: 3, status: 'active' },
      { id: '3', code: 'vip', name: 'VIP相关', description: 'VIP问题', order: 3, questionCount: 2, status: 'active' }
    ]
  }
}

// 获取热门问题
const getHotQuestions = () => {
  hotQuestions.value = questionList.value
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)
}

// 查询
const handleSearch = () => {
  pagination.page = 1
  getQuestionList()
}

// 重置
const handleReset = () => {
  searchForm.category = ''
  searchForm.status = ''
  searchForm.keyword = ''
  handleSearch()
}

// 添加Q&A
const handleAdd = () => {
  dialogTitle.value = '添加Q&A'
  Object.assign(form, {
    id: '',
    title: '',
    category: '',
    question: '',
    answer: '',
    keywords: [],
    isTop: false,
    isHot: false,
    order: 1,
    status: 'active'
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑Q&A'
  Object.assign(form, {
    id: row.id,
    title: row.title,
    category: row.category,
    question: row.question,
    answer: row.answer,
    keywords: row.keywords || [],
    isTop: row.isTop,
    isHot: row.isHot,
    order: row.order,
    status: row.status
  })
  dialogVisible.value = true
}

// 查看
const handleView = (row) => {
  currentQuestion.value = row
  viewDialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这个Q&A吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await fetch(`${baseURL}/api/question/${row.id}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      
      if (result.code === 0) {
        ElMessage.success('删除成功')
        getQuestionList()
      }
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  await formRef.value.validate()
  
  try {
    const url = form.id ? `${baseURL}/api/question/${form.id}` : `${baseURL}/api/question/create`
    const method = form.id ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const result = await response.json()
    
    if (result.code === 0) {
      ElMessage.success(form.id ? '更新成功' : '添加成功')
      dialogVisible.value = false
      getQuestionList()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 状态切换
const handleStatusChange = async (row) => {
  try {
    const response = await fetch(`${baseURL}/api/question/${row.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: row.status })
    })
    const result = await response.json()
    
    if (result.code === 0) {
      ElMessage.success('状态更新成功')
    }
  } catch (error) {
    ElMessage.error('状态更新失败')
  }
}

// 排序改变
const handleOrderChange = async (row) => {
  try {
    const response = await fetch(`${baseURL}/api/question/${row.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: row.order })
    })
    const result = await response.json()
    
    if (result.code === 0) {
      ElMessage.success('排序更新成功')
      getQuestionList()
    }
  } catch (error) {
    ElMessage.error('排序更新失败')
  }
}

// 关键词相关
const showKeywordInput = () => {
  keywordInputVisible.value = true
  nextTick(() => {
    keywordInputRef.value?.focus()
  })
}

const handleKeywordInputConfirm = () => {
  if (keywordInputValue.value && !form.keywords.includes(keywordInputValue.value)) {
    form.keywords.push(keywordInputValue.value)
  }
  keywordInputVisible.value = false
  keywordInputValue.value = ''
}

const removeKeyword = (tag) => {
  form.keywords = form.keywords.filter(k => k !== tag)
}

// 分类管理
const handleAddCategory = () => {
  ElMessage.info('添加分类功能开发中')
}

const handleEditCategory = (row) => {
  ElMessage.info('编辑分类功能开发中')
}

const handleDeleteCategory = (row) => {
  ElMessage.info('删除分类功能开发中')
}

// 分页
const handleSizeChange = () => {
  getQuestionList()
}

const handleCurrentChange = () => {
  getQuestionList()
}

// 初始化
onMounted(() => {
  getQuestionList()
  getCategories()
  getHotQuestions()
})
</script>

<style scoped>
.question-management {
  padding: 20px;
  background: var(--bg-color);
  min-height: calc(100vh - 60px);
}

.search-card {
  margin-bottom: 20px;
  background: var(--card-bg);
}

.el-tabs {
  background: var(--card-bg);
  padding: 20px;
  border-radius: 8px;
  box-shadow: var(--shadow-light);
}

.el-pagination {
  margin-top: 20px;
  text-align: right;
}
</style>