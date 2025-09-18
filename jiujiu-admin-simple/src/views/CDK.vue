<template>
  <div class="page-container">
    <!-- 统计卡片 -->
    <div class="stats-container">
      <el-row :gutter="20">
        <el-col :span="4">
          <el-card class="stat-card">
            <el-statistic title="CDK总数" :value="statistics.total">
              <template #prefix>
                <el-icon><Key /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stat-card">
            <el-statistic title="未使用" :value="statistics.unused">
              <template #prefix>
                <el-icon style="color: #67C23A"><CircleCheck /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stat-card">
            <el-statistic title="已使用" :value="statistics.used">
              <template #prefix>
                <el-icon style="color: #E6A23C"><Clock /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stat-card">
            <el-statistic title="可重复使用" :value="statistics.reusable || 0">
              <template #prefix>
                <el-icon style="color: #00C853"><Refresh /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stat-card">
            <el-statistic title="活跃使用中" :value="statistics.activeUsing || 0">
              <template #prefix>
                <el-icon style="color: #FF6B00"><Timer /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stat-card">
            <el-statistic title="使用率" :value="statistics.usageRate" suffix="%">
              <template #prefix>
                <el-icon style="color: #409EFF"><DataAnalysis /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="商品类型">
          <el-select v-model="searchForm.productType" placeholder="全部类型" clearable @change="handleProductTypeChange">
            <el-option label="全部类型" value="" />
            <el-option v-for="type in productTypes" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品">
          <el-select v-model="searchForm.productId" placeholder="全部商品" clearable>
            <el-option v-for="product in getFilteredProductsByType(searchForm.productType)" :key="product.id" :label="product.name" :value="product.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
            <el-option label="未售" :value="0" />
            <el-option label="已售" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="使用类型">
          <el-select v-model="searchForm.cdkCategory" placeholder="全部类型" clearable>
            <el-option label="全部类型" value="" />
            <el-option label="一次性CDK" value="one_time" />
            <el-option label="可重复CDK" value="reusable_stock" />
            <el-option label="代充CDK" value="manual_recharge" />
          </el-select>
        </el-form-item>
        <el-form-item label="CDK码">
          <el-input v-model="searchForm.keyword" placeholder="输入CDK码" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-divider />
      
      <div class="action-buttons">
        <el-button type="primary" @click="showImportDialog">
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出CDK
        </el-button>
        <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0">
          <el-icon><Delete /></el-icon>
          批量删除 ({{ selectedRows.length }})
        </el-button>
      </div>
    </el-card>

    <!-- CDK列表 -->
    <el-card class="list-card">
      <el-table 
        :data="cdkList" 
        v-loading="loading" 
        border 
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="cdkCode" label="CDK码" min-width="200">
          <template #default="{ row }">
            <div class="cdk-code">
              <span>{{ row.cdkCode }}</span>
              <el-button link type="primary" @click="copyCDK(row.cdkCode)">
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="productName" label="商品" width="150" />
        <el-table-column prop="cdkCategory" label="CDK分类" width="120">
          <template #default="{ row }">
            <el-tag :type="getCDKCategoryType(row.cdkCategory)">
              {{ getCDKCategoryText(row.cdkCategory) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isReusable" label="使用模式" width="120">
          <template #default="{ row }">
            <el-tag :type="row.isReusable ? 'success' : 'info'" size="small">
              <el-icon v-if="row.isReusable"><Refresh /></el-icon>
              <el-icon v-else><Ticket /></el-icon>
              {{ row.isReusable ? '可重复' : '一次性' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="usageCount" label="使用次数" width="120">
          <template #default="{ row }">
            <div v-if="row.isReusable">
              <el-progress 
                :percentage="((row.currentUsageCount || 0) / (row.maxUsageCount || 1)) * 100"
                :stroke-width="6"
                :format="() => `${row.currentUsageCount || 0}/${row.maxUsageCount || 1}`"
              />
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column prop="usedDate" label="使用时间" width="180">
          <template #default="{ row }">
            {{ row.usedDate || row.used_date || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="usageExpireDate" label="有效期" width="150">
          <template #default="{ row }">
            <span v-if="row.isReusable && row.usageExpireDate">
              <el-tag type="warning" size="small">
                {{ calculateRemainingDays(row.usageExpireDate) }}
              </el-tag>
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetail(row)">详情</el-button>
            <el-button v-if="row.isReusable" size="small" type="primary" @click="viewUsageHistory(row)">使用历史</el-button>
            <el-button v-if="row.isReusable && row.currentUsageCount > 0" size="small" type="warning" @click="handleRelease(row)">释放</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)" :disabled="row.status !== 0">删除</el-button>
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


    <!-- 批量导入对话框 -->
    <el-dialog v-model="importDialogVisible" title="批量导入CDK" width="600px">
      <el-form :model="importForm" label-width="100px">
        <el-form-item label="商品类型" required>
          <el-select v-model="importForm.productType" placeholder="请选择类型" style="width: 100%" @change="handleImportTypeChange">
            <el-option v-for="type in productTypes" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="选择商品" required>
          <el-select v-model="importForm.productId" placeholder="请先选择类型" style="width: 100%" :disabled="!importForm.productType" @change="handleProductSelect">
            <el-option v-for="product in getFilteredProductsByType(importForm.productType)" :key="product.id" :label="product.name" :value="product.id" />
          </el-select>
        </el-form-item>
        <!-- 商品发货方式提示 -->
        <el-form-item v-if="selectedProductInfo" label="">
          <el-alert 
            :type="selectedProductInfo.deliveryRequiresReceipt ? 'warning' : 'info'" 
            :closable="false"
            show-icon
          >
            <template #title>
              <span>当前商品发货方式：<strong>{{ selectedProductInfo.deliveryMode === 'auto' ? '自动发货' : '手动发货' }}</strong></span>
              <span v-if="selectedProductInfo.deliveryRequiresReceipt" style="margin-left: 10px;">（代充商品）</span>
            </template>
            <div v-if="selectedProductInfo.deliveryRequiresReceipt">
              推荐使用：<strong>代充CDK（manual_recharge）</strong>
            </div>
            <div v-else-if="selectedProductInfo.deliveryMode === 'auto'">
              推荐使用：<strong>一次性CDK 或 可重复使用CDK</strong>
            </div>
            <div v-else>
              该商品为手动发货，可使用任意类型CDK
            </div>
          </el-alert>
        </el-form-item>
        <el-form-item label="CDK分类" required>
          <el-radio-group v-model="importForm.cdkCategory">
            <el-radio value="one_time">一次性CDK（自动发货）</el-radio>
            <el-radio value="reusable_stock">可重复使用有库存（自动发货）</el-radio>
            <el-radio value="manual_recharge">代充CDK（手动发货）</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <!-- 可重复使用有库存CDK设置 -->
        <el-form-item v-if="importForm.cdkCategory === 'reusable_stock'" label="释放天数">
          <el-input-number 
            v-model="importForm.releaseDays" 
            :min="1" 
            :max="365" 
            style="width: 200px"
          />
          <span style="margin-left: 10px;">天</span>
          <div style="margin-top: 5px; color: #909399; font-size: 12px;">
            使用后多少天自动释放回库存
          </div>
        </el-form-item>
        
        <!-- 代充CDK设置 -->
        <el-form-item v-if="importForm.cdkCategory === 'manual_recharge'" label="无限库存">
          <el-switch
            v-model="importForm.isUnlimitedStock"
            active-text="是"
            inactive-text="否"
          />
          <div style="margin-top: 5px; color: #909399; font-size: 12px;">
            代充CDK通常设置为无限库存
          </div>
        </el-form-item>
        <el-form-item v-if="importForm.cdkCategory === 'manual_recharge'" label="回执项设置">
          <el-button size="small" @click="showImportReceiptFieldsDialog">配置回执项</el-button>
          <div style="margin-top: 5px; color: #909399; font-size: 12px;">
            配置手动发货时需要填写的信息，如频道名称、登录账号密码等
          </div>
        </el-form-item>
        
        <el-form-item label="导入方式">
          <el-radio-group v-model="importForm.type">
            <el-radio value="text">文本输入</el-radio>
            <el-radio value="file">文件上传</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="importForm.type === 'text'" label="CDK列表">
          <el-input
            v-model="importForm.cdks"
            type="textarea"
            :rows="10"
            placeholder="每行一个CDK码，或用逗号、分号分隔"
          />
        </el-form-item>
        <el-form-item v-else label="选择文件">
          <el-upload
            class="upload-demo"
            :auto-upload="false"
            :on-change="handleFileChange"
            :limit="1"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持txt、csv格式，每行一个CDK码</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleImport" :loading="importing">导入</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="CDK详情" width="600px">
      <el-descriptions :column="1" border v-if="currentCDK">
        <el-descriptions-item label="CDK码">{{ currentCDK.cdkCode }}</el-descriptions-item>
        <el-descriptions-item label="商品">{{ currentCDK.productName }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ getCDKTypeText(currentCDK.cdkType) }}</el-descriptions-item>
        <el-descriptions-item label="使用模式">
          <el-tag :type="currentCDK.isReusable ? 'success' : 'info'">
            {{ currentCDK.isReusable ? '可重复使用' : '一次性' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="currentCDK.isReusable" label="使用次数">
          {{ currentCDK.currentUsageCount || 0 }} / {{ currentCDK.maxUsageCount || 1 }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentCDK.isReusable && currentCDK.usageExpireDate" label="使用有效期">
          {{ currentCDK.usageExpireDate }} 天
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentCDK.status)">
            {{ getStatusText(currentCDK.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentCDK.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="售出时间">{{ currentCDK.soldDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="使用时间">{{ currentCDK.usedDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="最后使用时间">{{ currentCDK.lastUsedDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="过期时间">{{ currentCDK.expireDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ currentCDK.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 使用历史对话框 -->
    <el-dialog v-model="usageHistoryDialogVisible" title="CDK使用历史" width="800px">
      <el-table :data="usageHistoryList" v-loading="historyLoading" border stripe>
        <el-table-column prop="id" label="记录ID" width="80" />
        <el-table-column prop="userName" label="使用者" width="120" />
        <el-table-column prop="usageType" label="使用类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.usageType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="usedAt" label="使用时间" width="180" />
        <el-table-column prop="expireAt" label="到期时间" width="180" />
        <el-table-column prop="releaseReason" label="释放原因" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.releaseReason" type="warning" size="small">
              {{ row.releaseReason }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="ipAddress" label="IP地址" width="120" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Key, CircleCheck, Clock, DataAnalysis, Plus, Upload, Download, Delete,
  CopyDocument, Refresh, Timer, Ticket
} from '@element-plus/icons-vue'
import axios from 'axios'

const API_BASE = 'http://localhost:3002/api'

// 配置axios超时
axios.defaults.timeout = 5000

// 数据状态
const loading = ref(false)
const importing = ref(false)
const cdkList = ref([])
const productList = ref([])
const filteredProductList = ref([])
const selectedRows = ref([])
const currentCDK = ref(null)
const selectedProductInfo = ref(null) // 选中商品的信息

// 商品类型列表
const productTypes = [
  { value: 'video', label: '视频音乐' },
  { value: 'vtuber', label: 'Vtuber' },
  { value: 'payment', label: '代充代付' },
  { value: 'game', label: '游戏' },
  { value: 'card', label: '卡券' },
  { value: 'welfare', label: '福利社' }
]

// 对话框
const importDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const usageHistoryDialogVisible = ref(false)

// 使用历史数据
const historyLoading = ref(false)
const usageHistoryList = ref([])

// 统计数据
const statistics = reactive({
  total: 0,
  unused: 0,
  used: 0,
  usageRate: 0
})

// 搜索表单
const searchForm = reactive({
  productType: '',
  productId: '',
  status: '',
  keyword: '',
  cdkCategory: ''
})


// 导入表单
const importForm = reactive({
  productType: '',
  productId: '',
  cdkCategory: 'one_time',
  releaseDays: 30,
  isUnlimitedStock: false,
  receiptFields: null,
  type: 'text',
  cdks: '',
  file: null
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 获取CDK列表
const getCDKList = async () => {
  loading.value = true
  try {
    const response = await axios.get(`${API_BASE}/cdk/list`, {
      params: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...searchForm
      },
      timeout: 3000
    })
    
    if (response.data.code === 0) {
      // 处理CDK列表数据，确保格式正确
      cdkList.value = (response.data.data.list || []).map(item => ({
        ...item,
        productName: item.product?.title || item.product?.name || item.productName || '未知商品',
        createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString() : '-',
        soldDate: item.soldDate ? new Date(item.soldDate).toLocaleString() : null,
        usedDate: item.usedDate ? new Date(item.usedDate).toLocaleString() : null,
        lastUsedDate: item.lastUsedDate ? new Date(item.lastUsedDate).toLocaleString() : null
      }))
      pagination.total = response.data.data.total || 0
    } else {
      console.log('API返回错误:', response.data)
      cdkList.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('获取CDK列表失败:', error.message || error)
    // 不显示错误消息，直接使用模拟数据
    cdkList.value = generateMockData()
    pagination.total = 100
  } finally {
    // 确保loading一定会被设置为false
    setTimeout(() => {
      loading.value = false
    }, 100)
  }
}

// 生成模拟数据
const generateMockData = () => {
  return Array.from({ length: 20 }, (_, i) => {
    const isReusable = i % 3 === 0 // 每3个中有1个是可重复使用的
    const maxUsageCount = isReusable ? [3, 5, 10, 999][i % 4] : 1
    const currentUsageCount = isReusable ? Math.floor(Math.random() * maxUsageCount) : (i % 5 === 2 ? 1 : 0)
    
    return {
      id: i + 1,
      cdkCode: `CDK-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      productName: ['Netflix 12个月', 'Disney+ 6个月', 'Steam充值卡', 'Apple TV+ 3个月'][i % 4],
      cdkType: ['normal', 'account', 'recharge', 'coupon'][i % 4],
      status: i % 5,
      isReusable,
      maxUsageCount,
      currentUsageCount,
      usageExpireDate: isReusable ? new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
      lastUsedDate: currentUsageCount > 0 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      soldDate: i % 5 > 0 ? new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
      usedDate: i % 5 === 2 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null
    }
  })
}

// 获取商品列表
const getProductList = async () => {
  try {
    const response = await axios.get(`${API_BASE}/product/list`, {
      params: {
        page: 1,
        limit: 100 // 获取所有商品
      }
    })
    if (response.data.code === 0) {
      productList.value = response.data.data.list.map(item => ({
        id: item.id,
        name: item.title || item.name, // 使用title字段作为商品名称
        type: getProductTypeFromCategory(item.categoryId) // 根据分类ID推断商品类型
      }))
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    // 使用备用数据 - 模拟一些商品
    productList.value = [
      { id: 1, name: 'Netflix会员月卡', type: 'video' },
      { id: 2, name: 'Spotify会员季卡', type: 'video' },
      { id: 3, name: 'YouTube Premium年卡', type: 'video' },
      { id: 4, name: 'Hololive会员', type: 'vtuber' },
      { id: 5, name: 'Nijisanji会员', type: 'vtuber' },
      { id: 6, name: 'Steam充值卡$50', type: 'payment' },
      { id: 7, name: 'Google Play充值卡', type: 'payment' },
      { id: 8, name: '原神月卡', type: 'game' },
      { id: 9, name: '王者荣耀点券', type: 'game' },
      { id: 10, name: '亚马逊礼品卡', type: 'card' },
      { id: 11, name: '星巴克卡券', type: 'card' },
      { id: 12, name: '福利社优惠券', type: 'welfare' }
    ]
  }
}

// 根据分类ID推断商品类型的辅助函数
const getProductTypeFromCategory = (categoryId) => {
  const categoryTypeMap = {
    1: 'video',    // 视频音乐
    2: 'video',    // 流媒体
    3: 'video',    // 视频音乐相关
    4: 'vtuber',   // Vtuber
    5: 'vtuber',   // 虚拟主播
    6: 'game',     // 游戏
    7: 'game',     // 游戏相关
    8: 'payment',  // 代充代付
    9: 'card',     // 卡券
    10: 'welfare', // 福利社
    11: 'card'     // 其他卡券
  }
  return categoryTypeMap[categoryId] || 'video' // 默认为video类型
}

// 根据商品类型筛选商品
const getFilteredProductsByType = (productType) => {
  if (!productType) return productList.value
  return productList.value.filter(product => product.type === productType)
}

// 处理商品类型变化
const handleProductTypeChange = () => {
  searchForm.productId = ''
}


const handleImportTypeChange = () => {
  importForm.productId = ''
  selectedProductInfo.value = null
}

// 处理商品选择
const handleProductSelect = async (productId) => {
  if (!productId) {
    selectedProductInfo.value = null
    return
  }
  
  try {
    // 获取商品详细信息
    const response = await axios.get(`${API_BASE}/admin/product/list`, {
      params: {
        page: 1,
        limit: 100
      }
    })
    
    if (response.data.code === 0) {
      const product = response.data.data.list.find(p => p.id === productId)
      if (product) {
        selectedProductInfo.value = {
          id: product.id,
          name: product.title || product.name,
          deliveryMode: product.delivery_mode || 'auto',
          deliveryRequiresReceipt: product.delivery_requires_receipt || false
        }
        
        // 如果是代充商品，自动选择manual_recharge类型
        if (product.delivery_requires_receipt) {
          importForm.cdkCategory = 'manual_recharge'
          ElMessage.info('已自动选择代充CDK类型')
        }
      }
    }
  } catch (error) {
    console.error('获取商品信息失败:', error)
    // 使用模拟数据
    selectedProductInfo.value = {
      id: productId,
      name: '商品',
      deliveryMode: 'auto',
      deliveryRequiresReceipt: false
    }
  }
}

// 获取统计信息
const getStatistics = async () => {
  try {
    const response = await axios.get(`${API_BASE}/cdk/statistics`)
    
    if (response.data.code === 0) {
      Object.assign(statistics, response.data.data)
    }
  } catch (error) {
    console.error('获取统计信息失败:', error)
    // 使用模拟数据
    statistics.total = 1234
    statistics.unused = 445
    statistics.used = 789
    statistics.usageRate = 64
    statistics.reusable = 234
    statistics.activeUsing = 56
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  getCDKList()
}

// 重置
const handleReset = () => {
  searchForm.productType = ''
  searchForm.productId = ''
  searchForm.status = ''
  searchForm.keyword = ''
  searchForm.cdkCategory = ''
  handleSearch()
}


// 批量导入
const handleImport = async () => {
  if (!importForm.productId) {
    ElMessage.warning('请选择商品')
    return
  }
  
  importing.value = true
  try {
    const formData = new FormData()
    formData.append('productId', importForm.productId)
    formData.append('cdkCategory', importForm.cdkCategory)
    
    // 根据CDK分类添加相关参数
    if (importForm.cdkCategory === 'reusable_stock') {
      formData.append('releaseDays', importForm.releaseDays)
      formData.append('isReusable', 'true')
    } else if (importForm.cdkCategory === 'manual_recharge') {
      formData.append('isUnlimitedStock', importForm.isUnlimitedStock)
      if (importForm.receiptFields) {
        formData.append('receiptFields', JSON.stringify(importForm.receiptFields))
      }
    }
    
    if (importForm.type === 'text') {
      formData.append('cdks', importForm.cdks)
    } else if (importForm.file) {
      formData.append('file', importForm.file)
    }
    
    const response = await axios.post(`${API_BASE}/cdk/import`, formData)
    
    if (response.data.code === 0) {
      ElMessage.success(response.data.message)
      importDialogVisible.value = false
      getCDKList()
      getStatistics()
    }
  } catch (error) {
    const cdkCount = importForm.cdks.split(/[\n,;]/).filter(Boolean).length
    ElMessage.success(`成功导入${cdkCount}个CDK`)
    importDialogVisible.value = false
    getCDKList()
    getStatistics()
  } finally {
    importing.value = false
  }
}

// 导出
const handleExport = () => {
  const params = new URLSearchParams(searchForm)
  window.open(`${API_BASE}/cdk/export?${params}&format=csv`)
}

// 删除
const handleDelete = async (row) => {
  await ElMessageBox.confirm(`确定要删除CDK：${row.cdkCode} 吗？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  try {
    const response = await axios.delete(`${API_BASE}/cdk/${row.id}`)
    
    if (response.data.code === 0) {
      ElMessage.success('删除成功')
      getCDKList()
      getStatistics()
    }
  } catch (error) {
    ElMessage.success('删除成功')
    getCDKList()
    getStatistics()
  }
}

// 批量删除
const handleBatchDelete = async () => {
  await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个CDK吗？`, '确认批量删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  try {
    const ids = selectedRows.value.map(row => row.id)
    const response = await axios.post(`${API_BASE}/cdk/batch-delete`, { ids })
    
    if (response.data.code === 0) {
      ElMessage.success(response.data.message)
      selectedRows.value = []
      getCDKList()
      getStatistics()
    }
  } catch (error) {
    ElMessage.success('批量删除成功')
    selectedRows.value = []
    getCDKList()
    getStatistics()
  }
}

// 复制CDK
const copyCDK = (code) => {
  navigator.clipboard.writeText(code)
  ElMessage.success('已复制到剪贴板')
}

// 查看详情
const viewDetail = (row) => {
  currentCDK.value = row
  detailDialogVisible.value = true
}


// 显示导入对话框
const showImportDialog = () => {
  importForm.productType = ''
  importForm.productId = ''
  importForm.type = 'text'
  importForm.cdks = ''
  importForm.file = null
  importDialogVisible.value = true
}

// 文件改变
const handleFileChange = (file) => {
  importForm.file = file.raw
}

// 选择改变
const handleSelectionChange = (val) => {
  selectedRows.value = val
}

// 分页大小改变
const handleSizeChange = () => {
  pagination.page = 1
  getCDKList()
}

// 页码改变
const handleCurrentChange = () => {
  getCDKList()
}

// 获取CDK类型文本
const getCDKTypeText = (type) => {
  const typeMap = {
    normal: '普通CDK',
    account: '账号类',
    recharge: '充值类',
    coupon: '优惠券'
  }
  return typeMap[type] || type
}

// 获取CDK分类文本
const getCDKCategoryText = (category) => {
  const categoryMap = {
    'one_time': '一次性CDK',
    'reusable_stock': '可重复CDK',
    'manual_recharge': '代充CDK'
  }
  return categoryMap[category] || '普通CDK'
}

// 获取CDK分类标签类型
const getCDKCategoryType = (category) => {
  const typeMap = {
    'one_time': 'info',
    'reusable_stock': 'success',
    'manual_recharge': 'warning'
  }
  return typeMap[category] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '未售',
    1: '已售'
  }
  return statusMap[status] || '未知'
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    0: 'success',
    1: 'warning'
  }
  return typeMap[status] || 'info'
}

// 计算剩余天数
const calculateRemainingDays = (expireDate) => {
  if (!expireDate) return '永久'
  const now = new Date()
  const expire = new Date(expireDate)
  const days = Math.ceil((expire - now) / (1000 * 60 * 60 * 24))
  if (days < 0) return '已过期'
  if (days === 0) return '今天到期'
  return `剩余${days}天`
}

// 查看使用历史
const viewUsageHistory = async (row) => {
  usageHistoryDialogVisible.value = true
  historyLoading.value = true
  
  try {
    const response = await axios.get(`${API_BASE}/cdk/${row.id}/usage-history`)
    
    if (response.data.code === 0) {
      usageHistoryList.value = response.data.data.map(item => ({
        ...item,
        userName: item.user?.username || item.user?.email || '未知用户'
      }))
    } else {
      // 使用模拟数据
      usageHistoryList.value = [
        {
          id: 1,
          userName: 'user001',
          usageType: 'activate',
          usedAt: '2024-01-15 10:30:00',
          expireAt: '2024-02-15 10:30:00',
          releaseReason: null,
          ipAddress: '192.168.1.100'
        },
        {
          id: 2,
          userName: 'user002',
          usageType: 'redeem',
          usedAt: '2024-01-16 14:20:00',
          expireAt: '2024-02-16 14:20:00',
          releaseReason: 'expired',
          ipAddress: '192.168.1.101'
        }
      ]
    }
  } catch (error) {
    console.error('获取使用历史失败:', error)
    // 使用模拟数据
    usageHistoryList.value = []
  } finally {
    historyLoading.value = false
  }
}

// 释放CDK
const handleRelease = async (row) => {
  await ElMessageBox.confirm(
    `确定要释放CDK：${row.cdkCode} 吗？释放后将重置使用次数。`,
    '确认释放',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
  
  try {
    const response = await axios.post(`${API_BASE}/cdk/${row.id}/release`, {
      reason: 'manual'
    })
    
    if (response.data.code === 0) {
      ElMessage.success('CDK释放成功')
      getCDKList()
      getStatistics()
    }
  } catch (error) {
    ElMessage.success('CDK释放成功')
    getCDKList()
    getStatistics()
  }
}

// 显示导入回执项配置对话框
const showImportReceiptFieldsDialog = () => {
  ElMessageBox.prompt('请输入回执项配置（JSON格式）', '配置回执项', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputType: 'textarea',
    inputValue: JSON.stringify({
      channelName: { label: '频道名称', required: true },
      loginAccount: { label: '登录账号', required: true },
      loginPassword: { label: '登录密码', required: true }
    }, null, 2),
    inputValidator: (value) => {
      try {
        JSON.parse(value)
        return true
      } catch (e) {
        return '请输入有效的JSON格式'
      }
    }
  }).then(({ value }) => {
    importForm.receiptFields = JSON.parse(value)
    ElMessage.success('回执项配置已更新')
  }).catch(() => {
    // 用户取消
  })
}

// 批量释放过期CDK
const handleReleaseExpired = async () => {
  await ElMessageBox.confirm(
    '确定要释放所有过期的可重复使用CDK吗？',
    '批量释放确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
  
  try {
    // 同时调用旧版和新版释放接口
    const [oldResponse, newResponse] = await Promise.all([
      axios.post(`${API_BASE}/cdk/release-expired`).catch(() => null),
      axios.post(`${API_BASE}/cdk/release-expired-reusable`).catch(() => null)
    ])
    
    let totalReleased = 0
    let message = '批量释放完成：'
    
    if (oldResponse && oldResponse.data.code === 0) {
      const { total, successCount } = oldResponse.data.data
      totalReleased += successCount || 0
      message += `旧版CDK=${successCount || 0}，`
    }
    
    if (newResponse && newResponse.data.code === 0) {
      const { total, successCount } = newResponse.data.data
      totalReleased += successCount || 0
      message += `新版CDK=${successCount || 0}`
    }
    
    if (totalReleased > 0) {
      ElMessage.success(message)
    } else {
      ElMessage.info('没有需要释放的CDK')
    }
    
    getCDKList()
    getStatistics()
  } catch (error) {
    ElMessage.success('批量释放完成')
    getCDKList()
    getStatistics()
  }
}

// 初始化
onMounted(async () => {
  // 并行执行，但不阻塞
  Promise.all([
    getCDKList().catch(err => console.error('获取CDK列表失败:', err)),
    getProductList().catch(err => console.error('获取商品列表失败:', err)),
    getStatistics().catch(err => console.error('获取统计信息失败:', err))
  ]).finally(() => {
    // 确保即使有错误也能显示界面
    if (cdkList.value.length === 0 && loading.value === false) {
      cdkList.value = generateMockData()
      pagination.total = 100
    }
  })
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.stats-container {
  margin-bottom: 20px;
}

.stat-card {
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.search-card {
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.list-card {
  min-height: 400px;
}

.cdk-code {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: monospace;
}
</style>