/**
 * API请求组合式函数
 */
import { ref, computed } from 'vue'
import { useApiStore } from '@/stores/api'
import { ElMessage } from 'element-plus'

export function useApi() {
  const apiStore = useApiStore()
  
  // 响应式状态
  const loading = ref(false)
  const error = ref(null)
  const data = ref(null)

  // 计算属性
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)
  const hasData = computed(() => !!data.value)

  // 执行请求
  const execute = async (requestFn, options = {}) => {
    const {
      showLoading = true,
      resetData = true,
      onSuccess,
      onError
    } = options

    if (resetData) {
      data.value = null
      error.value = null
    }

    if (showLoading) {
      loading.value = true
    }

    try {
      const result = await requestFn()
      
      if (result.success) {
        data.value = result.data
        error.value = null
        
        if (onSuccess) {
          onSuccess(result.data)
        }
        
        return result
      } else {
        error.value = result.message || '请求失败'
        
        if (onError) {
          onError(result)
        }
        
        return result
      }
    } catch (err) {
      error.value = err.message || '网络错误'
      
      if (onError) {
        onError(err)
      }
      
      return { success: false, error: err }
    } finally {
      if (showLoading) {
        loading.value = false
      }
    }
  }

  // 重置状态
  const reset = () => {
    loading.value = false
    error.value = null
    data.value = null
  }

  // 清除错误
  const clearError = () => {
    error.value = null
  }

  return {
    // 状态
    loading,
    error,
    data,
    
    // 计算属性
    isLoading,
    hasError,
    hasData,
    
    // 方法
    execute,
    reset,
    clearError,
    
    // API方法
    get: apiStore.get,
    post: apiStore.post,
    put: apiStore.put,
    del: apiStore.del,
    delete: apiStore.del, // 别名，兼容delete关键字
    upload: apiStore.upload
  }
}

/**
 * 分页数据管理
 */
export function usePagination(fetchFn, options = {}) {
  const {
    defaultPageSize = 20,
    autoLoad = true
  } = options

  // 分页状态
  const currentPage = ref(1)
  const pageSize = ref(defaultPageSize)
  const total = ref(0)
  const list = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 计算属性
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))
  const hasMore = computed(() => currentPage.value < totalPages.value)
  const isEmpty = computed(() => list.value.length === 0)

  // 加载数据
  const loadData = async (params = {}) => {
    loading.value = true
    error.value = null

    try {
      const result = await fetchFn({
        page: currentPage.value,
        limit: pageSize.value,
        ...params
      })

      if (result.success) {
        list.value = result.data.list || []
        total.value = result.data.pagination?.total || result.data.total || 0
        
        // 更新分页信息
        if (result.data.pagination) {
          currentPage.value = result.data.pagination.page
          pageSize.value = result.data.pagination.limit
        }
      } else {
        error.value = result.message
        ElMessage.error(result.message || '加载数据失败')
      }

      return result
    } catch (err) {
      error.value = err.message
      ElMessage.error('加载数据失败')
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  // 刷新当前页
  const refresh = (params) => {
    return loadData(params)
  }

  // 跳转到指定页
  const goToPage = (page, params) => {
    currentPage.value = page
    return loadData(params)
  }

  // 下一页
  const nextPage = (params) => {
    if (hasMore.value) {
      return goToPage(currentPage.value + 1, params)
    }
  }

  // 上一页
  const prevPage = (params) => {
    if (currentPage.value > 1) {
      return goToPage(currentPage.value - 1, params)
    }
  }

  // 改变页大小
  const changePageSize = (size, params) => {
    pageSize.value = size
    currentPage.value = 1
    return loadData(params)
  }

  // 重置
  const reset = () => {
    currentPage.value = 1
    pageSize.value = defaultPageSize
    total.value = 0
    list.value = []
    error.value = null
  }

  // 自动加载
  if (autoLoad) {
    loadData()
  }

  return {
    // 状态
    currentPage,
    pageSize,
    total,
    list,
    loading,
    error,
    
    // 计算属性
    totalPages,
    hasMore,
    isEmpty,
    
    // 方法
    loadData,
    refresh,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    reset
  }
}