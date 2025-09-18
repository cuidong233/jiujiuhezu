<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>折扣活动管理</span>
          <el-button type="primary" @click="handleAdd">新增活动</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="活动名称">
            <el-input v-model="searchForm.keyword" placeholder="请输入活动名称" clearable />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择" clearable>
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 数据表格 -->
      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="活动名称" min-width="150" />
        <el-table-column prop="discount_type" label="折扣类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.discount_type === 'percentage' ? 'success' : 'warning'">
              {{ row.discount_type === 'percentage' ? '百分比' : '固定金额' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="discount_value" label="折扣值" width="100">
          <template #default="{ row }">
            <span v-if="row.discount_type === 'percentage'">{{ row.discount_value }}%</span>
            <span v-else>¥{{ row.discount_value }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="min_purchase_amount" label="最低消费" width="100">
          <template #default="{ row }">
            ¥{{ row.min_purchase_amount || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="活动时间" min-width="180">
          <template #default="{ row }">
            <div>开始：{{ formatDate(row.start_time) }}</div>
            <div>结束：{{ formatDate(row.end_time) }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="apply_to_all_products" label="适用范围" width="100">
          <template #default="{ row }">
            <el-tag :type="row.apply_to_all_products ? 'primary' : 'info'">
              {{ row.apply_to_all_products ? '全部商品' : '指定商品' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="活动名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="活动描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入活动描述"
          />
        </el-form-item>
        <el-form-item label="折扣类型" prop="discount_type">
          <el-radio-group v-model="form.discount_type">
            <el-radio value="percentage">百分比折扣</el-radio>
            <el-radio value="fixed">固定金额</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="折扣值" prop="discount_value">
          <el-input-number
            v-model="form.discount_value"
            :min="0"
            :max="form.discount_type === 'percentage' ? 100 : 999999"
            :precision="2"
            :step="1"
          />
          <span class="ml-2">
            {{ form.discount_type === 'percentage' ? '% (如90表示9折)' : '元' }}
          </span>
        </el-form-item>
        <el-form-item label="最低消费" prop="min_purchase_amount">
          <el-input-number
            v-model="form.min_purchase_amount"
            :min="0"
            :precision="2"
            :step="10"
          />
          <span class="ml-2">元</span>
        </el-form-item>
        <el-form-item label="最高优惠" prop="max_discount_amount">
          <el-input-number
            v-model="form.max_discount_amount"
            :min="0"
            :precision="2"
            :step="10"
          />
          <span class="ml-2">元（不限制请留空）</span>
        </el-form-item>
        <el-form-item label="开始时间" prop="start_time">
          <el-date-picker
            v-model="form.start_time"
            type="datetime"
            placeholder="选择开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="end_time">
          <el-date-picker
            v-model="form.end_time"
            type="datetime"
            placeholder="选择结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="适用范围" prop="apply_to_all_products">
          <el-radio-group v-model="form.apply_to_all_products">
            <el-radio :label="true">全部商品</el-radio>
            <el-radio :label="false">指定商品</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <!-- 指定商品选择 -->
        <template v-if="!form.apply_to_all_products">
          <!-- 先选择商品类型 -->
          <el-form-item label="商品类型">
            <el-select
              v-model="form.selected_category"
              placeholder="请先选择商品类型"
              style="width: 100%"
              @change="handleCategoryChange"
            >
              <el-option
                v-for="category in categoryList"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
          </el-form-item>
          
          <!-- 根据类型选择具体商品 -->
          <el-form-item v-if="form.selected_category" label="选择商品">
            <el-select
              v-model="form.product_ids"
              multiple
              placeholder="请选择商品（可多选）"
              style="width: 100%"
              :disabled="!form.selected_category"
            >
              <el-option
                v-for="product in filteredProductList"
                :key="product.id"
                :label="`${product.title} (¥${product.price})`"
                :value="product.id"
              >
                <span style="float: left">{{ product.title }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">¥{{ product.price }}</span>
              </el-option>
            </el-select>
            <div style="margin-top: 5px; color: #909399; font-size: 12px">
              该类型下共有 {{ filteredProductList.length }} 个商品，已选择 {{ form.product_ids.length }} 个
            </div>
          </el-form-item>
          
          <!-- 或选择整个分类 -->
          <el-form-item label="或选择分类">
            <el-select
              v-model="form.category_ids"
              multiple
              placeholder="直接选择整个分类（可多选）"
              style="width: 100%"
            >
              <el-option
                v-for="category in categoryList"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
            <div style="margin-top: 5px; color: #909399; font-size: 12px">
              选择分类后，该分类下的所有商品都将应用此折扣
            </div>
          </el-form-item>
        </template>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
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
import { useApi } from '@/composables/useApi'

const api = useApi()

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: ''
})

// 分页
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('新增活动')
const formRef = ref()

// 表单数据
const form = reactive({
  id: null,
  name: '',
  description: '',
  discount_type: 'percentage',
  discount_value: 90,
  min_purchase_amount: 0,
  max_discount_amount: null,
  start_time: '',
  end_time: '',
  status: 1,
  apply_to_all_products: true,
  product_ids: [],
  category_ids: [],
  selected_category: null // 用于商品筛选的选中分类
})

// 商品和分类列表
const productList = ref([])
const allProductList = ref([]) // 保存所有商品
const categoryList = ref([
  { id: 3, name: '视频音乐' },
  { id: 4, name: 'Vtuber' },
  { id: 8, name: '代充代付' },
  { id: 9, name: '游戏' },
  { id: 10, name: '卡劵' },
  { id: 11, name: '福利社' }
])

// 计算属性：根据选中的分类筛选商品
const filteredProductList = computed(() => {
  if (!form.selected_category) {
    return []
  }
  return allProductList.value.filter(product => 
    product.categoryId === form.selected_category
  )
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入活动名称', trigger: 'blur' }
  ],
  discount_type: [
    { required: true, message: '请选择折扣类型', trigger: 'change' }
  ],
  discount_value: [
    { required: true, message: '请输入折扣值', trigger: 'blur' }
  ],
  start_time: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  end_time: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ]
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

// 获取活动列表
const getList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.size,
      ...searchForm
    }
    const res = await api.get('/api/discount/admin/list', params)
    if (res.success) {
      tableData.value = res.data?.list || []
      pagination.total = res.data?.total || 0
    }
  } catch (error) {
    ElMessage.error('获取活动列表失败')
  } finally {
    loading.value = false
  }
}

// 获取商品列表
const getProductList = async () => {
  try {
    const res = await api.get('/api/product/list', { size: 1000 })
    if (res.success) {
      allProductList.value = res.data?.list || []
      productList.value = res.data?.list || []
      
      // 调试：显示加载的商品信息
      console.log('加载商品数量:', allProductList.value.length)
      const categoryCounts = {}
      allProductList.value.forEach(p => {
        categoryCounts[p.categoryId] = (categoryCounts[p.categoryId] || 0) + 1
      })
      console.log('各分类商品数量:', categoryCounts)
    }
  } catch (error) {
    console.error('获取商品列表失败', error)
  }
}

// 当选择的分类变化时，清空已选商品
const handleCategoryChange = () => {
  form.product_ids = []
}

// 查询
const handleSearch = () => {
  pagination.page = 1
  getList()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  handleSearch()
}

// 分页大小改变
const handleSizeChange = () => {
  pagination.page = 1
  getList()
}

// 页码改变
const handlePageChange = () => {
  getList()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增活动'
  // 重置表单
  Object.assign(form, {
    id: null,
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 90,
    min_purchase_amount: 0,
    max_discount_amount: null,
    start_time: '',
    end_time: '',
    status: 1,
    apply_to_all_products: true,
    product_ids: [],
    category_ids: [],
    selected_category: null
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑活动'
  Object.assign(form, {
    ...row,
    product_ids: row.product_ids || [],
    category_ids: row.category_ids || [],
    selected_category: null
  })
  
  // 如果有选中的商品，尝试推断商品类型
  if (row.product_ids && row.product_ids.length > 0) {
    const firstProductId = row.product_ids[0]
    const product = allProductList.value.find(p => p.id === firstProductId)
    if (product) {
      form.selected_category = product.categoryId
    }
  }
  
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除该活动吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await api.del(`/api/discount/admin/delete/${row.id}`)
    if (res.success) {
      ElMessage.success('删除成功')
      getList()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 状态改变
const handleStatusChange = async (row) => {
  try {
    const res = await api.put(`/api/discount/admin/toggle-status/${row.id}`)
    if (res.success) {
      ElMessage.success('状态更新成功')
    } else {
      ElMessage.error(res.msg || '状态更新失败')
      row.status = row.status === 1 ? 0 : 1
    }
  } catch (error) {
    ElMessage.error('状态更新失败')
    row.status = row.status === 1 ? 0 : 1
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    const url = form.id 
      ? `/api/discount/admin/update/${form.id}`
      : '/api/discount/admin/create'
    
    const method = form.id ? 'put' : 'post'
    
    // 准备提交的数据，移除selected_category字段
    const submitData = { ...form }
    delete submitData.selected_category
    
    const res = await api[method](url, submitData)
    if (res.success) {
      ElMessage.success(form.id ? '更新成功' : '创建成功')
      dialogVisible.value = false
      getList()
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (error) {
    console.error('提交失败', error)
  }
}

// 初始化
onMounted(() => {
  getList()
  getProductList()
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

.search-area {
  margin-bottom: 20px;
}

.el-pagination {
  margin-top: 20px;
  justify-content: flex-end;
}

.ml-2 {
  margin-left: 8px;
}
</style>