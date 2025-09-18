<template>
  <div class="data-table">
    <!-- 搜索栏 -->
    <el-card v-if="showSearch" class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <slot name="search" :form="searchForm" :loading="loading">
          <!-- 默认搜索表单 -->
        </slot>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">
            查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <slot name="search-actions" :search="handleSearch" :reset="handleReset">
            <!-- 额外的搜索按钮 -->
          </slot>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-card v-if="showActions" class="action-card">
      <div class="action-bar">
        <div class="action-left">
          <slot name="actions" :refresh="handleRefresh" :selected="selectedRows">
            <el-button type="primary" @click="$emit('add')">
              <el-icon><Plus /></el-icon>
              添加
            </el-button>
          </slot>
        </div>
        <div class="action-right">
          <el-button @click="handleRefresh" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <slot name="extra-actions">
            <!-- 额外操作按钮 -->
          </slot>
        </div>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table
        ref="tableRef"
        :data="data"
        v-loading="loading"
        :border="border"
        :stripe="stripe"
        :height="height"
        :max-height="maxHeight"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        v-bind="$attrs"
      >
        <!-- 多选列 -->
        <el-table-column
          v-if="selectable"
          type="selection"
          width="50"
          align="center"
        />
        
        <!-- 序号列 -->
        <el-table-column
          v-if="showIndex"
          type="index"
          label="序号"
          width="60"
          align="center"
          :index="getIndex"
        />

        <!-- 自定义列 -->
        <slot :data="data" :loading="loading" />

        <!-- 操作列 -->
        <el-table-column
          v-if="showOperations"
          label="操作"
          :width="operationWidth"
          :fixed="operationFixed"
          align="center"
        >
          <template #default="{ row, $index }">
            <slot name="operations" :row="row" :index="$index">
              <el-button size="small" @click="$emit('edit', row)">
                编辑
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="$emit('delete', row)"
              >
                删除
              </el-button>
            </slot>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-if="showPagination && pagination"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :page-sizes="pageSizes"
        :total="pagination.total"
        :layout="paginationLayout"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        class="pagination"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Plus, Refresh } from '@element-plus/icons-vue'

// Props定义
const props = defineProps({
  // 数据
  data: {
    type: Array,
    default: () => []
  },
  
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  },
  
  // 分页信息
  pagination: {
    type: Object,
    default: null
  },
  
  // 搜索表单
  searchForm: {
    type: Object,
    default: () => ({})
  },
  
  // 显示控制
  showSearch: {
    type: Boolean,
    default: true
  },
  
  showActions: {
    type: Boolean,
    default: true
  },
  
  showPagination: {
    type: Boolean,
    default: true
  },
  
  showIndex: {
    type: Boolean,
    default: false
  },
  
  showOperations: {
    type: Boolean,
    default: true
  },
  
  // 表格配置
  border: {
    type: Boolean,
    default: true
  },
  
  stripe: {
    type: Boolean,
    default: true
  },
  
  height: {
    type: [String, Number],
    default: undefined
  },
  
  maxHeight: {
    type: [String, Number],
    default: undefined
  },
  
  selectable: {
    type: Boolean,
    default: false
  },
  
  // 操作列配置
  operationWidth: {
    type: [String, Number],
    default: '200'
  },
  
  operationFixed: {
    type: [String, Boolean],
    default: 'right'
  },
  
  // 分页配置
  pageSizes: {
    type: Array,
    default: () => [10, 20, 50, 100]
  },
  
  paginationLayout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper'
  }
})

// 事件定义
const emit = defineEmits([
  'search',
  'reset', 
  'refresh',
  'add',
  'edit',
  'delete',
  'selection-change',
  'sort-change',
  'page-change',
  'size-change'
])

// 引用
const tableRef = ref()

// 选中的行
const selectedRows = ref([])

// 计算序号
const getIndex = (index) => {
  if (props.pagination) {
    return (props.pagination.page - 1) * props.pagination.limit + index + 1
  }
  return index + 1
}

// 处理搜索
const handleSearch = () => {
  emit('search', props.searchForm)
}

// 处理重置
const handleReset = () => {
  // 重置搜索表单
  Object.keys(props.searchForm).forEach(key => {
    if (typeof props.searchForm[key] === 'string') {
      props.searchForm[key] = ''
    } else if (typeof props.searchForm[key] === 'number') {
      props.searchForm[key] = null
    } else if (Array.isArray(props.searchForm[key])) {
      props.searchForm[key] = []
    } else {
      props.searchForm[key] = null
    }
  })
  
  emit('reset')
}

// 处理刷新
const handleRefresh = () => {
  emit('refresh')
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
  emit('selection-change', selection)
}

// 处理排序变化
const handleSortChange = (sort) => {
  emit('sort-change', sort)
}

// 处理页码变化
const handlePageChange = (page) => {
  emit('page-change', page)
}

// 处理页大小变化
const handleSizeChange = (size) => {
  emit('size-change', size)
}

// 暴露方法
defineExpose({
  tableRef,
  selectedRows,
  clearSelection: () => tableRef.value?.clearSelection(),
  toggleRowSelection: (row, selected) => tableRef.value?.toggleRowSelection(row, selected),
  toggleAllSelection: () => tableRef.value?.toggleAllSelection(),
  setCurrentRow: (row) => tableRef.value?.setCurrentRow(row)
})
</script>

<style scoped>
.data-table {
  .search-card,
  .action-card,
  .table-card {
    margin-bottom: 20px;
  }
  
  .search-form {
    margin-bottom: 0;
  }
  
  .action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .action-left,
  .action-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .pagination {
    margin-top: 20px;
    text-align: right;
  }
}
</style>