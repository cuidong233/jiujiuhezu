<template>
  <div class="vip-management">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="VIP等级">
          <el-select v-model="searchForm.level" placeholder="请选择">
            <el-option label="全部" value=""></el-option>
            <el-option label="VIP1" value="1"></el-option>
            <el-option label="VIP2" value="2"></el-option>
            <el-option label="VIP3" value="3"></el-option>
            <el-option label="VIP4" value="4"></el-option>
            <el-option label="VIP5" value="5"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">添加VIP配置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="VIP用户列表" name="users">
        <el-table :data="vipUsers" border style="width: 100%" v-loading="loading">
          <el-table-column prop="id" label="ID" width="80"></el-table-column>
          <el-table-column prop="username" label="用户名"></el-table-column>
          <el-table-column prop="level" label="VIP等级">
            <template #default="scope">
              <el-tag :type="getVipTagType(scope.row.level)">VIP{{ scope.row.level }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="totalRecharge" label="累计充值">
            <template #default="scope">
              ¥{{ scope.row.totalRecharge }}
            </template>
          </el-table-column>
          <el-table-column prop="expireTime" label="到期时间"></el-table-column>
          <el-table-column prop="discount" label="享受折扣">
            <template #default="scope">
              {{ scope.row.discount }}折
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button type="text" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button type="text" @click="handleRenew(scope.row)">续费</el-button>
              <el-button type="text" @click="handleDetail(scope.row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="VIP配置" name="config">
        <el-table :data="vipConfig" border style="width: 100%">
          <el-table-column prop="level" label="VIP等级">
            <template #default="scope">
              <el-tag :type="getVipTagType(scope.row.level)">VIP{{ scope.row.level }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="等级名称"></el-table-column>
          <el-table-column prop="minRecharge" label="充值门槛">
            <template #default="scope">
              ¥{{ scope.row.minRecharge }}
            </template>
          </el-table-column>
          <el-table-column prop="discount" label="折扣">
            <template #default="scope">
              {{ scope.row.discount }}折
            </template>
          </el-table-column>
          <el-table-column prop="duration" label="有效期">
            <template #default="scope">
              {{ scope.row.duration }}天
            </template>
          </el-table-column>
          <el-table-column prop="benefits" label="权益说明"></el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button type="text" @click="handleEditConfig(scope.row)">编辑</el-button>
              <el-button type="text" @click="handleDeleteConfig(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="VIP统计" name="statistics">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card>
              <div class="stat-item">
                <div class="stat-title">VIP用户总数</div>
                <div class="stat-value">1,258</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card>
              <div class="stat-item">
                <div class="stat-title">本月新增VIP</div>
                <div class="stat-value">86</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card>
              <div class="stat-item">
                <div class="stat-title">VIP总收入</div>
                <div class="stat-value">¥458,920</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card>
              <div class="stat-item">
                <div class="stat-title">续费率</div>
                <div class="stat-value">68.5%</div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>

    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('users')
const searchForm = reactive({
  level: '',
  username: ''
})

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(50)

const vipUsers = ref([])
const loading = ref(false)

// 获取VIP用户列表
const getVipList = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: currentPage.value,
      pageSize: pageSize.value
    })
    
    if (searchForm.level) {
      params.append('level', searchForm.level)
    }
    
    const response = await fetch(`/api/vip/list?${params}`)
    const result = await response.json()
    
    if (result.code === 0) {
      vipUsers.value = result.data.list.map(item => ({
        id: item.id,
        username: item.userName,
        level: item.level,
        totalRecharge: item.totalRecharge,
        expireTime: item.expireTime?.split(' ')[0],
        discount: item.level === 1 ? 9.5 : item.level === 2 ? 9.0 : item.level === 3 ? 8.5 : item.level === 4 ? 8.0 : 7.5
      }))
      total.value = result.data.total
    }
  } catch (error) {
    console.error('获取VIP列表失败:', error)
    ElMessage.error('获取VIP列表失败')
  } finally {
    loading.value = false
  }
}

const vipConfig = ref([])

// 获取VIP配置
const getVipLevels = async () => {
  try {
    const response = await fetch('/api/vip/levels')
    const result = await response.json()
    
    if (result.code === 0) {
      vipConfig.value = result.data.map(item => ({
        level: parseInt(item.level.replace('VIP', '')),
        name: item.name,
        minRecharge: item.requiredAmount,
        discount: item.discount * 10,
        duration: item.duration,
        benefits: item.benefits.map(b => b.name).join('，')
      }))
    }
  } catch (error) {
    console.error('获取VIP配置失败:', error)
    // 使用模拟数据
    vipConfig.value = [
      {
        level: 1,
        name: '青铜会员',
        minRecharge: 1000,
        discount: 9.5,
        duration: 30,
        benefits: '享受9.5折优惠'
      },
      {
        level: 2,
        name: '白银会员',
        minRecharge: 5000,
        discount: 9.0,
        duration: 90,
        benefits: '享受9折优惠，专属客服'
      }
    ]
  }
}

const getVipTagType = (level) => {
  const types = ['', 'info', '', 'warning', '', 'danger']
  return types[level] || ''
}

const handleSearch = () => {
  currentPage.value = 1
  getVipList()
  ElMessage.success('查询成功')
}

const handleReset = () => {
  searchForm.level = ''
  searchForm.username = ''
  handleSearch()
}

const handleAdd = () => {
  ElMessage.info('添加VIP配置')
}

const handleEdit = (row) => {
  ElMessage.info('编辑用户VIP信息')
}

const handleRenew = (row) => {
  ElMessage.info('VIP续费')
}

const handleDetail = (row) => {
  ElMessage.info('查看详情')
}

const handleEditConfig = (row) => {
  ElMessage.info('编辑VIP配置')
}

const handleDeleteConfig = (row) => {
  ElMessage.warning('删除VIP配置')
}

const handleSizeChange = (val) => {
  pageSize.value = val
  getVipList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getVipList()
}

// 初始化
onMounted(() => {
  getVipList()
  getVipLevels()
})
</script>

<style scoped>
.vip-management {
  padding: 20px;
  background: var(--bg-color);
  min-height: calc(100vh - 60px);
}

.search-card {
  margin-bottom: 20px;
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