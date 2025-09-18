<template>
  <div class="page-container">
    <!-- 文章列表 -->
    <el-card v-if="!showEditor">
      <template #header>
        <div class="header-container">
          <span>文章管理</span>
          <el-button type="primary" @click="handleCreate">新建文章</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input
              v-model="searchForm.search"
              placeholder="搜索文章标题、描述或标签"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-select v-model="searchForm.category" placeholder="选择分类" clearable @change="handleSearch">
              <el-option label="全部分类" value="" />
              <el-option label="教程指南" value="教程指南" />
              <el-option label="设备评测" value="设备评测" />
              <el-option label="家居影院" value="家居影院" />
              <el-option label="流媒体" value="流媒体" />
              <el-option label="技术文章" value="技术文章" />
              <el-option label="新闻资讯" value="新闻资讯" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="searchForm.status" placeholder="选择状态" clearable @change="handleSearch">
              <el-option label="全部状态" value="" />
              <el-option label="草稿" value="draft" />
              <el-option label="已发布" value="published" />
              <el-option label="已归档" value="archived" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="searchForm.featured" placeholder="是否推荐" clearable @change="handleSearch">
              <el-option label="全部" value="" />
              <el-option label="推荐" value="true" />
              <el-option label="普通" value="false" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 文章表格 -->
      <el-table
        :data="articles"
        v-loading="loading"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="封面" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.image"
              :src="row.image"
              style="width: 60px; height: 40px"
              fit="cover"
            />
            <span v-else>无封面</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200">
          <template #default="{ row }">
            <div>
              <div style="font-weight: 500">{{ row.title }}</div>
              <div v-if="row.subtitle" style="font-size: 12px; color: #999">{{ row.subtitle }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            <el-tag>{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="author_name" label="作者" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 'published' ? 'success' : row.status === 'draft' ? 'warning' : 'info'"
            >
              {{ row.status === 'published' ? '已发布' : row.status === 'draft' ? '草稿' : '已归档' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="推荐" width="80">
          <template #default="{ row }">
            <el-switch
              v-model="row.is_featured"
              @change="handleFeatureChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="数据" width="150">
          <template #default="{ row }">
            <div style="font-size: 12px">
              <div>浏览: {{ row.views || 0 }}</div>
              <div>点赞: {{ row.likes || 0 }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="publish_date" label="发布时间" width="160">
          <template #default="{ row }">
            {{ row.publish_date ? formatDate(row.publish_date) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" size="small" link @click="handlePreview(row)">预览</el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">删除</el-button>
            <el-dropdown style="margin-left: 10px">
              <el-button size="small" link>更多</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleStatusChange(row, 'published')">
                    发布文章
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleStatusChange(row, 'draft')">
                    转为草稿
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleStatusChange(row, 'archived')">
                    归档文章
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleCopy(row)">
                    复制文章
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 批量操作 -->
      <div v-if="selectedArticles.length > 0" class="batch-operations">
        <el-button type="danger" @click="handleBatchDelete">批量删除 ({{ selectedArticles.length }})</el-button>
        <el-button @click="handleBatchStatusChange('published')">批量发布</el-button>
        <el-button @click="handleBatchStatusChange('draft')">批量转草稿</el-button>
      </div>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        style="margin-top: 20px"
      />
    </el-card>

    <!-- 文章编辑器 -->
    <el-card v-else>
      <template #header>
        <div class="header-container">
          <span>{{ editForm.id ? '编辑文章' : '新建文章' }}</span>
          <el-button @click="handleCancel">返回列表</el-button>
        </div>
      </template>

      <el-form ref="formRef" :model="editForm" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="16">
            <el-form-item label="文章标题" prop="title">
              <el-input v-model="editForm.title" placeholder="请输入文章标题" />
            </el-form-item>
            <el-form-item label="副标题">
              <el-input v-model="editForm.subtitle" placeholder="请输入副标题（可选）" />
            </el-form-item>
            <el-form-item label="文章描述">
              <el-input
                v-model="editForm.description"
                type="textarea"
                :rows="3"
                placeholder="请输入文章描述/摘要"
              />
            </el-form-item>
            <el-form-item label="文章内容" prop="content">
              <div class="editor-container">
                <el-input
                  v-model="editForm.content"
                  type="textarea"
                  :rows="20"
                  placeholder="请输入文章内容（支持HTML）"
                />
                <div class="editor-tips">
                  提示：支持HTML格式，可以使用富文本编辑器编辑后粘贴HTML代码
                </div>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="文章分类" prop="category">
              <el-select v-model="editForm.category" placeholder="选择分类">
                <el-option label="教程指南" value="教程指南" />
                <el-option label="设备评测" value="设备评测" />
                <el-option label="家居影院" value="家居影院" />
                <el-option label="流媒体" value="流媒体" />
                <el-option label="技术文章" value="技术文章" />
                <el-option label="新闻资讯" value="新闻资讯" />
              </el-select>
            </el-form-item>
            <el-form-item label="封面图">
              <el-upload
                class="avatar-uploader"
                :action="uploadUrl"
                :show-file-list="false"
                :on-success="handleUploadSuccess"
                :before-upload="beforeUpload"
                :headers="uploadHeaders"
              >
                <img v-if="editForm.image" :src="editForm.image" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
            <el-form-item label="作者名称">
              <el-input v-model="editForm.author_name" placeholder="请输入作者名称" />
            </el-form-item>
            <el-form-item label="作者头像">
              <el-input v-model="editForm.author_avatar" placeholder="作者头像URL" />
            </el-form-item>
            <el-form-item label="阅读时间">
              <el-input v-model="editForm.read_time" placeholder="如：5分钟" />
            </el-form-item>
            <el-form-item label="文章状态">
              <el-radio-group v-model="editForm.status">
                <el-radio label="draft">草稿</el-radio>
                <el-radio label="published">发布</el-radio>
                <el-radio label="archived">归档</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="是否推荐">
              <el-switch v-model="editForm.is_featured" />
            </el-form-item>
            <el-form-item label="排序顺序">
              <el-input-number v-model="editForm.sort_order" :min="0" />
            </el-form-item>
            <el-form-item label="标签">
              <el-input
                v-model="editForm.tags"
                placeholder="多个标签用逗号分隔"
              />
            </el-form-item>
            <el-form-item label="SEO标题">
              <el-input v-model="editForm.meta_title" placeholder="SEO标题" />
            </el-form-item>
            <el-form-item label="SEO描述">
              <el-input
                v-model="editForm.meta_description"
                type="textarea"
                :rows="2"
                placeholder="SEO描述"
              />
            </el-form-item>
            <el-form-item label="SEO关键词">
              <el-input v-model="editForm.meta_keywords" placeholder="SEO关键词，逗号分隔" />
            </el-form-item>
            <el-form-item label="相关文章">
              <el-input
                v-model="editForm.related_articles"
                placeholder="相关文章ID，逗号分隔"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" @click="handleSave">保存</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api'

// 数据状态
const loading = ref(false)
const articles = ref([])
const selectedArticles = ref([])
const showEditor = ref(false)
const formRef = ref(null)

// 搜索表单
const searchForm = reactive({
  search: '',
  category: '',
  status: '',
  featured: ''
})

// 分页
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

// 编辑表单
const editForm = reactive({
  id: null,
  title: '',
  subtitle: '',
  description: '',
  content: '',
  category: '教程指南',
  image: '',
  author_name: '管理员',
  author_avatar: '',
  read_time: '5分钟',
  status: 'draft',
  tags: '',
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  sort_order: 0,
  is_featured: false,
  related_articles: ''
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 2, max: 255, message: '标题长度在 2 到 255 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择文章分类', trigger: 'change' }
  ]
}

// 上传配置
const uploadUrl = computed(() => `${API_BASE_URL}/articles/upload`)
const uploadHeaders = computed(() => {
  const token = localStorage.getItem('adminToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
})

// 获取文章列表
const fetchArticles = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...searchForm
    }
    const response = await axios.get(`${API_BASE_URL}/articles`, { 
      params,
      headers: uploadHeaders.value
    })
    if (response.data.success) {
      articles.value = response.data.data.articles
      pagination.total = response.data.data.pagination.total
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
    ElMessage.error('获取文章列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchArticles()
}

// 重置搜索
const handleReset = () => {
  searchForm.search = ''
  searchForm.category = ''
  searchForm.status = ''
  searchForm.featured = ''
  handleSearch()
}

// 分页变化
const handlePageChange = (page) => {
  pagination.page = page
  fetchArticles()
}

const handleSizeChange = (size) => {
  pagination.limit = size
  pagination.page = 1
  fetchArticles()
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedArticles.value = selection
}

// 创建文章
const handleCreate = () => {
  // 重置表单
  Object.keys(editForm).forEach(key => {
    if (key === 'id') editForm[key] = null
    else if (key === 'category') editForm[key] = '教程指南'
    else if (key === 'author_name') editForm[key] = '管理员'
    else if (key === 'read_time') editForm[key] = '5分钟'
    else if (key === 'status') editForm[key] = 'draft'
    else if (key === 'sort_order') editForm[key] = 0
    else if (key === 'is_featured') editForm[key] = false
    else editForm[key] = ''
  })
  showEditor.value = true
}

// 编辑文章
const handleEdit = (row) => {
  Object.keys(editForm).forEach(key => {
    editForm[key] = row[key] || (key === 'is_featured' ? false : '')
  })
  showEditor.value = true
}

// 保存文章
const handleSave = async () => {
  await formRef.value.validate()
  
  try {
    const url = editForm.id 
      ? `${API_BASE_URL}/articles/${editForm.id}`
      : `${API_BASE_URL}/articles`
    
    const method = editForm.id ? 'put' : 'post'
    
    const response = await axios[method](url, editForm, {
      headers: uploadHeaders.value
    })
    
    if (response.data.success) {
      ElMessage.success(editForm.id ? '文章更新成功' : '文章创建成功')
      showEditor.value = false
      fetchArticles()
    }
  } catch (error) {
    console.error('保存文章失败:', error)
    ElMessage.error('保存文章失败')
  }
}

// 取消编辑
const handleCancel = () => {
  showEditor.value = false
}

// 删除文章
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除文章「${row.title}」吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/articles/${row.id}`, {
        headers: uploadHeaders.value
      })
      if (response.data.success) {
        ElMessage.success('删除成功')
        fetchArticles()
      }
    } catch (error) {
      console.error('删除文章失败:', error)
      ElMessage.error('删除文章失败')
    }
  })
}

// 批量删除
const handleBatchDelete = () => {
  const ids = selectedArticles.value.map(item => item.id)
  ElMessageBox.confirm(
    `确定要删除选中的 ${ids.length} 篇文章吗？`,
    '批量删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/articles/batch-delete`, 
        { ids },
        { headers: uploadHeaders.value }
      )
      if (response.data.success) {
        ElMessage.success(response.data.message)
        fetchArticles()
      }
    } catch (error) {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  })
}

// 更改状态
const handleStatusChange = async (row, status) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/articles/${row.id}/status`,
      { status },
      { headers: uploadHeaders.value }
    )
    if (response.data.success) {
      ElMessage.success('状态更新成功')
      fetchArticles()
    }
  } catch (error) {
    console.error('更新状态失败:', error)
    ElMessage.error('更新状态失败')
  }
}

// 批量更改状态
const handleBatchStatusChange = async (status) => {
  const ids = selectedArticles.value.map(item => item.id)
  try {
    for (const id of ids) {
      await axios.patch(
        `${API_BASE_URL}/articles/${id}/status`,
        { status },
        { headers: uploadHeaders.value }
      )
    }
    ElMessage.success('批量更新状态成功')
    fetchArticles()
  } catch (error) {
    console.error('批量更新状态失败:', error)
    ElMessage.error('批量更新状态失败')
  }
}

// 更改推荐状态
const handleFeatureChange = async (row) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/articles/${row.id}`,
      { ...row, is_featured: row.is_featured },
      { headers: uploadHeaders.value }
    )
    if (response.data.success) {
      ElMessage.success(row.is_featured ? '已设为推荐' : '已取消推荐')
    }
  } catch (error) {
    console.error('更新推荐状态失败:', error)
    ElMessage.error('更新推荐状态失败')
    row.is_featured = !row.is_featured // 恢复原状态
  }
}

// 预览文章
const handlePreview = (row) => {
  window.open(`http://localhost:3001/article/${row.id}`, '_blank')
}

// 复制文章
const handleCopy = async (row) => {
  const copyData = { ...row }
  delete copyData.id
  copyData.title = copyData.title + ' (副本)'
  copyData.status = 'draft'
  copyData.views = 0
  copyData.likes = 0
  
  try {
    const response = await axios.post(`${API_BASE_URL}/articles`, copyData, {
      headers: uploadHeaders.value
    })
    if (response.data.success) {
      ElMessage.success('文章复制成功')
      fetchArticles()
    }
  } catch (error) {
    console.error('复制文章失败:', error)
    ElMessage.error('复制文章失败')
  }
}

// 上传成功
const handleUploadSuccess = (response, file) => {
  if (response.success) {
    editForm.image = response.data.url
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error('图片上传失败')
  }
}

// 上传前检查
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件')
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB')
  }
  return isImage && isLt5M
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 初始化
onMounted(() => {
  fetchArticles()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  margin-bottom: 20px;
}

.batch-operations {
  margin-top: 20px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.editor-container {
  width: 100%;
}

.editor-tips {
  margin-top: 10px;
  font-size: 12px;
  color: #909399;
}

.avatar-uploader {
  width: 100%;
}

.avatar-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: #409eff;
}

.avatar {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}
</style>
