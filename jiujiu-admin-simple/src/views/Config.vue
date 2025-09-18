<template>
  <div class="page-container">
    <el-tabs v-model="activeTab">
      <!-- 邮件服务配置 -->
      <el-tab-pane label="邮件服务配置" name="email">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>邮件服务设置</span>
              <el-button type="primary" size="small" @click="saveEmailConfig" :loading="saving">保存配置</el-button>
            </div>
          </template>
          
          <el-form :model="emailConfig" :rules="emailRules" ref="emailFormRef" label-width="150px">
            <el-divider content-position="left">Brevo 邮件服务配置</el-divider>
            
            <el-form-item label="启用邮件服务" prop="enabled">
              <el-switch v-model="emailConfig.enabled" />
              <span class="ml-2 text-gray-500">开启后系统将自动发送购买通知邮件</span>
            </el-form-item>
            
            <el-form-item label="Brevo API Key" prop="brevoApiKey" v-if="emailConfig.enabled">
              <el-input 
                v-model="emailConfig.brevoApiKey" 
                placeholder="请输入 Brevo API Key"
                show-password
              />
              <div class="text-sm text-gray-500 mt-1">
                从 <a href="https://app.brevo.com/settings/keys/api" target="_blank" class="text-blue-500">Brevo 控制台</a> 获取 API Key
              </div>
            </el-form-item>
            
            <el-form-item label="发件人邮箱" prop="fromEmail" v-if="emailConfig.enabled">
              <el-input v-model="emailConfig.fromEmail" placeholder="noreply@yourdomain.com" />
            </el-form-item>
            
            <el-form-item label="发件人名称" prop="fromName" v-if="emailConfig.enabled">
              <el-input v-model="emailConfig.fromName" placeholder="Digital Store" />
            </el-form-item>
            
            <el-divider content-position="left">邮件通知设置</el-divider>
            
            <el-form-item label="自动发货邮件" prop="autoDeliveryEmail">
              <el-switch v-model="emailConfig.autoDeliveryEmail" />
              <span class="ml-2 text-gray-500">自动发货成功后发送包含CDK的邮件</span>
            </el-form-item>
            
            <el-form-item label="手动发货待处理" prop="manualPendingEmail">
              <el-switch v-model="emailConfig.manualPendingEmail" />
              <span class="ml-2 text-gray-500">手动发货商品支付成功后发送待处理通知</span>
            </el-form-item>
            
            <el-form-item label="手动发货完成" prop="manualCompleteEmail">
              <el-switch v-model="emailConfig.manualCompleteEmail" />
              <span class="ml-2 text-gray-500">管理员手动发货后发送商品信息邮件</span>
            </el-form-item>
            
            <el-divider content-position="left">测试邮件发送</el-divider>
            
            <el-form-item label="测试邮箱">
              <el-input v-model="testEmail" placeholder="输入接收测试邮件的邮箱">
                <template #append>
                  <el-button @click="sendTestEmail" :loading="testing">发送测试</el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
      
      <!-- 邮件模板管理 -->
      <el-tab-pane label="邮件模板管理" name="templates">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>邮件模板设置</span>
              <el-button type="primary" size="small" @click="showTemplateDialog = true">添加模板</el-button>
            </div>
          </template>
          
          <el-table :data="emailTemplates" v-loading="loadingTemplates">
            <el-table-column prop="name" label="模板名称" width="200" />
            <el-table-column prop="type" label="模板类型" width="150">
              <template #default="{ row }">
                <el-tag v-if="row.type === 'auto_delivery'" type="success">自动发货</el-tag>
                <el-tag v-else-if="row.type === 'manual_pending'" type="warning">待发货通知</el-tag>
                <el-tag v-else-if="row.type === 'manual_complete'" type="primary">发货完成</el-tag>
                <el-tag v-else>自定义</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="subject" label="邮件主题" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" @change="toggleTemplate(row)" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="editTemplate(row)">编辑</el-button>
                <el-button type="info" size="small" @click="previewTemplate(row)">预览</el-button>
                <el-button type="danger" size="small" @click="deleteTemplate(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
      
      <!-- 邮件发送日志 -->
      <el-tab-pane label="邮件发送日志" name="logs">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>邮件发送记录</span>
              <el-button type="primary" size="small" @click="fetchEmailLogs" :loading="loadingLogs">
                <el-icon><RefreshRight /></el-icon> 刷新
              </el-button>
            </div>
          </template>
          
          <!-- 搜索过滤 -->
          <el-form :inline="true" :model="logFilter" class="mb-4">
            <el-form-item label="收件人">
              <el-input v-model="logFilter.email" placeholder="邮箱地址" clearable />
            </el-form-item>
            <el-form-item label="订单号">
              <el-input v-model="logFilter.orderNo" placeholder="订单号" clearable />
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="logFilter.status" placeholder="全部" clearable>
                <el-option label="成功" value="success" />
                <el-option label="失败" value="failed" />
                <el-option label="待发送" value="pending" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="fetchEmailLogs">搜索</el-button>
            </el-form-item>
          </el-form>
          
          <el-table :data="emailLogs" v-loading="loadingLogs">
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="recipient" label="收件人" width="200" />
            <el-table-column prop="subject" label="邮件主题" />
            <el-table-column prop="type" label="邮件类型" width="120">
              <template #default="{ row }">
                <el-tag v-if="row.type === 'auto_delivery'" type="success" size="small">自动发货</el-tag>
                <el-tag v-else-if="row.type === 'manual_pending'" type="warning" size="small">待发货</el-tag>
                <el-tag v-else-if="row.type === 'manual_complete'" type="primary" size="small">发货完成</el-tag>
                <el-tag v-else size="small">其他</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="orderNo" label="关联订单" width="150" />
            <el-table-column prop="status" label="发送状态" width="100">
              <template #default="{ row }">
                <el-tag v-if="row.status === 'success'" type="success" size="small">成功</el-tag>
                <el-tag v-else-if="row.status === 'failed'" type="danger" size="small">失败</el-tag>
                <el-tag v-else type="info" size="small">待发送</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sentAt" label="发送时间" width="160">
              <template #default="{ row }">
                {{ formatDate(row.sentAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button v-if="row.status === 'failed'" type="warning" size="small" @click="resendEmail(row)">重发</el-button>
                <el-button type="info" size="small" @click="viewEmailDetail(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 分页 -->
          <el-pagination
            v-model:current-page="logPagination.page"
            v-model:page-size="logPagination.limit"
            :total="logPagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="fetchEmailLogs"
            @current-change="fetchEmailLogs"
            class="mt-4"
          />
        </el-card>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 模板编辑对话框 -->
    <el-dialog 
      v-model="showTemplateDialog" 
      :title="editingTemplate ? '编辑模板' : '添加模板'"
      width="70%"
    >
      <el-form :model="templateForm" :rules="templateRules" ref="templateFormRef" label-width="120px">
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="templateForm.name" placeholder="例如：订单发货通知" />
        </el-form-item>
        
        <el-form-item label="模板类型" prop="type">
          <el-select v-model="templateForm.type" placeholder="请选择模板类型">
            <el-option label="自动发货通知" value="auto_delivery" />
            <el-option label="待发货通知" value="manual_pending" />
            <el-option label="发货完成通知" value="manual_complete" />
            <el-option label="自定义模板" value="custom" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="邮件主题" prop="subject">
          <el-input v-model="templateForm.subject" placeholder="例如：您的订单 {{orderNo}} 已发货">
            <template #append>
              <el-dropdown @command="insertVariable">
                <el-button>插入变量</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="{{orderNo}}">订单号</el-dropdown-item>
                    <el-dropdown-item command="{{productName}}">商品名称</el-dropdown-item>
                    <el-dropdown-item command="{{amount}}">金额</el-dropdown-item>
                    <el-dropdown-item command="{{userName}}">用户名</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="邮件内容" prop="content">
          <div class="template-editor">
            <el-radio-group v-model="templateForm.contentType" class="mb-2">
              <el-radio-button label="html">HTML模板</el-radio-button>
              <el-radio-button label="text">纯文本</el-radio-button>
            </el-radio-group>
            
            <el-input 
              v-model="templateForm.content" 
              type="textarea" 
              :rows="15"
              placeholder="邮件内容模板，支持变量替换"
            />
            
            <div class="variable-help mt-2">
              <el-alert type="info" :closable="false">
                <div>可用变量：</div>
                <div class="text-sm mt-1">
                  {{orderNo}} - 订单号 | {{productName}} - 商品名称 | {{amount}} - 金额 | 
                  {{cdkKeys}} - CDK密钥 | {{userName}} - 用户名 | {{userEmail}} - 用户邮箱
                </div>
              </el-alert>
            </div>
          </div>
        </el-form-item>
        
        <el-form-item label="启用状态">
          <el-switch v-model="templateForm.enabled" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showTemplateDialog = false">取消</el-button>
        <el-button type="primary" @click="saveTemplate">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { RefreshRight } from '@element-plus/icons-vue'
import request from '@/utils/request'

// 当前标签页
const activeTab = ref('email')

// 邮件配置
const emailConfig = reactive({
  enabled: false,
  brevoApiKey: '',
  fromEmail: '',
  fromName: '',
  autoDeliveryEmail: true,
  manualPendingEmail: true,
  manualCompleteEmail: true
})

const emailFormRef = ref()
const emailRules = {
  brevoApiKey: [
    { required: true, message: '请输入 Brevo API Key', trigger: 'blur' }
  ],
  fromEmail: [
    { required: true, message: '请输入发件人邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  fromName: [
    { required: true, message: '请输入发件人名称', trigger: 'blur' }
  ]
}

const saving = ref(false)
const testing = ref(false)
const testEmail = ref('')

// 邮件模板
const emailTemplates = ref([])
const loadingTemplates = ref(false)
const showTemplateDialog = ref(false)
const editingTemplate = ref(null)
const templateFormRef = ref()

const templateForm = reactive({
  name: '',
  type: 'custom',
  subject: '',
  content: '',
  contentType: 'html',
  enabled: true
})

const templateRules = {
  name: [
    { required: true, message: '请输入模板名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择模板类型', trigger: 'change' }
  ],
  subject: [
    { required: true, message: '请输入邮件主题', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入邮件内容', trigger: 'blur' }
  ]
}

// 邮件日志
const emailLogs = ref([])
const loadingLogs = ref(false)
const logFilter = reactive({
  email: '',
  orderNo: '',
  status: ''
})

const logPagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

// 获取邮件配置
const fetchEmailConfig = async () => {
  try {
    const res = await request.get('/api/admin/email/config')
    if (res.code === 0) {
      Object.assign(emailConfig, res.data)
    } else if (res.code === 401) {
      // 401错误会被request.js的拦截器处理，这里不需要额外处理
      console.log('需要重新登录')
    } else {
      ElMessage.error(res.message || '获取邮件配置失败')
    }
  } catch (error) {
    console.error('获取邮件配置失败:', error)
    // 网络错误等异常情况
    if (error.message && !error.message.includes('401')) {
      ElMessage.error('获取邮件配置失败')
    }
  }
}

// 保存邮件配置
const saveEmailConfig = async () => {
  try {
    await emailFormRef.value.validate()
    saving.value = true
    
    const res = await request.post('/api/admin/email/config', emailConfig)
    if (res.code === 0) {
      ElMessage.success('保存成功')
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (error) {
    if (error !== false) {
      ElMessage.error('保存失败')
    }
  } finally {
    saving.value = false
  }
}

// 发送测试邮件
const sendTestEmail = async () => {
  if (!testEmail.value) {
    ElMessage.warning('请输入测试邮箱')
    return
  }
  
  try {
    testing.value = true
    const res = await request.post('/api/admin/email/test', {
      email: testEmail.value
    })
    
    if (res.code === 0) {
      ElMessage.success('测试邮件已发送，请查收')
    } else {
      ElMessage.error(res.message || '发送失败')
    }
  } catch (error) {
    ElMessage.error('发送测试邮件失败')
  } finally {
    testing.value = false
  }
}

// 获取邮件模板列表
const fetchEmailTemplates = async () => {
  try {
    loadingTemplates.value = true
    const res = await request.get('/api/admin/email/templates')
    if (res.code === 0) {
      emailTemplates.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取模板列表失败')
  } finally {
    loadingTemplates.value = false
  }
}

// 编辑模板
const editTemplate = (row) => {
  editingTemplate.value = row
  Object.assign(templateForm, row)
  showTemplateDialog.value = true
}

// 保存模板
const saveTemplate = async () => {
  try {
    await templateFormRef.value.validate()
    
    const url = editingTemplate.value 
      ? `/api/admin/email/templates/${editingTemplate.value.id}`
      : '/api/admin/email/templates'
    
    const method = editingTemplate.value ? 'put' : 'post'
    
    const res = await request[method](url, templateForm)
    if (res.code === 0) {
      ElMessage.success('保存成功')
      showTemplateDialog.value = false
      fetchEmailTemplates()
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (error) {
    if (error !== false) {
      ElMessage.error('保存失败')
    }
  }
}

// 删除模板
const deleteTemplate = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该模板吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await request.delete(`/api/admin/email/templates/${row.id}`)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      fetchEmailTemplates()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 获取邮件日志
const fetchEmailLogs = async () => {
  try {
    loadingLogs.value = true
    const params = {
      page: logPagination.page,
      limit: logPagination.limit,
      ...logFilter
    }
    
    const res = await request.get('/api/admin/email/logs', { params })
    if (res.code === 0) {
      emailLogs.value = res.data.list
      logPagination.total = res.data.total
    }
  } catch (error) {
    ElMessage.error('获取日志失败')
  } finally {
    loadingLogs.value = false
  }
}

// 重发邮件
const resendEmail = async (row) => {
  try {
    const res = await request.post(`/api/admin/email/resend/${row.id}`)
    if (res.code === 0) {
      ElMessage.success('邮件已重新发送')
      fetchEmailLogs()
    } else {
      ElMessage.error(res.message || '重发失败')
    }
  } catch (error) {
    ElMessage.error('重发失败')
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

// 插入变量
const insertVariable = (variable) => {
  templateForm.subject += variable
}

// 切换模板状态
const toggleTemplate = async (row) => {
  try {
    const res = await request.put(`/api/admin/email/templates/${row.id}/toggle`)
    if (res.code === 0) {
      ElMessage.success(row.enabled ? '模板已启用' : '模板已禁用')
    } else {
      row.enabled = !row.enabled
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    row.enabled = !row.enabled
    ElMessage.error('操作失败')
  }
}

// 预览模板
const previewTemplate = (row) => {
  // TODO: 实现模板预览功能
  ElMessage.info('预览功能开发中')
}

// 查看邮件详情
const viewEmailDetail = (row) => {
  // TODO: 实现邮件详情查看
  ElMessage.info('详情功能开发中')
}

onMounted(() => {
  fetchEmailConfig()
  fetchEmailTemplates()
  fetchEmailLogs()
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

.ml-2 {
  margin-left: 8px;
}

.text-gray-500 {
  color: #6b7280;
}

.text-sm {
  font-size: 14px;
}

.text-blue-500 {
  color: #3b82f6;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-1 {
  margin-top: 4px;
}

.mt-2 {
  margin-top: 8px;
}

.mt-4 {
  margin-top: 16px;
}

.template-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 12px;
  background: #f5f7fa;
}
</style>