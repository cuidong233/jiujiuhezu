/**
 * CDK工具函数
 */

// CDK类型映射
export const CDK_TYPE_MAP = {
  single: '一次性',
  reusable: '可重复使用'
}

// CDK状态映射
export const CDK_STATUS_MAP = {
  0: '未售',
  1: '已售',
  2: '已使用',
  3: '已过期',
  4: '已锁定'
}

// 获取CDK状态标签类型
export const getCDKStatusType = (status) => {
  const typeMap = {
    0: 'success',  // 未售 - 绿色
    1: 'info',     // 已售 - 灰色
    2: 'warning',  // 已使用 - 橙色
    3: 'danger',   // 已过期 - 红色
    4: 'info'      // 已锁定 - 灰色
  }
  return typeMap[status] || 'info'
}

// 格式化使用次数显示
export const formatUsageCount = (current, max) => {
  if (!max || max === 1) return '一次性'
  if (max === 999 || max === 9999) return `${current}/不限`
  return `${current}/${max}次`
}

// 计算剩余有效期（天数）
export const calculateRemainingDays = (expireDate) => {
  if (!expireDate) return '永久'
  
  const now = new Date()
  const expire = new Date(expireDate)
  const days = Math.ceil((expire - now) / (1000 * 60 * 60 * 24))
  
  if (days < 0) return '已过期'
  if (days === 0) return '今天到期'
  if (days <= 3) return `仅剩${days}天`
  if (days <= 7) return `剩余${days}天`
  if (days <= 30) return `剩余${days}天`
  if (days <= 365) return `剩余${Math.floor(days / 30)}个月`
  
  return `剩余${Math.floor(days / 365)}年`
}

// 格式化日期时间
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

// 格式化日期
export const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

// 生成CDK码（前端预览用）
export const generateCDKCode = (prefix = 'CDK', length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = prefix + '-'
  
  for (let i = 0; i < length; i++) {
    if (i > 0 && i % 4 === 0) {
      code += '-'
    }
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return code
}

// 验证CDK码格式
export const validateCDKCode = (code) => {
  if (!code) return false
  
  // CDK码格式：PREFIX-XXXX-XXXX-XXXX
  const pattern = /^[A-Z0-9]+-([A-Z0-9]{4}-){2,}[A-Z0-9]{4}$/
  return pattern.test(code)
}

// 计算CDK使用进度百分比
export const calculateUsageProgress = (current, max) => {
  if (!max || max === 0) return 0
  if (current >= max) return 100
  return Math.round((current / max) * 100)
}

// 获取CDK类型标签颜色
export const getCDKTypeColor = (isReusable) => {
  return isReusable ? 'success' : 'info'
}

// 获取释放原因文本
export const getReleaseReasonText = (reason) => {
  const reasonMap = {
    'expired': '过期释放',
    'manual': '手动释放',
    'system': '系统释放',
    'admin': '管理员释放'
  }
  return reasonMap[reason] || reason
}

// 获取使用类型文本
export const getUsageTypeText = (type) => {
  const typeMap = {
    'normal': '正常使用',
    'redeem': '兑换',
    'activate': '激活',
    'bind': '绑定'
  }
  return typeMap[type] || type
}

// 批量导出CDK为文本
export const exportCDKsAsText = (cdks) => {
  if (!cdks || cdks.length === 0) return ''
  
  const lines = cdks.map(cdk => {
    const status = CDK_STATUS_MAP[cdk.status] || '未知'
    const type = cdk.isReusable ? '可重复使用' : '一次性'
    const usage = cdk.isReusable ? `${cdk.currentUsageCount}/${cdk.maxUsageCount}` : '-'
    
    return `${cdk.cdkCode}\t${cdk.productName}\t${type}\t${usage}\t${status}`
  })
  
  // 添加表头
  lines.unshift('CDK码\t商品名称\t使用类型\t使用次数\t状态')
  
  return lines.join('\n')
}

// 解析批量导入的CDK文本
export const parseCDKImportText = (text) => {
  if (!text) return []
  
  // 按行分割，支持多种分隔符
  const lines = text.split(/[\r\n]+/)
  const cdks = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    
    // 支持多种分隔符：逗号、分号、制表符
    const parts = trimmed.split(/[,;\t]/)
    
    // 取第一个非空部分作为CDK码
    const cdkCode = parts.find(p => p.trim())?.trim()
    
    if (cdkCode && cdkCode.length > 0) {
      cdks.push(cdkCode)
    }
  }
  
  // 去重
  return [...new Set(cdks)]
}

// 检查CDK是否可释放
export const canReleaseCDK = (cdk) => {
  if (!cdk.isReusable) return false
  if (cdk.currentUsageCount === 0) return false
  if (cdk.status === 3 || cdk.status === 4) return false // 已过期或已锁定
  
  return true
}

// 检查CDK是否已过期
export const isCDKExpired = (cdk) => {
  if (!cdk.expireDate && !cdk.usageExpireDate) return false
  
  const now = new Date()
  
  // 检查总体过期时间
  if (cdk.expireDate && new Date(cdk.expireDate) < now) {
    return true
  }
  
  // 检查使用有效期
  if (cdk.isReusable && cdk.usageExpireDate && cdk.lastUsedDate) {
    const lastUsed = new Date(cdk.lastUsedDate)
    const expireDays = parseInt(cdk.usageExpireDate)
    const expireTime = new Date(lastUsed.getTime() + expireDays * 24 * 60 * 60 * 1000)
    
    if (expireTime < now) {
      return true
    }
  }
  
  return false
}

// 获取CDK建议操作
export const getCDKSuggestedAction = (cdk) => {
  if (cdk.status === 0) return '可售'
  if (cdk.status === 1) return '待发货'
  if (cdk.status === 2 && !cdk.isReusable) return '已完成'
  if (cdk.status === 2 && cdk.isReusable) {
    if (cdk.currentUsageCount >= cdk.maxUsageCount) return '使用完毕'
    return '使用中'
  }
  if (cdk.status === 3) return '需要释放或删除'
  if (cdk.status === 4) return '需要解锁'
  
  return '无'
}

// 批量生成模拟CDK数据（开发测试用）
export const generateMockCDKs = (count = 10, options = {}) => {
  const {
    prefix = 'TEST',
    isReusable = false,
    maxUsageCount = 5,
    productName = '测试商品'
  } = options
  
  const cdks = []
  
  for (let i = 0; i < count; i++) {
    const code = generateCDKCode(prefix)
    const status = Math.floor(Math.random() * 5)
    const currentUsage = isReusable ? Math.floor(Math.random() * maxUsageCount) : (status === 2 ? 1 : 0)
    
    cdks.push({
      id: i + 1,
      cdkCode: code,
      productName,
      cdkType: 'normal',
      status,
      isReusable,
      maxUsageCount: isReusable ? maxUsageCount : 1,
      currentUsageCount: currentUsage,
      usageExpireDate: isReusable ? 30 : null,
      lastUsedDate: currentUsage > 0 ? new Date().toISOString() : null,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      expireDate: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString() : null
    })
  }
  
  return cdks
}

// 默认导出所有工具函数
export default {
  CDK_TYPE_MAP,
  CDK_STATUS_MAP,
  getCDKStatusType,
  formatUsageCount,
  calculateRemainingDays,
  formatDateTime,
  formatDate,
  generateCDKCode,
  validateCDKCode,
  calculateUsageProgress,
  getCDKTypeColor,
  getReleaseReasonText,
  getUsageTypeText,
  exportCDKsAsText,
  parseCDKImportText,
  canReleaseCDK,
  isCDKExpired,
  getCDKSuggestedAction,
  generateMockCDKs
}