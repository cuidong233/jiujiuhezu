<template>
  <div class="page-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.keyword" placeholder="请输入商品名称" clearable />
        </el-form-item>
        <el-form-item label="商品分类">
          <el-select v-model="searchForm.categoryId" placeholder="全部分类" clearable>
            <el-option v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">添加商品</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 商品列表 -->
    <el-card class="list-card">
      <el-table :data="productList" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="cover_image" label="商品图片" width="100">
          <template #default="{ row }">
            <el-image 
              :src="getImageUrl(row.image || row.cover_image)" 
              style="width: 60px; height: 60px"
              fit="cover"
              lazy
            >
              <template #error>
                <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f5f7fa;">
                  <el-icon :size="20"><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="商品名称" min-width="200" />
        <el-table-column prop="categoryName" label="分类" width="120" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="sales" label="销量" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button 
              :type="row.status === 1 ? 'warning' : 'success'" 
              size="small" 
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '下架' : '上架' }}
            </el-button>
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
      width="90%"
      top="5vh"
      @close="handleDialogClose"
    >
      <el-tabs v-model="activeTab">
        <!-- 基本信息标签页 -->
        <el-tab-pane label="基本信息" name="basic">
          <el-form :model="productForm" :rules="rules" ref="productFormRef" label-width="100px" style="padding: 20px;">
            <el-form-item label="商品名称" prop="title">
              <el-input v-model="productForm.title" placeholder="请输入商品名称" />
            </el-form-item>
            <el-form-item label="商品分类" prop="categoryId">
              <el-select v-model="productForm.categoryId" placeholder="请选择分类" style="width: 100%;">
                <el-option label="视频音乐" :value="1" />
                <el-option label="Vtuber" :value="2" />
                <el-option label="代充代付" :value="3" />
                <el-option label="游戏" :value="4" />
                <el-option label="卡券" :value="5" />
                <el-option label="福利社" :value="6" />
              </el-select>
            </el-form-item>
            <el-form-item label="商品编码" prop="goodsCode">
              <el-input v-model="productForm.goodsCode" placeholder="请输入商品编码（唯一）" />
            </el-form-item>
            <el-form-item label="默认价格" prop="price">
              <el-input-number v-model="productForm.price" :min="0" :precision="2" />
              <span style="color: #999; margin-left: 10px;">如果设置了SKU，此价格将被忽略</span>
            </el-form-item>
            <el-form-item label="排序">
              <el-input-number v-model="productForm.orderNum" :min="0" />
              <span style="color: #999; margin-left: 10px;">数值越小，排序越靠前</span>
            </el-form-item>
            <el-form-item label="代充商品">
              <el-switch 
                v-model="productForm.deliveryRequiresReceipt" 
                active-text="是" 
                inactive-text="否"
                @change="handleProxyRechargeChange"
              />
              <el-tooltip content="代充商品需要管理员手动填写回执单（如账号密码等信息）" placement="right">
                <el-icon style="margin-left: 10px; color: #909399;"><InfoFilled /></el-icon>
              </el-tooltip>
            </el-form-item>
            
            <!-- 回执单字段配置 -->
            <el-form-item label="回执字段配置" v-if="productForm.deliveryRequiresReceipt">
              <div style="width: 100%;">
                <el-table :data="productForm.receiptFields" border style="margin-bottom: 10px;">
                  <el-table-column prop="label" label="字段名称" width="150">
                    <template #default="{ row }">
                      <el-input v-model="row.label" placeholder="字段名称" />
                    </template>
                  </el-table-column>
                  <el-table-column prop="key" label="字段标识" width="150">
                    <template #default="{ row }">
                      <el-input v-model="row.key" placeholder="字段标识（英文）" />
                    </template>
                  </el-table-column>
                  <el-table-column prop="type" label="字段类型" width="120">
                    <template #default="{ row }">
                      <el-select v-model="row.type" placeholder="类型">
                        <el-option label="文本" value="text" />
                        <el-option label="密码" value="password" />
                        <el-option label="多行文本" value="textarea" />
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column prop="placeholder" label="提示文字" min-width="200">
                    <template #default="{ row }">
                      <el-input v-model="row.placeholder" placeholder="输入提示文字" />
                    </template>
                  </el-table-column>
                  <el-table-column prop="required" label="必填" width="80" align="center">
                    <template #default="{ row }">
                      <el-switch v-model="row.required" />
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="80" align="center">
                    <template #default="{ row, $index }">
                      <el-button type="danger" size="small" @click="removeReceiptField($index)" :icon="Delete" />
                    </template>
                  </el-table-column>
                </el-table>
                <el-button type="primary" size="small" @click="addReceiptField">
                  <el-icon style="margin-right: 5px;"><Plus /></el-icon>
                  添加字段
                </el-button>
                <el-button type="default" size="small" @click="resetReceiptFields">
                  恢复默认
                </el-button>
              </div>
            </el-form-item>
            <el-form-item label="发货方式" prop="deliveryMode">
              <el-radio-group 
                v-model="productForm.deliveryMode"
                :disabled="productForm.deliveryRequiresReceipt"
              >
                <el-radio value="auto">自动发货</el-radio>
                <el-radio value="manual">手动发货</el-radio>
              </el-radio-group>
              <div style="margin-top: 5px; color: #909399; font-size: 12px;">
                <span v-if="productForm.deliveryRequiresReceipt" style="color: #E6A23C;">
                  <el-icon><Warning /></el-icon> 代充商品必须使用手动发货方式
                </span>
                <span v-else-if="productForm.deliveryMode === 'auto'">订单支付成功后系统自动分配CDK</span>
                <span v-else>需要管理员手动分配CDK给订单</span>
              </div>
            </el-form-item>
            <el-form-item label="自动发货限制" v-if="productForm.deliveryMode === 'auto' && !productForm.deliveryRequiresReceipt">
              <el-input-number v-model="productForm.autoDeliveryLimit" :min="1" :max="99" />
              <span style="color: #999; margin-left: 10px;">单次自动发货的最大数量</span>
            </el-form-item>
            <el-form-item label="状态">
              <el-switch 
                v-model="productForm.status" 
                :active-value="1" 
                :inactive-value="0"
                active-text="上架"
                inactive-text="下架"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 详细信息标签页 -->
        <el-tab-pane label="详细信息" name="detail">
          <el-form :model="productForm" label-width="100px" style="padding: 20px;">
            <el-form-item label="商品描述">
              <el-input 
                v-model="productForm.description" 
                type="textarea" 
                :rows="8"
                placeholder="请输入商品详细描述"
              />
            </el-form-item>
            <el-form-item label="关键词">
              <el-input v-model="productForm.keywords" placeholder="请输入关键词，用逗号分隔" />
            </el-form-item>
            <el-form-item label="标签">
              <el-input v-model="productForm.tags" placeholder="请输入标签，如：热卖,推荐" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 商品图片标签页 -->
        <el-tab-pane label="商品图片" name="media">
          <div style="padding: 20px;">
            <el-form-item label="主图" label-width="100px">
              <div style="display: flex; align-items: center; gap: 10px;">
                <!-- 图片预览 -->
                <el-image 
                  v-if="productForm.image"
                  :src="getImageUrl(productForm.image)"
                  style="width: 120px; height: 120px; border: 1px solid #ddd; border-radius: 4px;"
                  fit="cover"
                  :preview-src-list="[getImageUrl(productForm.image)]"
                  @error="handleImageError"
                >
                  <template #error>
                    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f5f7fa;">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
                <div v-else style="width: 120px; height: 120px; border: 1px dashed #ddd; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #999;">
                  暂无图片
                </div>
                
                <!-- 上传按钮 -->
                <div>
                  <el-upload
                    :action="`${API_BASE}/product/upload`"
                    :show-file-list="false"
                    :on-success="handleUploadSuccess"
                    :on-error="handleUploadError"
                    :before-upload="beforeUpload"
                    :headers="uploadHeaders"
                    accept="image/*"
                  >
                    <el-button type="primary">选择图片</el-button>
                  </el-upload>
                  <div style="color: #999; font-size: 12px; margin-top: 5px;">
                    支持 jpg、png、gif、webp 格式<br>
                    图片大小不超过 5MB
                  </div>
                </div>
              </div>
            </el-form-item>
            
            <el-divider />
            
            <el-form-item label="图片列表" label-width="100px">
              <div style="color: #999; font-size: 14px;">
                可在此处添加更多商品图片（功能待开发）
              </div>
            </el-form-item>
          </div>
        </el-tab-pane>
        
        <!-- SKU管理标签页 -->
        <el-tab-pane label="SKU管理" name="sku">
          <div style="padding: 20px;">
            <!-- 规格定义 -->
            <el-card style="margin-bottom: 20px">
              <template #header>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>规格设置</span>
                  <div style="display: flex; gap: 10px;">
                    <!-- 快速模板下拉 -->
                    <el-dropdown @command="handleQuickTemplate" size="small">
                      <el-button size="small">
                        快速模板 <el-icon><arrow-down /></el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="duration">会员时长（月/季/年）</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                    <el-button type="primary" size="small" @click="addSpec">添加规格</el-button>
                  </div>
                </div>
              </template>
              
              <div v-for="(spec, specIndex) in specifications" :key="specIndex" style="margin-bottom: 15px">
                <el-row :gutter="10" align="middle">
                  <el-col :span="4">
                    <el-input v-model="spec.label" placeholder="规格名称（如：时长）" size="small" />
                  </el-col>
                  <el-col :span="18">
                    <el-tag 
                      v-for="(value, valueIndex) in spec.values" 
                      :key="valueIndex"
                      closable
                      @close="removeSpecValue(specIndex, valueIndex)"
                      style="margin-right: 10px"
                      size="small"
                    >
                      {{ value.label }}
                    </el-tag>
                    <el-input
                      v-if="spec.addingValue"
                      v-model="spec.newValue"
                      size="small"
                      style="width: 120px"
                      @keyup.enter="addSpecValue(specIndex)"
                      @blur="addSpecValue(specIndex)"
                    />
                    <el-button 
                      v-else
                      size="small"
                      @click="showAddValue(specIndex)"
                    >
                      + 添加值
                    </el-button>
                  </el-col>
                  <el-col :span="2">
                    <el-button type="danger" size="small" @click="removeSpec(specIndex)">删除</el-button>
                  </el-col>
                </el-row>
              </div>
              
              <el-button 
                type="primary" 
                @click="generateSKUs"
                :disabled="specifications.length === 0"
                style="margin-top: 10px"
                size="small"
              >
                生成SKU组合
              </el-button>
            </el-card>

            <!-- SKU列表 -->
            <el-card v-if="skus.length > 0">
              <template #header>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>SKU列表</span>
                  <el-text type="info" size="small">
                    提示：有效天数用于订阅型产品，永久授权可设置为99999
                  </el-text>
                </div>
              </template>
              
              <el-table :data="skus" border size="small" style="width: 100%">
                <el-table-column 
                  v-for="spec in specifications" 
                  :key="spec.name"
                  :label="spec.label"
                  width="100"
                >
                  <template #default="{ row }">
                    {{ getSpecValueLabel(spec, row.attributes[spec.name]) }}
                  </template>
                </el-table-column>
                
                <el-table-column label="SKU名称" width="150">
                  <template #default="{ row }">
                    <el-input v-model="row.skuName" size="small" />
                  </template>
                </el-table-column>
                
                <el-table-column label="销售价" width="120">
                  <template #default="{ row }">
                    <el-input-number v-model="row.price" :min="0" :precision="2" size="small" />
                  </template>
                </el-table-column>
                
                <el-table-column label="库存" width="100">
                  <template #default="{ row }">
                    <el-input-number v-model="row.stock" :min="0" size="small" />
                  </template>
                </el-table-column>
                
                <el-table-column label="有效天数" width="100">
                  <template #default="{ row }">
                    <el-input-number 
                      v-model="row.expireDays" 
                      :min="0" 
                      size="small" 
                      placeholder="可选"
                    />
                  </template>
                </el-table-column>
                
                <el-table-column label="日均价" width="100" v-if="hasExpireDays">
                  <template #default="{ row }">
                    <span v-if="row.expireDays && row.expireDays > 0">
                      ¥{{ (row.price / row.expireDays).toFixed(2) }}
                    </span>
                    <span v-else style="color: #999;">-</span>
                  </template>
                </el-table-column>
                
                <el-table-column label="SKU简介" min-width="150">
                  <template #default="{ row }">
                    <el-input v-model="row.skuDescription" size="small" placeholder="功能说明" />
                  </template>
                </el-table-column>
                
                <el-table-column label="授权码数量" width="100">
                  <template #default="{ row }">
                    <el-input-number 
                      v-model="row.licenseCount" 
                      :min="1" 
                      size="small" 
                      placeholder="1"
                    />
                  </template>
                </el-table-column>
                
                <el-table-column label="状态" width="80">
                  <template #default="{ row }">
                    <el-switch v-model="row.status" :active-value="1" :inactive-value="0" size="small" />
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>
        </el-tab-pane>
        
        <!-- 邮件设置标签页 -->
        <el-tab-pane label="邮件设置" name="email">
          <el-form :model="productForm" label-width="120px" style="padding: 20px;">
            <el-form-item label="发送购买邮件">
              <el-switch v-model="productForm.emailEnabled" />
              <span class="ml-2 text-gray-500">购买成功后是否发送邮件通知</span>
            </el-form-item>
            
            <el-form-item label="自定义邮件主题" v-if="productForm.emailEnabled">
              <el-input 
                v-model="productForm.emailSubject" 
                placeholder="留空使用默认模板主题"
              />
              <div class="text-sm text-gray-500 mt-1">
                可用变量: {{orderNo}}, {{productName}}, {{amount}}
              </div>
            </el-form-item>
            
            <el-form-item label="自定义邮件模板" v-if="productForm.emailEnabled">
              <el-radio-group v-model="productForm.useCustomTemplate" class="mb-2">
                <el-radio :label="false">使用系统模板</el-radio>
                <el-radio :label="true">自定义模板</el-radio>
              </el-radio-group>
              
              <el-input 
                v-if="productForm.useCustomTemplate"
                v-model="productForm.emailTemplate" 
                type="textarea"
                :rows="10"
                placeholder="输入自定义邮件模板内容（HTML格式）"
              />
              
              <el-alert 
                v-if="productForm.useCustomTemplate"
                type="info" 
                :closable="false"
                class="mt-2"
              >
                <div>可用变量：</div>
                <div class="text-sm mt-1">
                  {{orderNo}} - 订单号 | {{productName}} - 商品名称 | {{amount}} - 金额 | 
                  {{cdkKeys}} - CDK密钥 | {{userName}} - 用户名 | {{userEmail}} - 用户邮箱
                </div>
              </el-alert>
            </el-form-item>
            
            <el-divider content-position="left">邮件发送模式</el-divider>
            
            <el-form-item label="发货模式提醒">
              <el-alert :type="productForm.deliveryMode === 'auto' ? 'success' : 'warning'" :closable="false">
                <div v-if="productForm.deliveryMode === 'auto'">
                  <strong>自动发货模式</strong>：支付成功后立即发送包含CDK的邮件
                </div>
                <div v-else>
                  <strong>手动发货模式</strong>：支付成功后发送待发货通知，管理员发货后发送商品信息
                </div>
              </el-alert>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, Picture, InfoFilled, Warning, Plus, Delete } from '@element-plus/icons-vue'
import axios from 'axios'

// API基础地址
const API_BASE = 'http://localhost:3002/api/admin'

// 搜索表单
const searchForm = reactive({
  keyword: '',
  categoryId: ''
})

// 商品列表
const productList = ref([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

// 分类列表
const categoryList = ref([
  { id: 1, name: '视频音乐' },
  { id: 2, name: 'Vtuber' },
  { id: 3, name: '代充代付' },
  { id: 4, name: '游戏' },
  { id: 5, name: '卡券' },
  { id: 6, name: '福利社' }
])

// 上传请求头
const uploadHeaders = computed(() => {
  const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
  return {
    'Accept': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  }
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('添加商品')
const productFormRef = ref(null)
const activeTab = ref('basic')  // 当前激活的标签页

// SKU相关数据
const specifications = ref([])
const skus = ref([])

// 计算属性：是否有SKU包含有效天数
const hasExpireDays = computed(() => {
  return skus.value.some(sku => sku.expireDays && sku.expireDays > 0)
})
const productForm = reactive({
  id: null,
  title: '',
  categoryId: 1,
  goodsCode: '',
  price: 0,
  image: '',
  keywords: '',
  tags: '',
  description: '',
  orderNum: 0,
  status: 1,
  deliveryMode: 'auto',
  autoDeliveryLimit: 10,
  deliveryRequiresReceipt: false,  // 是否需要回执单（代充商品）
  receiptFields: [],  // 回执单字段配置
  // 邮件设置
  emailEnabled: true,
  emailSubject: '',
  emailTemplate: '',
  useCustomTemplate: false
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入商品名称', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  goodsCode: [
    { required: true, message: '请输入商品编码', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' }
  ],
  deliveryMode: [
    { required: true, message: '请选择发货方式', trigger: 'change' }
  ]
}

// 获取商品列表
const getProductList = async () => {
  loading.value = true
  try {
    const response = await axios.get(`${API_BASE}/product/list`, {
      params: {
        page: pagination.page,
        limit: pagination.limit,
        keyword: searchForm.keyword,
        categoryId: searchForm.categoryId
      }
    })
    if (response.data.code === 0) {
      productList.value = response.data.data.list
      pagination.total = response.data.data.total
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

// 获取分类列表
const getCategoryList = async () => {
  // 分类已经固定，不需要从后端获取
  // categoryList已经在上面定义好了
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  getProductList()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.categoryId = ''
  pagination.page = 1
  getProductList()
}

// 添加商品
const handleAdd = () => {
  dialogTitle.value = '添加商品'
  // 重置表单
  productForm.id = null
  productForm.title = ''
  productForm.categoryId = 1
  productForm.goodsCode = ''
  productForm.price = 0
  productForm.image = ''
  productForm.keywords = ''
  productForm.tags = ''
  productForm.description = ''
  productForm.orderNum = 0
  productForm.status = 1
  productForm.deliveryMode = 'auto'
  productForm.autoDeliveryLimit = 10
  // 重置邮件设置
  productForm.emailEnabled = true
  productForm.emailSubject = ''
  productForm.emailTemplate = ''
  productForm.useCustomTemplate = false
  specifications.value = []  // 清空规格
  skus.value = []  // 清空SKU
  activeTab.value = 'basic'  // 重置到基本信息标签页
  dialogVisible.value = true
}

// 处理图片上传成功
const handleUploadSuccess = (response, file) => {
  if (response.code === 0) {
    // 保存返回的相对路径
    productForm.image = response.data.url
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error(response.msg || '上传失败')
  }
}

// 处理图片上传失败
const handleUploadError = (error) => {
  console.error('上传失败:', error)
  ElMessage.error('图片上传失败')
}

// 上传前的验证
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB！')
    return false
  }
  return true
}

// 获取图片URL（处理相对路径和绝对路径）
const getImageUrl = (url) => {
  if (!url) return '/images/netflix.png'
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  if (url.startsWith('/')) {
    // 修正：API_BASE已包含/api/admin，图片应该直接从根路径访问
    return `http://localhost:3002${url}`
  }
  return url
}

// 处理图片加载错误
const handleImageError = () => {
  console.error('图片加载失败:', productForm.image)
}

// 编辑商品
const handleEdit = async (row) => {
  dialogTitle.value = '编辑商品'
  productForm.id = row.id
  productForm.title = row.title
  productForm.categoryId = row.categoryId || row.category_id
  productForm.productType = row.productType || row.product_type || 'video'
  productForm.goodsCode = row.goods_code
  productForm.price = parseFloat(row.price)
  productForm.image = row.image || row.cover_image || ''
  productForm.keywords = row.keywords || ''
  productForm.tags = row.tags || ''
  productForm.description = row.description || ''
  productForm.orderNum = row.order_num || 0
  productForm.status = row.status
  productForm.deliveryMode = row.deliveryMode || row.delivery_mode || 'auto'
  productForm.autoDeliveryLimit = row.autoDeliveryLimit || row.auto_delivery_limit || 10
  productForm.deliveryRequiresReceipt = row.deliveryRequiresReceipt || row.delivery_requires_receipt || false
  
  // 加载回执字段配置
  if (productForm.deliveryRequiresReceipt) {
    productForm.receiptFields = row.receipt_fields ? 
      (typeof row.receipt_fields === 'string' ? JSON.parse(row.receipt_fields) : row.receipt_fields) : []
  } else {
    productForm.receiptFields = []
  }
  
  // 邮件设置
  productForm.emailEnabled = row.email_enabled !== undefined ? row.email_enabled : true
  productForm.emailSubject = row.email_subject || ''
  productForm.emailTemplate = row.email_template || ''
  productForm.useCustomTemplate = !!row.email_template
  
  // 加载SKU信息
  await loadProductSKU(row.id)
  
  activeTab.value = 'basic'  // 重置到基本信息标签页
  dialogVisible.value = true
}

// 保存商品
const handleSave = async () => {
  await productFormRef.value.validate()
  
  try {
    // 准备保存的数据
    const saveData = {
      ...productForm,
      image: productForm.image || '',
      product_type: productForm.productType,
      delivery_mode: productForm.deliveryMode,
      auto_delivery_limit: productForm.autoDeliveryLimit,
      specifications: JSON.stringify(specifications.value),
      skus: JSON.stringify(skus.value),
      // 回执字段配置（代充商品）
      receipt_fields: productForm.deliveryRequiresReceipt ? 
        JSON.stringify(productForm.receiptFields) : null,
      // 邮件设置
      email_enabled: productForm.emailEnabled,
      email_subject: productForm.emailSubject,
      email_template: productForm.useCustomTemplate ? productForm.emailTemplate : ''
    }
    
    let response
    if (productForm.id) {
      // 更新
      response = await axios.put(`${API_BASE}/product/update/${productForm.id}`, saveData)
    } else {
      // 添加
      response = await axios.post(`${API_BASE}/product/add`, saveData)
    }
    
    if (response.data.code === 0) {
      ElMessage.success(productForm.id ? '更新成功' : '添加成功')
      dialogVisible.value = false
      getProductList()
    } else {
      ElMessage.error(response.data.msg || '操作失败')
    }
  } catch (error) {
    console.error('保存商品失败:', error)
    ElMessage.error(error.response?.data?.msg || '保存失败')
  }
}

// 切换状态
const handleToggleStatus = async (row) => {
  try {
    const newStatus = row.status === 1 ? 0 : 1
    const response = await axios.post(`${API_BASE}/product/status`, {
      ids: [row.id],
      status: newStatus
    })
    
    if (response.data.code === 0) {
      ElMessage.success(newStatus === 1 ? '上架成功' : '下架成功')
      getProductList()
    }
  } catch (error) {
    console.error('更新状态失败:', error)
    ElMessage.error('更新状态失败')
  }
}

// 删除商品
const handleDelete = async (row) => {
  await ElMessageBox.confirm(
    `确定要删除商品【${row.title}】吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
  
  try {
    const response = await axios.delete(`${API_BASE}/product/delete/${row.id}`)
    if (response.data.code === 0) {
      ElMessage.success('删除成功')
      getProductList()
    } else {
      ElMessage.error(response.data.msg || '删除失败')
    }
  } catch (error) {
    console.error('删除商品失败:', error)
    ElMessage.error(error.response?.data?.msg || '删除失败')
  }
}

// 分页大小改变
const handleSizeChange = () => {
  pagination.page = 1
  getProductList()
}

// 页码改变
const handleCurrentChange = () => {
  getProductList()
}

// 对话框关闭
const handleDialogClose = () => {
  productFormRef.value?.resetFields()
}

// ========== SKU管理相关方法 ==========

// 加载商品SKU信息
const loadProductSKU = async (productId) => {
  try {
    const response = await axios.get(`${API_BASE}/product/skus/${productId}`)
    if (response.data.code === 0) {
      const data = response.data.data
      if (data.specifications && typeof data.specifications === 'string') {
        try {
          specifications.value = JSON.parse(data.specifications)
        } catch (e) {
          specifications.value = []
        }
      } else {
        specifications.value = data.specifications || []
      }
      
      if (data.skus && typeof data.skus === 'string') {
        try {
          skus.value = JSON.parse(data.skus)
        } catch (e) {
          skus.value = []
        }
      } else {
        skus.value = data.skus || []
      }
    }
  } catch (error) {
    console.error('加载SKU失败:', error)
    specifications.value = []
    skus.value = []
  }
}

// 添加规格
const addSpec = () => {
  specifications.value.push({
    name: `spec_${Date.now()}`,
    label: '',
    values: [],
    addingValue: false,
    newValue: ''
  })
}

// 删除规格
const removeSpec = (index) => {
  specifications.value.splice(index, 1)
}

// 显示添加规格值输入框
const showAddValue = (specIndex) => {
  specifications.value[specIndex].addingValue = true
  specifications.value[specIndex].newValue = ''
}

// 添加规格值
const addSpecValue = (specIndex) => {
  const spec = specifications.value[specIndex]
  if (spec.newValue && spec.newValue.trim()) {
    spec.values.push({
      value: spec.newValue.trim().replace(/\s+/g, '_'),
      label: spec.newValue.trim()
    })
    spec.newValue = ''
    spec.addingValue = false
  }
}

// 删除规格值
const removeSpecValue = (specIndex, valueIndex) => {
  specifications.value[specIndex].values.splice(valueIndex, 1)
}

// 获取规格值标签
const getSpecValueLabel = (spec, value) => {
  const specValue = spec.values.find(v => v.value === value)
  return specValue ? specValue.label : value
}

// 处理快速模板选择
const handleQuickTemplate = (command) => {
  // 清空现有规格
  specifications.value = []
  
  switch(command) {
    case 'duration':
      // 会员时长模板
      specifications.value.push({
        name: 'duration',
        label: '会员时长',
        values: [
          { value: '1month', label: '1个月' },
          { value: '3month', label: '3个月' },
          { value: '6month', label: '6个月' },
          { value: '12month', label: '12个月' }
        ],
        addingValue: false,
        newValue: ''
      })
      // 生成SKU后自动设置有效天数
      generateSKUs()
      // 设置默认的有效天数和描述
      skus.value.forEach((sku, index) => {
        const durations = [30, 90, 180, 365]
        sku.expireDays = durations[index] || 30
        sku.skuDescription = `${sku.skuName}会员`
      })
      break
  }
  
  ElMessage.success('已应用快速模板')
}

// 生成SKU组合
const generateSKUs = () => {
  if (specifications.value.length === 0) {
    ElMessage.warning('请先添加规格')
    return
  }
  
  // 检查规格是否完整
  const incomplete = specifications.value.find(spec => !spec.label || spec.values.length === 0)
  if (incomplete) {
    ElMessage.warning('请完善所有规格信息')
    return
  }
  
  // 生成所有组合
  const generateCombinations = (specs, index = 0, current = {}) => {
    if (index === specs.length) {
      return [current]
    }
    
    const spec = specs[index]
    const results = []
    
    for (const value of spec.values) {
      const newCurrent = {
        ...current,
        [spec.name]: value.value
      }
      results.push(...generateCombinations(specs, index + 1, newCurrent))
    }
    
    return results
  }
  
  const combinations = generateCombinations(specifications.value)
  
  // 生成SKU列表
  skus.value = combinations.map((attrs, index) => {
    // 查找是否已存在相同属性组合的SKU
    const existingSku = skus.value.find(sku => {
      return Object.keys(attrs).every(key => sku.attributes[key] === attrs[key])
    })
    
    if (existingSku) {
      return existingSku
    }
    
    // 生成SKU名称
    const skuName = specifications.value.map(spec => {
      const value = spec.values.find(v => v.value === attrs[spec.name])
      return value ? value.label : ''
    }).join('-')
    
    return {
      skuId: `SKU${Date.now()}_${index}`,
      skuName,
      attributes: attrs,
      price: 0,
      stock: 0,
      expireDays: null,
      skuDescription: '',
      status: 1
    }
  })
  
  ElMessage.success(`已生成 ${skus.value.length} 个SKU`)
}

// 处理代充商品切换
const handleProxyRechargeChange = (value) => {
  if (value) {
    // 如果开启代充商品，自动设置为手动发货
    productForm.deliveryMode = 'manual'
    ElMessage.info('代充商品已自动设置为手动发货模式')
    
    // 如果没有配置回执字段，设置默认字段
    if (!productForm.receiptFields || productForm.receiptFields.length === 0) {
      productForm.receiptFields = [
        { key: 'account', label: '账号', type: 'text', placeholder: '请输入账号', required: true },
        { key: 'password', label: '密码', type: 'password', placeholder: '请输入密码', required: true },
        { key: 'contact', label: '联系方式', type: 'text', placeholder: '请输入联系方式', required: false }
      ]
    }
  } else {
    // 如果关闭代充商品，恢复为自动发货
    productForm.deliveryMode = 'auto'
    productForm.receiptFields = []
  }
}

// 添加回执字段
const addReceiptField = () => {
  productForm.receiptFields.push({
    key: '',
    label: '',
    type: 'text',
    placeholder: '',
    required: false
  })
}

// 移除回执字段
const removeReceiptField = (index) => {
  productForm.receiptFields.splice(index, 1)
}

// 重置为默认字段
const resetReceiptFields = () => {
  productForm.receiptFields = [
    { key: 'account', label: '账号', type: 'text', placeholder: '请输入账号', required: true },
    { key: 'password', label: '密码', type: 'password', placeholder: '请输入密码', required: true },
    { key: 'contact', label: '联系方式', type: 'text', placeholder: '请输入联系方式', required: false }
  ]
  ElMessage.success('已恢复默认字段配置')
}

// 初始化
onMounted(() => {
  getProductList()
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
  padding: 10px 0;
}

.list-card {
  min-height: 400px;
}

.ml-2 {
  margin-left: 8px;
}

.text-gray-500 {
  color: #6b7280;
}

.text-sm {
  font-size: 14px;
}

.mt-1 {
  margin-top: 4px;
}

.mt-2 {
  margin-top: 8px;
}

.mb-2 {
  margin-bottom: 8px;
}
</style>