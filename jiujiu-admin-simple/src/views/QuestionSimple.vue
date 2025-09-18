<template>
  <div class="question-simple">
    <el-card>
      <div class="header-section">
        <h3>问题管理</h3>
        <div class="header-actions">
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索问题..." 
            clearable
            style="width: 300px"
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 添加问题
          </el-button>
        </div>
      </div>

      <!-- 问题列表展示改为卡片形式 -->
      <div class="questions-container">
        <div 
          v-for="item in paginatedQuestions" 
          :key="item.id"
          class="question-card"
        >
          <div class="card-header">
            <div class="title-section">
              <h4>{{ item.title }}</h4>
              <div class="tags">
                <el-tag size="small" type="info">{{ item.categoryName }}</el-tag>
                <el-tag v-if="item.isTop" size="small" type="danger">置顶</el-tag>
                <el-tag v-if="item.isHot" size="small" type="warning">热门</el-tag>
                <el-tag 
                  :type="item.status === 'active' ? 'success' : 'info'" 
                  size="small"
                >
                  {{ item.status === 'active' ? '启用' : '停用' }}
                </el-tag>
              </div>
            </div>
            <div class="actions">
              <el-button type="primary" text @click="handleEdit(item)">
                <el-icon><Edit /></el-icon> 编辑
              </el-button>
              <el-button type="danger" text @click="handleDelete(item)">
                <el-icon><Delete /></el-icon> 删除
              </el-button>
            </div>
          </div>
          
          <div class="card-body">
            <div class="question-section">
              <label>问题：</label>
              <p>{{ item.question || item.title }}</p>
            </div>
            <div class="answer-section">
              <label>答案：</label>
              <p>{{ item.answer }}</p>
            </div>
          </div>
          
        </div>
      </div>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[5, 10, 20, 50]"
        :total="totalQuestions"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        style="margin-top: 20px; justify-content: center"
      />
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog 
      v-model="editDialogVisible" 
      :title="isEditMode ? '编辑问题' : '添加问题'" 
      width="800px"
      destroy-on-close
    >
      <el-form 
        ref="editFormRef" 
        :model="editForm" 
        :rules="formRules" 
        label-width="100px"
      >
        <el-form-item label="问题标题" prop="title">
          <el-input 
            v-model="editForm.title" 
            placeholder="请输入问题标题（简短概括）" 
          />
        </el-form-item>
        
        <el-form-item label="问题分类" prop="category">
          <el-select v-model="editForm.category" placeholder="请选择分类" style="width: 100%">
            <el-option 
              v-for="cat in categories" 
              :key="cat.code" 
              :label="cat.name" 
              :value="cat.code"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="详细问题" prop="question">
          <el-input 
            v-model="editForm.question" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入完整的问题描述"
          />
        </el-form-item>
        
        <el-form-item label="答案管理" prop="answer">
          <div class="answer-editor">
            <el-input 
              v-model="editForm.answer" 
              type="textarea" 
              :rows="8" 
              placeholder="请输入详细的答案内容（支持多段落）"
              show-word-limit
              maxlength="2000"
            />
            <div class="editor-toolbar">
              <el-button size="small" @click="insertTemplate('step')">插入步骤模板</el-button>
              <el-button size="small" @click="insertTemplate('list')">插入列表模板</el-button>
              <el-button size="small" @click="clearAnswer">清空答案</el-button>
            </div>
          </div>
        </el-form-item>
        
        <el-form-item label="关键词">
          <div class="keywords-container">
            <el-tag
              v-for="(tag, index) in editForm.keywords"
              :key="index"
              closable
              style="margin-right: 10px; margin-bottom: 10px"
              @close="removeKeyword(index)"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-if="keywordInputVisible"
              ref="keywordInputRef"
              v-model="keywordInputValue"
              size="small"
              style="width: 120px"
              @keyup.enter="handleKeywordConfirm"
              @blur="handleKeywordConfirm"
            />
            <el-button
              v-else
              size="small"
              @click="showKeywordInput"
            >
              + 添加关键词
            </el-button>
          </div>
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="排序">
              <el-input-number v-model="editForm.order" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态">
              <el-radio-group v-model="editForm.status">
                <el-radio value="active">启用</el-radio>
                <el-radio value="inactive">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="标记">
              <el-checkbox v-model="editForm.isTop">置顶</el-checkbox>
              <el-checkbox v-model="editForm.isHot" style="margin-left: 20px">热门</el-checkbox>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saveLoading">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Edit, Delete, Plus } from '@element-plus/icons-vue'
import request from '@/utils/request'

const loading = ref(false)
const saveLoading = ref(false)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const questions = ref([])
const categories = ref([])
const editDialogVisible = ref(false)
const editFormRef = ref()
const keywordInputVisible = ref(false)
const keywordInputValue = ref('')
const keywordInputRef = ref()
const isEditMode = ref(false)

const editForm = ref({
  id: '',
  title: '',
  category: '',
  question: '',
  answer: '',
  keywords: [],
  order: 0,
  status: 'active',
  isTop: false,
  isHot: false
})

const formRules = {
  title: [
    { required: true, message: '请输入问题标题', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择问题分类', trigger: 'change' }
  ],
  question: [
    { required: true, message: '请输入问题内容', trigger: 'blur' }
  ],
  answer: [
    { required: true, message: '请输入答案内容', trigger: 'blur' }
  ]
}

const filteredQuestions = computed(() => {
  if (!searchKeyword.value) return questions.value
  
  const keyword = searchKeyword.value.toLowerCase()
  return questions.value.filter(q => 
    q.title.toLowerCase().includes(keyword) ||
    q.question.toLowerCase().includes(keyword) ||
    q.answer.toLowerCase().includes(keyword) ||
    (q.keywords && q.keywords.some(k => k.toLowerCase().includes(keyword)))
  )
})

const totalQuestions = computed(() => filteredQuestions.value.length)

const paginatedQuestions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredQuestions.value.slice(start, end)
})

const fetchQuestions = async () => {
  loading.value = true
  try {
    console.log('开始获取问题列表...')
    const response = await request({
      url: '/api/question/list',
      method: 'get',
      params: {
        page: 1,
        pageSize: 1000
      }
    })
    
    console.log('API响应:', response)
    
    if (response.code === 0 || response.code === 200) {
      questions.value = response.data?.list || []
      console.log('获取到问题数量:', questions.value.length)
      
      if (questions.value.length === 0) {
        ElMessage.info('暂无问题数据')
      }
    } else {
      console.error('API返回错误:', response)
      ElMessage.error(response.message || '获取问题列表失败')
    }
  } catch (error) {
    console.error('获取问题列表失败:', error)
    ElMessage.error('获取问题列表失败')
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    console.log('开始获取分类列表...')
    const response = await request({
      url: '/api/question/categories',
      method: 'get'
    })
    
    console.log('分类API响应:', response)
    
    if (response.code === 0 || response.code === 200) {
      categories.value = response.data || []
      console.log('获取到分类数量:', categories.value.length)
      
      // 如果没有分类，添加一些默认分类
      if (categories.value.length === 0) {
        categories.value = [
          { code: 'recharge', name: '充值相关' },
          { code: 'refund', name: '退款相关' },
          { code: 'account', name: '账户相关' },
          { code: 'order', name: '订单相关' },
          { code: 'other', name: '其他问题' }
        ]
      }
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    // 设置默认分类
    categories.value = [
      { code: 'recharge', name: '充值相关' },
      { code: 'refund', name: '退款相关' },
      { code: 'account', name: '账户相关' },
      { code: 'order', name: '订单相关' },
      { code: 'other', name: '其他问题' }
    ]
  }
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handlePageChange = (val) => {
  currentPage.value = val
}

const handleAdd = () => {
  isEditMode.value = false
  editForm.value = {
    id: '',
    title: '',
    category: '',
    question: '',
    answer: '',
    keywords: [],
    order: 0,
    status: 'active',
    isTop: false,
    isHot: false
  }
  editDialogVisible.value = true
}

const handleEdit = (row) => {
  isEditMode.value = true
  editForm.value = {
    id: row.id,
    title: row.title,
    category: row.category,
    question: row.question,
    answer: row.answer,
    keywords: row.keywords || [],
    order: row.order || 0,
    status: row.status,
    isTop: row.isTop || false,
    isHot: row.isHot || false
  }
  editDialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除问题"${row.title}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await request({
      url: `/api/question/${row.id}`,
      method: 'delete'
    })
    
    if (response.code === 0 || response.code === 200) {
      ElMessage.success('删除成功')
      await fetchQuestions()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleSave = async () => {
  const valid = await editFormRef.value.validate().catch(() => false)
  if (!valid) return
  
  saveLoading.value = true
  try {
    const categoryObj = categories.value.find(c => c.code === editForm.value.category)
    const data = {
      ...editForm.value,
      categoryName: categoryObj ? categoryObj.name : ''
    }
    
    const url = isEditMode.value 
      ? `/api/question/${editForm.value.id}`
      : '/api/question/create'
    
    const method = isEditMode.value ? 'put' : 'post'
    
    console.log('保存问题数据:', { url, method, data })
    
    const response = await request({
      url,
      method,
      data
    })
    
    console.log('保存响应:', response)
    
    if (response.code === 0 || response.code === 200) {
      ElMessage.success(isEditMode.value ? '更新成功' : '添加成功')
      editDialogVisible.value = false
      await fetchQuestions()
    } else {
      ElMessage.error(response.message || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    saveLoading.value = false
  }
}

const insertTemplate = (type) => {
  let template = ''
  if (type === 'step') {
    template = '\n\n步骤1：\n步骤2：\n步骤3：\n'
  } else if (type === 'list') {
    template = '\n\n• 第一点\n• 第二点\n• 第三点\n'
  }
  editForm.value.answer += template
}

const clearAnswer = () => {
  ElMessageBox.confirm('确定要清空答案内容吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    editForm.value.answer = ''
  }).catch(() => {})
}

const showKeywordInput = () => {
  keywordInputVisible.value = true
  nextTick(() => {
    keywordInputRef.value?.focus()
  })
}

const handleKeywordConfirm = () => {
  if (keywordInputValue.value && !editForm.value.keywords.includes(keywordInputValue.value)) {
    editForm.value.keywords.push(keywordInputValue.value)
  }
  keywordInputVisible.value = false
  keywordInputValue.value = ''
}

const removeKeyword = (index) => {
  editForm.value.keywords.splice(index, 1)
}

onMounted(() => {
  fetchQuestions()
  fetchCategories()
})
</script>

<style scoped>
.question-simple {
  padding: 20px;
}

.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.header-section h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.questions-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
}

.question-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  background: #fff;
  transition: all 0.3s;
}

.question-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.title-section h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.tags {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.actions {
  display: flex;
  gap: 10px;
}

.card-body {
  
}

.question-section,
.answer-section {
  margin-bottom: 12px;
}

.question-section label,
.answer-section label {
  font-weight: 600;
  color: #606266;
  display: inline-block;
  margin-bottom: 5px;
}

.question-section p,
.answer-section p {
  margin: 0;
  color: #303133;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.answer-section p {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
}


.answer-editor {
  width: 100%;
}

.editor-toolbar {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

.keywords-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

:deep(.el-dialog__body) {
  max-height: 70vh;
  overflow-y: auto;
}
</style>