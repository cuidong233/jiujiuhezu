<template>
  <div class="page-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="轮播图标题">
          <el-input v-model="searchForm.keyword" placeholder="请输入标题" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="显示" :value="1" />
            <el-option label="隐藏" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">添加轮播图</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 轮播图列表 -->
    <el-card class="list-card">
      <el-table :data="bannerList" v-loading="loading" border stripe row-key="id">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="img" label="轮播图" width="200">
          <template #default="{ row }">
            <el-image 
              :src="getImageUrl(row.img)" 
              style="width: 160px; height: 60px"
              fit="cover"
              :preview-src-list="[getImageUrl(row.img)]"
              preview-teleported
            />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="order_num" label="排序" width="80" align="center" />
        <el-table-column prop="is_visible" label="是否使用" width="100" align="center">
          <template #default="{ row }">
            <el-switch 
              v-model="row.is_visible" 
              :active-value="1" 
              :inactive-value="0"
              @change="handleToggleStatus(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px"
      />
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form :model="bannerForm" :rules="rules" ref="bannerFormRef" label-width="100px">
        <el-form-item label="轮播图标题" prop="title">
          <el-input v-model="bannerForm.title" placeholder="请输入轮播图标题" />
        </el-form-item>
        
        <el-form-item label="轮播图片" prop="img">
          <div class="upload-container">
            <el-upload
              class="banner-uploader"
              :action="uploadUrl"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleUploadSuccess"
              :before-upload="beforeUpload"
              accept="image/*"
            >
              <div v-if="bannerForm.img" class="image-preview-container">
                <img :src="getImageUrl(bannerForm.img)" class="banner-preview" />
                <div class="upload-overlay">
                  <el-icon class="upload-icon"><Plus /></el-icon>
                  <div>点击更换图片</div>
                </div>
              </div>
              <div v-else class="upload-placeholder">
                <el-icon class="upload-icon"><Plus /></el-icon>
                <div class="upload-text">点击上传图片</div>
              </div>
            </el-upload>
            <div class="upload-tip">建议尺寸：1920x480 或 16:9 比例，支持 JPG、PNG 格式</div>
          </div>
        </el-form-item>
        
        <el-form-item label="排序">
          <el-input-number v-model="bannerForm.order_num" :min="0" />
          <span style="color: #999; margin-left: 10px;">数值越小，显示越靠前</span>
        </el-form-item>
        
        <el-form-item label="是否使用">
          <el-switch 
            v-model="bannerForm.is_visible" 
            :active-value="1" 
            :inactive-value="0"
            active-text="使用"
            inactive-text="不使用"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '@/utils/request'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const bannerFormRef = ref()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: null
})

// 分页
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

// 轮播图列表
const bannerList = ref([])

// 轮播图表单
const bannerForm = reactive({
  id: null,
  title: '',
  img: '',
  order_num: 0,
  is_visible: 1
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入轮播图标题', trigger: 'blur' }
  ],
  img: [
    { required: true, message: '请上传轮播图片', trigger: 'change' }
  ]
}

// 上传配置
const uploadUrl = computed(() => {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3002'
  return `${baseURL}/api/upload/image`
})

const uploadHeaders = computed(() => {
  const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
  return token ? { 'Authorization': `Bearer ${token}` } : {}
})

// 获取图片URL
const getImageUrl = (url) => {
  if (!url) return ''
  // 如果是完整URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  // 如果是相对路径，添加基础URL
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3002'
  return `${baseURL}${url.startsWith('/') ? '' : '/'}${url}`
}

// 获取轮播图列表
const fetchBannerList = async () => {
  loading.value = true
  try {
    const response = await request.get('/api/admin/banner', {
      params: {
        page: pagination.page,
        limit: pagination.limit,
        ...searchForm
      }
    })
    
    if (response.success) {
      bannerList.value = response.data.list || []
      pagination.total = response.data.total || 0
    } else {
      ElMessage.error(response.message || '获取轮播图列表失败')
    }
  } catch (error) {
    console.error('获取轮播图列表失败:', error)
    ElMessage.error('获取轮播图列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchBannerList()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = null
  pagination.page = 1
  fetchBannerList()
}

// 添加轮播图
const handleAdd = () => {
  dialogTitle.value = '添加轮播图'
  // 清空表单
  bannerForm.id = null
  bannerForm.title = ''
  bannerForm.img = ''
  bannerForm.order_num = 0
  bannerForm.is_visible = 1
  // 清除表单验证状态
  bannerFormRef.value?.clearValidate()
  dialogVisible.value = true
}

// 编辑轮播图
const handleEdit = (row) => {
  dialogTitle.value = '编辑轮播图'
  // 清除表单验证状态
  bannerFormRef.value?.clearValidate()
  // 设置表单数据
  bannerForm.id = row.id
  bannerForm.title = row.title
  bannerForm.img = row.img
  bannerForm.order_num = row.order_num || 0
  bannerForm.is_visible = row.is_visible
  dialogVisible.value = true
}

// 删除轮播图
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该轮播图吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await request.delete(`/api/admin/banner/${row.id}`)
    
    if (response.success) {
      ElMessage.success('删除成功')
      fetchBannerList()
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

// 切换状态
const handleToggleStatus = async (row) => {
  try {
    const response = await request.put(`/api/admin/banner/${row.id}/status`, {
      is_visible: row.is_visible
    })
    
    if (response.success) {
      ElMessage.success('状态更新成功')
    } else {
      ElMessage.error(response.message || '状态更新失败')
      // 恢复原状态
      row.is_visible = row.is_visible === 1 ? 0 : 1
    }
  } catch (error) {
    console.error('状态更新失败:', error)
    ElMessage.error('状态更新失败')
    // 恢复原状态
    row.is_visible = row.is_visible === 1 ? 0 : 1
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await bannerFormRef.value.validate()
    
    console.log('提交表单数据:', bannerForm)
    console.log('是否为编辑模式:', !!bannerForm.id)
    
    const submitData = {
      title: bannerForm.title,
      img: bannerForm.img,
      order_num: bannerForm.order_num || 0,
      is_visible: bannerForm.is_visible
    }
    
    const response = bannerForm.id
      ? await request.put(`/api/admin/banner/${bannerForm.id}`, submitData)
      : await request.post('/api/admin/banner', submitData)
    
    console.log('API响应:', response)
    
    if (response.success) {
      ElMessage.success(bannerForm.id ? '更新成功' : '添加成功')
      dialogVisible.value = false
      fetchBannerList()
    } else {
      ElMessage.error(response.message || '操作失败')
    }
  } catch (error) {
    console.error('提交失败:', error)
    if (error !== false) { // 表单验证失败时返回false
      ElMessage.error('操作失败')
    }
  }
}

// 上传前检查
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5
  
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

// 上传成功
const handleUploadSuccess = (response, file) => {
  if (response.success) {
    bannerForm.img = response.data.url
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error(response.message || '图片上传失败')
  }
}

// 对话框关闭
const handleDialogClose = () => {
  // 重置表单
  bannerFormRef.value?.resetFields()
  // 清空表单数据
  bannerForm.id = null
  bannerForm.title = ''
  bannerForm.img = ''
  bannerForm.order_num = 0
  bannerForm.is_visible = 1
}

// 分页大小改变
const handleSizeChange = (val) => {
  pagination.limit = val
  pagination.page = 1
  fetchBannerList()
}

// 页码改变
const handleCurrentChange = (val) => {
  pagination.page = val
  fetchBannerList()
}

// 初始化
onMounted(() => {
  fetchBannerList()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: -18px;
}

.list-card {
  background: #fff;
}

.upload-container {
  width: 100%;
}

.banner-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
}

.banner-uploader:hover {
  border-color: #409eff;
}

.image-preview-container {
  position: relative;
  width: 400px;
  height: 150px;
  overflow: hidden;
}

.banner-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-preview-container:hover .upload-overlay {
  opacity: 1;
}

.upload-placeholder {
  width: 400px;
  height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
  margin-bottom: 8px;
}

.upload-text {
  color: #8c939d;
  font-size: 14px;
}

.upload-tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}
</style>