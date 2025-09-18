/**
 * 确认对话框组合式函数
 */
import { ElMessageBox, ElMessage } from 'element-plus'

/**
 * 确认删除操作
 * @param {Object} options - 配置选项
 * @returns {Promise<boolean>} 是否确认
 */
export function useDeleteConfirm(options = {}) {
  const {
    title = '确认删除',
    message = '此操作将永久删除该数据，是否继续？',
    confirmButtonText = '确定删除',
    cancelButtonText = '取消',
    type = 'warning',
    dangerouslyUseHTMLString = false
  } = options

  return ElMessageBox.confirm(
    message,
    title,
    {
      confirmButtonText,
      cancelButtonText,
      type,
      dangerouslyUseHTMLString,
      confirmButtonClass: 'el-button--danger'
    }
  ).then(() => true).catch(() => false)
}

/**
 * 批量删除确认
 * @param {number} count - 删除数量
 * @param {Object} options - 配置选项
 * @returns {Promise<boolean>} 是否确认
 */
export function useBatchDeleteConfirm(count, options = {}) {
  const {
    title = '批量删除确认',
    itemName = '项',
    confirmButtonText = '确定删除',
    cancelButtonText = '取消'
  } = options

  return useDeleteConfirm({
    title,
    message: `您已选择 ${count} ${itemName}，确定要批量删除吗？此操作不可撤销。`,
    confirmButtonText,
    cancelButtonText,
    ...options
  })
}

/**
 * 通用确认对话框
 * @param {Object} options - 配置选项
 * @returns {Promise<boolean>} 是否确认
 */
export function useConfirm(options = {}) {
  const {
    title = '确认操作',
    message = '确定要执行此操作吗？',
    confirmButtonText = '确定',
    cancelButtonText = '取消',
    type = 'warning',
    dangerouslyUseHTMLString = false,
    center = false,
    roundButton = false
  } = options

  return ElMessageBox.confirm(
    message,
    title,
    {
      confirmButtonText,
      cancelButtonText,
      type,
      dangerouslyUseHTMLString,
      center,
      roundButton
    }
  ).then(() => true).catch(() => false)
}

/**
 * 输入确认对话框
 * @param {Object} options - 配置选项
 * @returns {Promise<string|false>} 输入的值或false
 */
export function usePromptConfirm(options = {}) {
  const {
    title = '请输入',
    message = '请输入内容',
    confirmButtonText = '确定',
    cancelButtonText = '取消',
    inputPattern = null,
    inputErrorMessage = '输入格式不正确',
    inputPlaceholder = '请输入...',
    inputType = 'text',
    inputValidator = null
  } = options

  return ElMessageBox.prompt(
    message,
    title,
    {
      confirmButtonText,
      cancelButtonText,
      inputPattern,
      inputErrorMessage,
      inputPlaceholder,
      inputType,
      inputValidator
    }
  ).then(({ value }) => value).catch(() => false)
}

/**
 * 状态切换确认
 * @param {boolean} currentStatus - 当前状态
 * @param {Object} options - 配置选项
 * @returns {Promise<boolean>} 是否确认
 */
export function useStatusToggleConfirm(currentStatus, options = {}) {
  const {
    enableText = '启用',
    disableText = '禁用',
    itemName = '该项'
  } = options

  const action = currentStatus ? disableText : enableText
  const message = `确定要${action}${itemName}吗？`

  return useConfirm({
    title: `确认${action}`,
    message,
    type: currentStatus ? 'warning' : 'success',
    ...options
  })
}

/**
 * 保存确认（当有未保存的更改时）
 * @param {Object} options - 配置选项
 * @returns {Promise<'save'|'discard'|'cancel'>} 用户选择
 */
export function useSaveConfirm(options = {}) {
  const {
    title = '未保存的更改',
    message = '您有未保存的更改，是否保存？',
    saveButtonText = '保存',
    discardButtonText = '不保存',
    cancelButtonText = '取消'
  } = options

  return ElMessageBox.confirm(
    message,
    title,
    {
      confirmButtonText: saveButtonText,
      cancelButtonText: discardButtonText,
      type: 'warning',
      showCancelButton: true,
      distinguishCancelAndClose: true
    }
  ).then(() => 'save')
    .catch((action) => {
      if (action === 'cancel') {
        return 'cancel'
      }
      return 'discard'
    })
}

/**
 * 离开页面确认
 * @param {boolean} hasUnsavedChanges - 是否有未保存的更改
 * @param {Object} options - 配置选项
 * @returns {Promise<boolean>} 是否可以离开
 */
export function useLeaveConfirm(hasUnsavedChanges, options = {}) {
  if (!hasUnsavedChanges) {
    return Promise.resolve(true)
  }

  const {
    title = '离开页面确认',
    message = '您有未保存的更改，确定要离开此页面吗？',
    confirmButtonText = '离开',
    cancelButtonText = '留在此页'
  } = options

  return useConfirm({
    title,
    message,
    confirmButtonText,
    cancelButtonText,
    type: 'warning',
    ...options
  })
}

/**
 * 异步操作确认
 * @param {Function} asyncFn - 异步操作函数
 * @param {Object} options - 配置选项
 * @returns {Promise} 操作结果
 */
export async function useAsyncConfirm(asyncFn, options = {}) {
  const {
    confirmOptions = {},
    successMessage = '操作成功',
    errorMessage = '操作失败',
    showSuccess = true,
    showError = true
  } = options

  const confirmed = await useConfirm(confirmOptions)
  
  if (!confirmed) {
    return { success: false, cancelled: true }
  }

  try {
    const result = await asyncFn()
    
    if (showSuccess) {
      ElMessage.success(successMessage)
    }
    
    return { success: true, data: result }
  } catch (error) {
    if (showError) {
      ElMessage.error(errorMessage)
    }
    
    return { success: false, error }
  }
}

// 默认导出
export default {
  useDeleteConfirm,
  useBatchDeleteConfirm,
  useConfirm,
  usePromptConfirm,
  useStatusToggleConfirm,
  useSaveConfirm,
  useLeaveConfirm,
  useAsyncConfirm
}