<template>
  <div class="order-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
          <div class="header-actions">
            <el-switch
              v-model="isPolling"
              active-text="自动刷新"
              inactive-text="手动刷新"
              @change="handlePollingChange"
              style="margin-right: 15px;"
            />
            <el-button type="primary" @click="exportOrders">导出订单</el-button>
            <el-button type="success" @click="fetchStatistics">查看统计</el-button>
            <el-button type="info" @click="fetchOrders" :loading="loading">
              <el-icon style="margin-right: 5px;"><RefreshRight /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-area">
        <!-- 快速筛选按钮 -->
        <div class="quick-filter-buttons" style="margin-bottom: 15px;">
          <el-button-group>
            <el-button :type="quickFilter === 'all' ? 'primary' : 'default'" @click="setQuickFilter('all')">
              全部订单
            </el-button>
            <el-button :type="quickFilter === 'pending_delivery' ? 'primary' : 'default'" @click="setQuickFilter('pending_delivery')">
              待发货
              <el-badge v-if="globalPendingDeliveryCount > 0" :value="globalPendingDeliveryCount" class="filter-badge" />
            </el-button>
            <el-button :type="quickFilter === 'pending_payment' ? 'primary' : 'default'" @click="setQuickFilter('pending_payment')">
              待支付
            </el-button>
            <el-button :type="quickFilter === 'completed' ? 'primary' : 'default'" @click="setQuickFilter('completed')">
              已完成
            </el-button>
          </el-button-group>
        </div>
        
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="订单号">
            <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable />
          </el-form-item>
          <el-form-item label="用户ID">
            <el-input v-model="searchForm.userId" placeholder="请输入用户ID" clearable />
          </el-form-item>
          <el-form-item label="支付状态">
            <el-select v-model="searchForm.paymentStatus" placeholder="全部" clearable>
              <el-option label="全部" value="" />
              <el-option label="待支付" :value="0" />
              <el-option label="已支付" :value="1" />
              <el-option label="支付失败" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="订单状态">
            <el-select v-model="searchForm.orderStatus" placeholder="全部" clearable>
              <el-option label="全部" value="" />
              <el-option label="待处理" :value="0" />
              <el-option label="处理中" :value="1" />
              <el-option label="已完成" :value="2" />
              <el-option label="已取消" :value="3" />
              <el-option label="已退款" :value="4" />
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 统计信息 -->
      <div v-if="statistics" class="statistics-panel">
        <el-row :gutter="20">
          <el-col :span="4">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.totalOrders }}</div>
              <div class="stat-label">总订单数</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.pendingPayment }}</div>
              <div class="stat-label">待支付</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.paidOrders }}</div>
              <div class="stat-label">已支付</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.completedOrders }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.cancelledOrders }}</div>
              <div class="stat-label">已取消</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="stat-item">
              <div class="stat-value text-primary">￥{{ (Number(statistics.totalRevenue) || 0).toFixed(2) }}</div>
              <div class="stat-label">总销售额</div>
            </div>
          </el-col>
        </el-row>
        <!-- 今日统计 -->
        <el-row :gutter="20" style="margin-top: 15px;">
          <el-col :span="8">
            <div class="stat-item today-stat">
              <div class="stat-value">{{ statistics.todayOrders || 0 }}</div>
              <div class="stat-label">今日订单</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item today-stat">
              <div class="stat-value">{{ statistics.todayPaidOrders || 0 }}</div>
              <div class="stat-label">今日已支付</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item today-stat">
              <div class="stat-value text-success">￥{{ (Number(statistics.todayRevenue) || 0).toFixed(2) }}</div>
              <div class="stat-label">今日收入</div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 订单表格 -->
      <el-table :data="orderList" v-loading="loading" border style="width: 100%">
        <el-table-column prop="orderNo" label="订单编号" width="180" fixed="left">
          <template #default="{ row }">
            <el-link type="primary" @click="viewOrderDetail(row)">{{ row.orderNo }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="productName" label="商品名称" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.productName }}</span>
            <el-tag v-if="row.isProxyRecharge || row.deliveryRequiresReceipt" type="warning" size="small" style="margin-left: 5px;">代充</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sku" label="订单SKU" width="120">
          <template #default="{ row }">
            {{ row.sku || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="salePrice" label="售卖价格" width="100">
          <template #default="{ row }">
            ￥{{ row.salePrice || row.unitPrice }}
          </template>
        </el-table-column>
        <el-table-column prop="productImage" label="商品图片" width="100">
          <template #default="{ row }">
            <el-image 
              v-if="row.productImage" 
              :src="row.productImage" 
              style="width: 60px; height: 60px"
              fit="cover"
              :preview-src-list="[row.productImage]"
            >
              <template #error>
                <div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; background: #f5f7fa;">
                  <span style="font-size: 12px; color: #909399;">暂无图片</span>
                </div>
              </template>
            </el-image>
            <span v-else style="color: #909399; font-size: 12px;">暂无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="userId" label="消费者" width="120">
          <template #default="{ row }">
            {{ row.consumerNickname || row.userName || row.userEmail || `用户${row.userId}` }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="下单时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="expireTime" label="过期时间" width="160">
          <template #default="{ row }">
            <span v-if="row.expireTime">
              {{ formatDate(row.expireTime) }}
            </span>
            <span v-else style="color: #909399;">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderStatus" label="订单状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.orderStatus === 0" type="info" size="small">待处理</el-tag>
            <el-tag v-else-if="row.orderStatus === 1" type="warning" size="small">处理中</el-tag>
            <el-tag v-else-if="row.orderStatus === 2" type="success" size="small">已完成</el-tag>
            <el-tag v-else-if="row.orderStatus === 3" type="info" size="small">已取消</el-tag>
            <el-tag v-else-if="row.orderStatus === 4" type="danger" size="small">已退款</el-tag>
            <el-tag v-else type="info" size="small">未知</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="paymentStatus" label="支付状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.paymentStatus === 0" type="warning" size="small">待支付</el-tag>
            <el-tag v-else-if="row.paymentStatus === 1" type="success" size="small">已支付</el-tag>
            <el-tag v-else-if="row.paymentStatus === 2" type="danger" size="small">支付失败</el-tag>
            <el-tag v-else type="info" size="small">未知</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deliveryMode" label="发货模式" width="90" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.deliveryMode === 'auto'" type="success" size="small" effect="plain">自动</el-tag>
            <el-tag v-else type="warning" size="small" effect="plain">手动</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deliveryStatus" label="发货状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.deliveryStatus === 0" type="info" size="small">待发货</el-tag>
            <el-tag v-else-if="row.deliveryStatus === 1" type="warning" size="small">部分发货</el-tag>
            <el-tag v-else-if="row.deliveryStatus === 2" type="success" size="small">已发货</el-tag>
            <el-tag v-else-if="row.deliveryStatus === 3" type="danger" size="small">发货失败</el-tag>
            <el-tag v-else type="info" size="small">未知</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewOrderDetail(row)">详情</el-button>
            <!-- 代充订单显示查看回执单按钮 -->
            <el-button v-if="row.isProxyRecharge || row.deliveryRequiresReceipt" type="warning" size="small" @click="viewOrderReceipts(row)">
              回执单
            </el-button>
            <!-- 代充订单和手动发货订单都使用同一个发货按钮 -->
            <el-button v-if="row.paymentStatus === 1 && row.deliveryStatus === 0 && (row.isProxyRecharge || row.deliveryRequiresReceipt || row.deliveryMode !== 'auto')" type="warning" size="small" @click="deliverOrder(row)">发货</el-button>
            <!-- 自动发货失败的订单显示重试按钮 -->
            <el-button v-if="row.paymentStatus === 1 && row.deliveryStatus === 0 && row.deliveryMode === 'auto' && !row.isProxyRecharge && !row.deliveryRequiresReceipt" type="success" size="small" @click="retryAutoDeliver(row)">重试发货</el-button>
            <el-button v-if="row.paymentStatus === 0" type="danger" size="small" @click="cancelOrder(row)">取消</el-button>
            <el-button type="danger" size="small" @click="deleteOrder(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px"
      />
    </el-card>

    <!-- 订单详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="订单详情" width="900px">
      <div v-if="selectedOrder" class="order-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ selectedOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ selectedOrder.userId }}</el-descriptions-item>
          <el-descriptions-item label="商品名称">{{ selectedOrder.productName }}</el-descriptions-item>
          <el-descriptions-item label="商品ID">{{ selectedOrder.productId }}</el-descriptions-item>
          <el-descriptions-item label="购买数量">{{ selectedOrder.quantity }}</el-descriptions-item>
          <el-descriptions-item label="单价">￥{{ selectedOrder.unitPrice }}</el-descriptions-item>
          <el-descriptions-item label="总金额">
            <span class="text-danger">￥{{ selectedOrder.totalAmount }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="支付方式">
            {{ getPaymentMethodText(selectedOrder.paymentMethod) }}
          </el-descriptions-item>
          <el-descriptions-item label="支付状态">
            {{ getPaymentStatusText(selectedOrder.paymentStatus) }}
          </el-descriptions-item>
          <el-descriptions-item label="发货状态">
            {{ getDeliveryStatusText(selectedOrder.deliveryStatus) }}
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            {{ getOrderStatusText(selectedOrder.orderStatus) }}
          </el-descriptions-item>
          <el-descriptions-item label="发货方式">
            {{ selectedOrder.deliveryMode === 'auto' ? '自动发货' : '手动发货' }}
            <el-tag v-if="selectedOrder.isProxyRecharge" type="warning" size="small" style="margin-left: 10px;">代充</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="用户邮箱">{{ selectedOrder.userEmail || '-' }}</el-descriptions-item>
          <el-descriptions-item label="支付时间">
            {{ selectedOrder.paidAt ? formatDate(selectedOrder.paidAt) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="发货时间">
            {{ selectedOrder.deliveredAt ? formatDate(selectedOrder.deliveredAt) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(selectedOrder.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatDate(selectedOrder.updatedAt) }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">
            {{ selectedOrder.remark || '-' }}
          </el-descriptions-item>
        </el-descriptions>
        
        <!-- 回执单信息（代充订单） -->
        <div v-if="orderReceipts && orderReceipts.length > 0" class="receipt-section">
          <el-divider content-position="left">回执单信息</el-divider>
          <el-table :data="orderReceipts" border style="width: 100%">
            <el-table-column type="index" label="#" width="50" />
            <el-table-column prop="cdkCode" label="CDK码" width="150" />
            <el-table-column label="回执字段" min-width="200">
              <template #default="{ row }">
                <div v-if="row.receiptFields && row.receiptFields.length > 0">
                  <el-tag v-for="field in row.receiptFields" :key="field.name" size="small" style="margin-right: 5px;">
                    {{ field.label }}
                  </el-tag>
                </div>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="回执数据" min-width="300">
              <template #default="{ row }">
                <div v-if="row.receiptData && Object.keys(row.receiptData).length > 0">
                  <div v-for="(value, key) in row.receiptData" :key="key" style="margin-bottom: 5px;">
                    <span style="font-weight: bold;">{{ formatReceiptFieldLabel(key) }}:</span> {{ value }}
                  </div>
                  <!-- 显示修改申请信息 -->
                  <div v-if="row.notes && parseNotes(row.notes).modificationRequest" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee;">
                    <el-tag type="warning" size="small">有修改申请</el-tag>
                    <div style="margin-top: 5px;">
                      <el-text type="warning" size="small">
                        原因：{{ parseNotes(row.notes).modificationRequest.reason }}
                      </el-text>
                      <el-popover
                        placement="top"
                        width="300"
                        trigger="hover"
                        v-if="parseNotes(row.notes).modificationRequest.newData"
                      >
                        <template #reference>
                          <el-button type="text" size="small">查看新数据</el-button>
                        </template>
                        <div v-for="(value, key) in parseNotes(row.notes).modificationRequest.newData" :key="key">
                          {{ formatReceiptFieldLabel(key) }}: {{ value }}
                        </div>
                      </el-popover>
                    </div>
                  </div>
                </div>
                <span v-else style="color: #909399;">用户未填写</span>
              </template>
            </el-table-column>
            <el-table-column prop="deliveryStatus" label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.deliveryStatus === 0" type="warning" size="small">待发货</el-tag>
                <el-tag v-else-if="row.deliveryStatus === 1" type="success" size="small">已发货</el-tag>
                <el-tag v-else type="danger" size="small">发货失败</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="240" fixed="right">
              <template #default="{ row }">
                <!-- 如果有待审核的修改申请，显示审核按钮 -->
                <template v-if="row.notes && parseNotes(row.notes).modificationRequest && parseNotes(row.notes).modificationRequest.status === 'pending'">
                  <el-button type="success" size="small" @click="approveModification(row)">
                    通过
                  </el-button>
                  <el-button type="danger" size="small" @click="rejectModification(row)">
                    拒绝
                  </el-button>
                </template>
                <!-- 否则显示查看和编辑按钮 -->
                <template v-else>
                  <el-button type="info" size="small" @click="viewReceipt(row)">
                    查看
                  </el-button>
                  <el-button type="primary" size="small" @click="editReceipt(row)">
                    编辑
                  </el-button>
                </template>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 发货对话框 -->
    <el-dialog v-model="deliveryDialogVisible" title="订单发货" width="600px">
      <el-form :model="deliveryForm" label-width="100px">
        <el-form-item label="订单号">
          <el-input v-model="deliveryForm.orderNo" disabled />
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input v-model="deliveryForm.productName" disabled />
        </el-form-item>
        <el-form-item label="购买数量">
          <el-input v-model="deliveryForm.quantity" disabled />
        </el-form-item>
        
        <el-form-item label="CDK码" required>
          <div>
            <el-input 
              v-model="deliveryForm.cdkCode" 
              type="textarea" 
              :rows="5" 
              placeholder="请点击下方按钮选择CDK" 
              readonly
              style="width: 100%;"
            />
            <el-button type="primary" @click="selectCDKFromList" style="margin-top: 10px;">
              从CDK库选择代充CDK
            </el-button>
          </div>
          <div style="color: #909399; font-size: 12px; margin-top: 5px;">
            需要选择 {{ deliveryForm.quantity }} 个代充CDK（可无限使用）
          </div>
        </el-form-item>
        
        <el-form-item label="附加信息">
          <el-input 
            v-model="deliveryForm.additionalInfo" 
            type="textarea" 
            :rows="3" 
            placeholder="可选：如账号密码、使用说明等附加信息" 
          />
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input v-model="deliveryForm.remark" type="textarea" :rows="2" placeholder="选填：内部备注，用户不可见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="deliveryDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="confirmDelivery"
          :loading="deliveryLoading"
        >
          确认发货
        </el-button>
      </template>
    </el-dialog>
    
    <!-- CDK选择对话框 -->
    <el-dialog
      v-model="cdkSelectDialogVisible"
      title="选择代充CDK（可无限使用）"
      width="900px"
    >
      <el-alert
        title="只显示代充类型(manual_recharge)的CDK，这类CDK可以无限重复使用"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 10px;"
      />
      <el-table 
        :data="availableCDKList" 
        v-loading="cdkLoading"
        @selection-change="handleCDKSelectionChange"
        border
        stripe
        max-height="400"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="cdkCode" label="CDK码" width="250" />
        <el-table-column prop="productName" label="所属商品" width="150" />
        <el-table-column prop="cdkCategory" label="CDK类型" width="120">
          <template #default="{ row }">
            <el-tag type="warning" size="small">
              代充CDK
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="使用状态" width="120">
          <template #default="{ row }">
            <el-tag type="success" size="small">
              可无限使用
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" />
      </el-table>
      <template #footer>
        <el-button @click="cdkSelectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCDKSelection" :disabled="selectedCDKs.length !== deliveryForm.quantity">
          确认选择 ({{ selectedCDKs.length }}/{{ deliveryForm.quantity }})
        </el-button>
      </template>
    </el-dialog>
    
    <!-- 回执单填写对话框 -->
    <el-dialog
      v-model="receiptDialogVisible"
      title="填写回执单"
      width="600px"
    >
      <el-form :model="receiptForm" label-width="120px">
        <el-form-item label="订单号">
          <el-input v-model="receiptForm.orderNo" disabled />
        </el-form-item>
        
        <el-form-item label="CDK码">
          <el-input v-model="receiptForm.cdkCode" disabled />
        </el-form-item>
        
        <!-- 动态显示回执字段 -->
        <template v-if="receiptForm.receiptFields && receiptForm.receiptFields.length > 0">
          <el-form-item 
            v-for="field in receiptForm.receiptFields" 
            :key="field.name"
            :label="field.label"
            :required="field.required"
          >
            <el-input 
              v-model="receiptForm.receiptData[field.name]" 
              :placeholder="`请输入${field.label}`"
              :type="field.type === 'textarea' ? 'textarea' : 'text'"
              :rows="field.type === 'textarea' ? 3 : undefined"
            />
          </el-form-item>
        </template>
        
        <el-form-item label="备注">
          <el-input 
            v-model="receiptForm.notes" 
            type="textarea" 
            :rows="2" 
            placeholder="选填：内部备注信息" 
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="receiptDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmReceipt" :loading="receiptLoading">
          确认发货
        </el-button>
      </template>
    </el-dialog>
    
    <!-- 回执单编辑对话框 -->
    <el-dialog
      v-model="receiptEditDialogVisible"
      title="编辑回执单"
      width="800px"
    >
      <el-tabs v-model="receiptEditTab">
        <el-tab-pane label="编辑回执单" name="edit">
          <el-form :model="receiptEditForm" label-width="120px">
            <el-form-item label="订单号">
              <el-input v-model="receiptEditForm.orderNo" disabled />
            </el-form-item>
            
            <!-- 动态显示回执字段 -->
            <template v-if="receiptEditForm.fields && receiptEditForm.fields.length > 0">
              <el-form-item 
                v-for="field in receiptEditForm.fields" 
                :key="field.key"
                :label="field.label"
                :required="field.required"
              >
                <el-input 
                  v-model="receiptEditForm.receiptData[field.key]" 
                  :placeholder="field.placeholder || `请输入${field.label}`"
                  :type="field.type === 'password' ? 'password' : (field.type === 'textarea' ? 'textarea' : 'text')"
                  :rows="field.type === 'textarea' ? 3 : undefined"
                />
              </el-form-item>
            </template>
            
            <!-- 如果没有配置字段，显示原始JSON编辑 -->
            <template v-else>
              <el-form-item label="回执数据">
                <el-input 
                  v-model="receiptEditForm.rawData" 
                  type="textarea" 
                  :rows="8"
                  placeholder="JSON格式的回执数据"
                />
              </el-form-item>
            </template>
            
            <el-form-item label="修改说明">
              <el-input 
                v-model="receiptEditForm.adminNote" 
                type="textarea" 
                :rows="2" 
                placeholder="请输入修改原因或说明" 
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="修改历史" name="history">
          <el-timeline v-if="receiptEditForm.history && receiptEditForm.history.length > 0">
            <el-timeline-item 
              v-for="(item, index) in receiptEditForm.history" 
              :key="index"
              :timestamp="formatDate(item.timestamp)"
              placement="top"
            >
              <el-card>
                <div>
                  <strong>修改人:</strong> {{ item.modifiedBy }}
                </div>
                <div v-if="item.note" style="margin-top: 5px;">
                  <strong>说明:</strong> {{ item.note }}
                </div>
                <div style="margin-top: 10px;">
                  <el-button size="small" @click="viewHistoryDiff(item)">查看变更</el-button>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无修改记录" />
        </el-tab-pane>
      </el-tabs>
      
      <template #footer>
        <el-button @click="receiptEditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveReceiptEdit" :loading="receiptEditLoading">
          保存修改
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { RefreshRight } from '@element-plus/icons-vue'
import axios from 'axios'

// 配置axios
axios.defaults.baseURL = 'http://localhost:3002'
axios.defaults.timeout = 5000

// 数据定义
const loading = ref(false)
const orderList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const statistics = ref(null)
const detailDialogVisible = ref(false)
const selectedOrder = ref(null)
const deliveryDialogVisible = ref(false)
const deliveryLoading = ref(false)
const globalPendingDeliveryCount = ref(0) // 全局待发货统计

// CDK选择相关
const cdkSelectDialogVisible = ref(false)
const cdkLoading = ref(false)
const availableCDKList = ref([])
const selectedCDKs = ref([])

// 回执单相关
const receiptDialogVisible = ref(false)
const receiptLoading = ref(false)
const orderReceipts = ref([])
const receiptForm = reactive({
  receiptId: null,
  orderNo: '',
  cdkCode: '',
  receiptFields: [],
  receiptData: {},
  notes: ''
})

// 回执单编辑相关
const receiptEditDialogVisible = ref(false)
const receiptEditLoading = ref(false)
const receiptEditTab = ref('edit')
const receiptEditForm = reactive({
  orderNo: '',
  fields: [],
  receiptData: {},
  rawData: '',
  adminNote: '',
  history: []
})

// 轮询相关
const pollingTimer = ref(null)
const isPolling = ref(true) // 是否启用轮询
const pollingInterval = ref(5000) // 轮询间隔，默认5秒

// 快速筛选
const quickFilter = ref('all')
const pendingDeliveryCount = ref(0) // 当前页待发货数量（不再显示）

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  userId: '',
  paymentStatus: '',
  orderStatus: '',
  dateRange: null,
  deliveryStatus: '' // 添加发货状态筛选
})

// 发货表单
const deliveryForm = reactive({
  orderNo: '',
  productName: '',
  quantity: 1,
  cdkCode: '',
  additionalInfo: '',
  remark: ''
})

// 处理支付成功的订单（直接使用前台传递的订单数据）
const handlePaymentSuccess = (orderNo, paymentData = {}) => {
  try {
    console.log(`✅ 订单 ${orderNo} 支付成功！`)
    
    // 更新列表中的订单状态
    const orderIndex = orderList.value.findIndex(o => o.orderNo === orderNo)
    if (orderIndex !== -1) {
      const order = orderList.value[orderIndex]
      
      // 更新订单状态
      orderList.value[orderIndex] = {
        ...order,
        paymentStatus: 1,
        paidAt: paymentData.success_time || new Date().toISOString(),
        ...paymentData  // 合并前台传来的其他支付数据
      }
      
      // 显示通知
      ElMessage.success({
        message: `订单 ${orderNo} 支付成功！`,
        duration: 5000,
        showClose: true
      })
      
      // 更新统计信息
      if (statistics.value) {
        statistics.value.pendingPayment = Math.max(0, statistics.value.pendingPayment - 1)
        statistics.value.paidOrders = (statistics.value.paidOrders || 0) + 1
        statistics.value.totalRevenue = (statistics.value.totalRevenue || 0) + (order.totalAmount || 0)
      }
      
      // 如果订单需要发货，更新全局待发货数量
      if (order.deliveryStatus === 0) {
        globalPendingDeliveryCount.value = (globalPendingDeliveryCount.value || 0) + 1
      }
    }
  } catch (error) {
    console.error('处理支付成功订单失败:', error)
  }
}

// 检查并更新待支付订单的状态（可选：仅在需要时查询后台）
const checkPendingPayments = async (forceCheck = false) => {
  try {
    // 获取当前页面显示的待支付订单
    const pendingOrders = orderList.value.filter(order => order.paymentStatus === 0)
    
    if (pendingOrders.length === 0) return
    
    // 如果不强制检查，且已经有前台数据，则跳过
    if (!forceCheck) {
      console.log(`📋 当前有 ${pendingOrders.length} 个待支付订单`)
      return
    }
    
    console.log(`🔄 检查 ${pendingOrders.length} 个待支付订单的状态...`)
    
    // 批量检查这些订单的支付状态（仅在必要时）
    for (const order of pendingOrders) {
      try {
        const response = await axios.get(`/api/wechat/pay/query/${order.orderNo}`)
        
        if (response.data.code === 0 && response.data.data) {
          const paymentData = response.data.data
          
          // 检查是否支付成功
          if (paymentData.data && paymentData.data.trade_state === 'SUCCESS') {
            handlePaymentSuccess(order.orderNo, paymentData.data)
          }
        }
      } catch (error) {
        // 单个订单查询失败不影响其他订单
        console.error(`查询订单 ${order.orderNo} 状态失败:`, error.message)
      }
    }
  } catch (error) {
    console.error('检查待支付订单状态失败:', error)
  }
}

// 开始轮询
const startPolling = () => {
  if (!isPolling.value) return
  
  // 清除之前的定时器
  stopPolling()
  
  console.log('🚀 开始轮询，间隔:', pollingInterval.value / 1000, '秒')
  
  // 设置定时器 - 默认不查询后台，除非有特殊需要
  pollingTimer.value = setInterval(() => {
    // 可以在这里添加其他需要定期执行的任务
    // 例如：刷新页面数据等
    console.log('⏰ 轮询心跳')
  }, pollingInterval.value)
}

// 停止轮询
const stopPolling = () => {
  if (pollingTimer.value) {
    clearInterval(pollingTimer.value)
    pollingTimer.value = null
    console.log('⏹ 停止轮询')
  }
}

// 处理轮询开关变化
const handlePollingChange = (value) => {
  if (value) {
    ElMessage.success('已开启自动刷新')
    startPolling()
  } else {
    ElMessage.info('已关闭自动刷新')
    stopPolling()
  }
}

// 获取订单列表
const fetchOrders = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    
    // 只添加非空的搜索参数
    if (searchForm.orderNo) params.orderNo = searchForm.orderNo
    if (searchForm.userId) params.userId = searchForm.userId
    if (searchForm.paymentStatus !== '') params.paymentStatus = searchForm.paymentStatus
    if (searchForm.orderStatus !== '') params.orderStatus = searchForm.orderStatus
    if (searchForm.deliveryStatus !== '') params.deliveryStatus = searchForm.deliveryStatus

    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
    }

    console.log('请求参数:', params)
    console.log('完整请求URL:', axios.defaults.baseURL + '/api/order/admin/list')
    const response = await axios.get('/api/order/admin/list', { params })
    console.log('订单列表API响应:', response.data)
    console.log('响应数据详情:', {
      code: response.data.code,
      dataExists: !!response.data.data,
      list: response.data.data?.list,
      total: response.data.data?.total
    })
    if (response.data.code === 200) {
      orderList.value = response.data.data.list || []
      total.value = response.data.data.total || 0
      console.log('设置后的订单列表:', orderList.value)
      console.log('设置后的总数:', total.value)
      
      // 统计当前页待发货订单数量（不再使用）
      pendingDeliveryCount.value = orderList.value.filter(order => 
        order.paymentStatus === 1 && order.deliveryStatus === 0
      ).length
      
      // 更新全局待发货数量
      await fetchGlobalPendingDeliveryCount()
      
      // 获取订单后，重新开始轮询
      startPolling()
    } else {
      console.error('API返回错误:', response.data)
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 获取统计信息
const fetchStatistics = async () => {
  try {
    const params = {}
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
    }

    const response = await axios.get('/api/order/admin/stats', { params })
    if (response.data.code === 0) {
      // 处理后端返回的统计数据格式
      const data = response.data.data
      statistics.value = {
        totalOrders: data.statusStats.reduce((sum, item) => sum + parseInt(item.count), 0),
        pendingPayment: parseInt(data.statusStats.find(s => s.status === 1)?.count || 0),
        paidOrders: parseInt(data.statusStats.find(s => s.status === 2)?.count || 0),
        completedOrders: parseInt(data.statusStats.find(s => s.status === 3)?.count || 0),
        cancelledOrders: parseInt(data.statusStats.find(s => s.status === 0)?.count || 0),
        totalRevenue: parseFloat(data.statusStats.find(s => s.status === 2)?.total_amount || 0),
        todayRevenue: parseFloat(data.today?.paid_amount || 0),
        todayOrders: parseInt(data.today?.order_count || 0),
        todayPaidOrders: parseInt(data.today?.paid_count || 0)
      }
      ElMessage.success('统计数据已更新')
    }
    
    // 同时获取全局待发货统计
    await fetchGlobalPendingDeliveryCount()
  } catch (error) {
    console.error('获取统计信息失败:', error)
    ElMessage.error('获取统计信息失败')
  }
}

// 获取全局待发货数量
const fetchGlobalPendingDeliveryCount = async () => {
  try {
    // 专门查询待发货订单的总数
    const response = await axios.get('/api/order/admin/list', {
      params: {
        page: 1,
        pageSize: 1, // 只需要总数，不需要实际数据
        paymentStatus: 1, // 已支付
        deliveryStatus: 0 // 待发货
      }
    })
    
    if (response.data.code === 200) {
      globalPendingDeliveryCount.value = response.data.data.total || 0
      console.log('全局待发货数量:', globalPendingDeliveryCount.value)
    }
  } catch (error) {
    console.error('获取全局待发货数量失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchOrders()
}

// 重置搜索
const resetSearch = () => {
  searchForm.orderNo = ''
  searchForm.userId = ''
  searchForm.paymentStatus = ''
  searchForm.orderStatus = ''
  searchForm.deliveryStatus = ''
  searchForm.dateRange = null
  quickFilter.value = 'all'
  handleSearch()
}

// 快速筛选
const setQuickFilter = (filter) => {
  quickFilter.value = filter
  
  // 重置搜索条件
  searchForm.orderNo = ''
  searchForm.userId = ''
  searchForm.dateRange = null
  
  switch(filter) {
    case 'all':
      searchForm.paymentStatus = ''
      searchForm.orderStatus = ''
      searchForm.deliveryStatus = ''
      break
    case 'pending_delivery':
      searchForm.paymentStatus = 1 // 已支付
      searchForm.orderStatus = ''
      searchForm.deliveryStatus = 0 // 待发货
      break
    case 'pending_payment':
      searchForm.paymentStatus = 0 // 待支付
      searchForm.orderStatus = ''
      searchForm.deliveryStatus = ''
      break
    case 'completed':
      searchForm.paymentStatus = ''
      searchForm.orderStatus = 2 // 已完成
      searchForm.deliveryStatus = ''
      break
  }
  
  handleSearch()
}

// 选择CDK
const selectCDKFromList = async () => {
  cdkLoading.value = true
  try {
    // 获取当前订单的商品ID
    const order = orderList.value.find(o => o.orderNo === deliveryForm.orderNo)
    if (!order) {
      ElMessage.error('订单信息不存在')
      return
    }
    
    console.log('查询CDK，商品ID:', order.productId)
    
    // 获取该商品的所有CDK，然后在前端过滤
    const response = await axios.get('/api/cdk/list', {
      params: {
        productId: order.productId,
        page: 1,
        pageSize: 100  // 后端限制最大100
      }
    })
    
    console.log('CDK列表响应:', response.data)
    
    if (response.data.code === 0) {
      const allCDKs = response.data.data.list || []
      console.log('获取到的所有CDK数量:', allCDKs.length)
      
      // 过滤出代充类型的CDK（检查多个可能的字段名）
      // 代充CDK可以无限使用，不管状态如何
      availableCDKList.value = allCDKs.filter(cdk => {
        const isManualRecharge = cdk.cdkCategory === 'manual_recharge' || 
                                cdk.cdk_category === 'manual_recharge' ||
                                cdk.cdkType === 'manual_recharge' ||
                                cdk.cdk_type === 'manual_recharge'
        
        console.log('CDK:', cdk.cdkCode, 'Category:', cdk.cdkCategory || cdk.cdk_category, 'Status:', cdk.status, 'Is manual_recharge:', isManualRecharge)
        
        // 代充CDK不受状态限制，可以无限使用
        return isManualRecharge
      })
      
      console.log('过滤后的代充CDK数量:', availableCDKList.value.length)
      
      if (availableCDKList.value.length === 0) {
        // 如果没有代充CDK，尝试显示所有未使用的CDK供临时使用
        const unusedCDKs = allCDKs.filter(cdk => cdk.status === 0)
        if (unusedCDKs.length > 0) {
          ElMessage.warning(`没有找到代充类型的CDK，但有${unusedCDKs.length}个其他类型的未使用CDK。请在CDK管理中添加代充类型(manual_recharge)的CDK`)
          
          // 临时显示所有未使用的CDK
          availableCDKList.value = unusedCDKs
          cdkSelectDialogVisible.value = true
        } else {
          ElMessage.warning('该商品暂无可用CDK')
        }
        return
      }
      
      cdkSelectDialogVisible.value = true
    }
  } catch (error) {
    console.error('获取CDK列表失败:', error)
    ElMessage.error('获取CDK列表失败')
  } finally {
    cdkLoading.value = false
  }
}

// 处理CDK选择
const handleCDKSelectionChange = (selection) => {
  selectedCDKs.value = selection
}

// 确认CDK选择
const confirmCDKSelection = () => {
  if (selectedCDKs.value.length === 0) {
    ElMessage.warning('请选择CDK')
    return
  }
  
  if (selectedCDKs.value.length !== deliveryForm.quantity) {
    ElMessage.warning(`需要选择 ${deliveryForm.quantity} 个CDK，当前选择了 ${selectedCDKs.value.length} 个`)
    return
  }
  
  // 将选中的CDK码填入发货表单
  const cdkCodes = selectedCDKs.value.map(cdk => cdk.cdkCode).join('\n')
  deliveryForm.cdkCode = cdkCodes
  
  cdkSelectDialogVisible.value = false
  ElMessage.success('CDK选择成功')
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

// 查看订单详情
const viewOrderDetail = async (row) => {
  selectedOrder.value = row
  detailDialogVisible.value = true
  
  // 如果是代充订单，获取回执单信息
  if (row.isProxyRecharge || row.deliveryMode === 'manual') {
    await fetchOrderReceipts(row.orderNo)
  }
}

// 获取订单回执单信息
const fetchOrderReceipts = async (orderNo) => {
  try {
    const response = await axios.get(`/api/order/admin/receipts/${orderNo}`)
    if (response.data.code === 200 || response.data.code === 0) {
      orderReceipts.value = response.data.data.receipts || []
    }
  } catch (error) {
    console.error('获取回执单信息失败:', error)
    orderReceipts.value = []
  }
}

// 查看订单回执单（快捷入口）
const viewOrderReceipts = async (row) => {
  selectedOrder.value = row
  await fetchOrderReceipts(row.orderNo)
  
  // 如果有回执单，直接显示详情对话框
  if (orderReceipts.value && orderReceipts.value.length > 0) {
    detailDialogVisible.value = true
    
    // 如果有待填写的回执单，提示管理员
    const pendingReceipts = orderReceipts.value.filter(r => r.deliveryStatus === 0)
    if (pendingReceipts.length > 0) {
      ElMessage.info(`该订单有 ${pendingReceipts.length} 个待填写的回执单`)
    }
  } else {
    ElMessage.warning('该订单暂无回执单信息')
  }
}

// 填写回执单
const fillReceipt = (receipt) => {
  receiptForm.receiptId = receipt.id
  receiptForm.orderNo = selectedOrder.value.orderNo
  receiptForm.cdkCode = receipt.cdkCode
  receiptForm.receiptFields = receipt.receiptFields || []
  receiptForm.receiptData = {}
  receiptForm.notes = ''
  
  // 初始化回执数据字段
  if (receiptForm.receiptFields && receiptForm.receiptFields.length > 0) {
    receiptForm.receiptFields.forEach(field => {
      receiptForm.receiptData[field.name] = ''
    })
  }
  
  receiptDialogVisible.value = true
}

// 查看回执单
const viewReceipt = (receipt) => {
  ElMessageBox.alert(
    `<div style="padding: 10px;">
      <p><strong>CDK码:</strong> ${receipt.cdkCode}</p>
      <p><strong>发货时间:</strong> ${formatDate(receipt.deliveredAt)}</p>
      <div style="margin-top: 10px;">
        <strong>回执数据:</strong>
        ${Object.entries(receipt.receiptData || {}).map(([key, value]) => 
          `<p style="margin-left: 20px;">${key}: ${value}</p>`
        ).join('')}
      </div>
    </div>`,
    '回执单详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭'
    }
  )
}

// 通过修改申请
const approveModification = async (receipt) => {
  try {
    await ElMessageBox.confirm(
      '确定要通过这个修改申请吗？回执单数据将被更新为用户提交的新数据。',
      '确认通过',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const notes = parseNotes(receipt.notes)
    if (!notes.modificationRequest) {
      ElMessage.error('未找到修改申请信息')
      return
    }
    
    // 调用API通过修改申请
    const response = await axios.post(`/api/order/admin/receipts/${receipt.id}/approve`, {
      newData: notes.modificationRequest.newData
    })
    
    if (response.data.code === 200 || response.data.code === 0) {
      ElMessage.success('修改申请已通过')
      // 刷新回执单列表
      await fetchOrderReceipts(selectedOrder.value.orderNo)
    } else {
      throw new Error(response.data.message || '操作失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('通过修改申请失败:', error)
      ElMessage.error(error.message || '通过修改申请失败')
    }
  }
}

// 拒绝修改申请
const rejectModification = async (receipt) => {
  try {
    const { value: reason } = await ElMessageBox.prompt(
      '请输入拒绝原因',
      '拒绝修改申请',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /.+/,
        inputErrorMessage: '请输入拒绝原因'
      }
    )
    
    const notes = parseNotes(receipt.notes)
    if (!notes.modificationRequest) {
      ElMessage.error('未找到修改申请信息')
      return
    }
    
    // 调用API拒绝修改申请
    const response = await axios.post(`/api/order/admin/receipts/${receipt.id}/reject`, {
      reason: reason
    })
    
    if (response.data.code === 200 || response.data.code === 0) {
      ElMessage.success('修改申请已拒绝')
      // 刷新回执单列表
      await fetchOrderReceipts(selectedOrder.value.orderNo)
    } else {
      throw new Error(response.data.message || '操作失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('拒绝修改申请失败:', error)
      ElMessage.error(error.message || '拒绝修改申请失败')
    }
  }
}

// 确认回执单
const confirmReceipt = async () => {
  try {
    // 验证必填字段
    for (const field of receiptForm.receiptFields) {
      if (field.required && !receiptForm.receiptData[field.name]) {
        ElMessage.warning(`请填写${field.label}`)
        return
      }
    }
    
    receiptLoading.value = true
    
    const response = await axios.post(`/api/cdk/receipt/${receiptForm.receiptId}/complete`, {
      receiptData: receiptForm.receiptData,
      notes: receiptForm.notes
    })
    
    if (response.data.code === 200 || response.data.code === 0) {
      ElMessage.success('回执单填写成功，订单已发货')
      receiptDialogVisible.value = false
      
      // 刷新回执单列表
      await fetchOrderReceipts(selectedOrder.value.orderNo)
      
      // 刷新订单列表
      fetchOrders()
      
      // 更新全局待发货数量（发货后减少）
      globalPendingDeliveryCount.value = Math.max(0, (globalPendingDeliveryCount.value || 1) - 1)
    } else {
      throw new Error(response.data.message || '回执单填写失败')
    }
  } catch (error) {
    console.error('填写回执单失败:', error)
    ElMessage.error(error.message || '填写回执单失败')
  } finally {
    receiptLoading.value = false
  }
}

// 确认支付
const confirmPayment = async (row) => {
  try {
    await ElMessageBox.confirm('确定要手动确认该订单已支付吗？', '确认支付', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await axios.put(`/api/order/payment-status/${row.orderNo}`, {
      paymentStatus: 1,
      paymentMethod: row.paymentMethod || 'manual'
    })

    if (response.data.code === 200) {
      ElMessage.success('支付状态已更新')
      fetchOrders()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认支付失败:', error)
      ElMessage.error('确认支付失败')
    }
  }
}

// 发货
const deliverOrder = (row) => {
  deliveryForm.orderNo = row.orderNo
  deliveryForm.productName = row.productName
  deliveryForm.quantity = row.quantity || 1
  deliveryForm.cdkCode = ''
  deliveryForm.additionalInfo = ''
  deliveryForm.remark = ''
  deliveryDialogVisible.value = true
}

// 确认发货
const confirmDelivery = async () => {
  try {
    // 验证必须选择CDK
    if (!deliveryForm.cdkCode || !deliveryForm.cdkCode.trim()) {
      ElMessage.warning('请先选择代充CDK')
      return
    }
    
    // 解析CDK码（按换行分隔）
    const cdkCodes = deliveryForm.cdkCode
      .split('\n')
      .map(code => code.trim())
      .filter(code => code.length > 0)
    
    if (cdkCodes.length !== deliveryForm.quantity) {
      ElMessage.warning(`需要输入 ${deliveryForm.quantity} 个CDK码，当前输入了 ${cdkCodes.length} 个`)
      return
    }
    
    deliveryLoading.value = true
    
    // 准备发货数据
    const deliveryData = {
      cdkCodes: cdkCodes,
      additionalInfo: deliveryForm.additionalInfo,
      remark: deliveryForm.remark,
      deliveryContent: cdkCodes.join('\n') + (deliveryForm.additionalInfo ? '\n\n' + deliveryForm.additionalInfo : '')
    }
    
    const response = await axios.put(`/api/order/deliver/${deliveryForm.orderNo}`, deliveryData)
    
    if (response.data.code === 200) {
      ElMessage.success('发货成功')
      deliveryDialogVisible.value = false
      fetchOrders()
      
      // 更新全局待发货数量（发货后减少）
      globalPendingDeliveryCount.value = Math.max(0, (globalPendingDeliveryCount.value || 1) - 1)
    } else {
      throw new Error(response.data.message || '发货失败')
    }
  } catch (error) {
    console.error('发货失败:', error)
    ElMessage.error(error.message || '发货失败')
  } finally {
    deliveryLoading.value = false
  }
}

// 重试自动发货
const retryAutoDeliver = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要重试自动发货吗？系统将尝试重新分配CDK并发送邮件。',
      '重试自动发货',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await axios.post(`/api/order/retry-auto-deliver/${row.orderNo}`)
    
    if (response.data.code === 200 || response.data.code === 0) {
      ElMessage.success('自动发货成功')
      fetchOrders()
      
      // 更新全局待发货数量（发货后减少）
      globalPendingDeliveryCount.value = Math.max(0, (globalPendingDeliveryCount.value || 1) - 1)
    } else {
      throw new Error(response.data.message || '自动发货失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重试自动发货失败:', error)
      ElMessage.error(error.message || '重试自动发货失败')
    }
  }
}

// 代充订单发货
const retryProxyDeliver = async (row) => {
  try {
    // 先获取回执单信息
    await fetchOrderReceipts(row.orderNo)
    
    // 如果有未填写的回执单，直接打开详情对话框
    const pendingReceipts = orderReceipts.value.filter(r => r.deliveryStatus === 0)
    if (pendingReceipts.length > 0) {
      selectedOrder.value = row
      detailDialogVisible.value = true
      ElMessage.info(`该订单有 ${pendingReceipts.length} 个待填写的回执单，请在详情中填写`)
    } else {
      // 如果没有待填写的回执单，尝试重新生成
      await ElMessageBox.confirm(
        '确定要发货吗？系统将生成代充回执单。',
        '代充发货',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      
      const response = await axios.post(`/api/order/retry-proxy-deliver/${row.orderNo}`)
      
      if (response.data.code === 200 || response.data.code === 0) {
        ElMessage.success('重新生成回执单成功，请填写回执信息')
        // 打开详情对话框
        selectedOrder.value = row
        detailDialogVisible.value = true
        await fetchOrderReceipts(row.orderNo)
      } else {
        throw new Error(response.data.message || '重试发货失败')
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('代充发货失败:', error)
      ElMessage.error(error.message || '代充发货失败')
    }
  }
}

// 取消订单
const cancelOrder = async (row) => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '取消订单', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await axios.put(`/api/order/cancel/${row.orderNo}`, {
      reason: '管理员取消'
    })

    if (response.data.code === 200) {
      ElMessage.success('订单已取消')
      fetchOrders()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error)
      ElMessage.error('取消订单失败')
    }
  }
}

// 删除订单
const deleteOrder = async (row) => {
  try {
    // 检查订单状态
    if (row.paymentStatus === 1 && row.deliveryStatus === 2) {
      ElMessage.warning('已支付且已发货的订单不允许删除')
      return
    }

    await ElMessageBox.confirm(
      `确定要删除订单 ${row.orderNo} 吗？此操作不可恢复。`,
      '删除订单',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await axios.delete(`/api/order/admin/delete/${row.id}`)

    if (response.data.code === 0 || response.data.code === 200) {
      ElMessage.success('订单已删除')
      fetchOrders()
    } else {
      throw new Error(response.data.message || '删除订单失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除订单失败:', error)
      ElMessage.error(error.message || '删除订单失败')
    }
  }
}

// 导出订单
const exportOrders = () => {
  ElMessage.info('导出功能开发中...')
}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchOrders()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchOrders()
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 获取支付方式文本
const getPaymentMethodText = (method) => {
  const map = {
    'wechat': '微信支付',
    'alipay': '支付宝',
    'binance': '币安支付',
    'card': '银行卡',
    'manual': '手动确认'
  }
  return map[method] || method || '未设置'
}

// 获取支付状态文本
const getPaymentStatusText = (status) => {
  const map = {
    0: '待支付',
    1: '已支付',
    2: '支付失败'
  }
  return map[status] || '未知'
}

// 获取发货状态文本
const getDeliveryStatusText = (status) => {
  const map = {
    0: '待发货',
    1: '部分发货',
    2: '已发货',
    3: '发货失败'
  }
  return map[status] || '未知'
}

// 获取订单状态文本
const getOrderStatusText = (status) => {
  const map = {
    0: '待处理',
    1: '处理中',
    2: '已完成',
    3: '已取消',
    4: '已退款'
  }
  return map[status] || '未知'
}

// 格式化回执字段标签
const formatReceiptFieldLabel = (key) => {
  const fieldLabelMap = {
    'gameAccount': '游戏账号',
    'gamePassword': '游戏密码',
    'contact': '联系方式',
    'remark': '备注信息',
    'server': '服务器',
    'characterName': '角色名',
    'level': '等级',
    'email': '邮箱',
    'phone': '手机号'
  }
  return fieldLabelMap[key] || key
}

// 解析notes字段中的JSON数据
const parseNotes = (notes) => {
  if (!notes) return {}
  try {
    // 如果notes是字符串，尝试解析为JSON
    if (typeof notes === 'string') {
      return JSON.parse(notes)
    }
    return notes
  } catch (error) {
    // 如果解析失败，返回空对象
    return {}
  }
}

// 监听全局支付成功事件
const handleGlobalPaymentSuccess = (event) => {
  const { orderNo, paymentData } = event.detail || {}
  if (orderNo) {
    console.log('📨 收到支付成功通知:', orderNo)
    handlePaymentSuccess(orderNo, paymentData)
  }
}

// 编辑回执单
const editReceipt = async (receipt) => {
  try {
    receiptEditForm.orderNo = receipt.order_no
    receiptEditForm.receiptData = typeof receipt.receipt_data === 'string' ? 
      JSON.parse(receipt.receipt_data) : receipt.receipt_data
    receiptEditForm.rawData = JSON.stringify(receiptEditForm.receiptData, null, 2)
    receiptEditForm.adminNote = ''
    
    // 获取商品的字段配置
    const response = await axios.get(`/api/admin/receipt/${receipt.order_no}`)
    if (response.data.code === 0) {
      const data = response.data.data
      receiptEditForm.fields = data.fields ? JSON.parse(data.fields) : []
      
      // 获取修改历史
      const historyResponse = await axios.get(`/api/admin/receipt/${receipt.order_no}/history`)
      if (historyResponse.data.code === 0) {
        receiptEditForm.history = historyResponse.data.data
      }
    }
    
    receiptEditTab.value = 'edit'
    receiptEditDialogVisible.value = true
  } catch (error) {
    console.error('打开编辑对话框失败:', error)
    ElMessage.error('获取回执单信息失败')
  }
}

// 保存回执单编辑
const saveReceiptEdit = async () => {
  try {
    receiptEditLoading.value = true
    
    let receiptData = receiptEditForm.receiptData
    
    // 如果没有字段配置，使用原始JSON数据
    if (!receiptEditForm.fields || receiptEditForm.fields.length === 0) {
      try {
        receiptData = JSON.parse(receiptEditForm.rawData)
      } catch (e) {
        ElMessage.error('JSON格式错误')
        return
      }
    }
    
    const response = await axios.put(`/api/admin/receipt/${receiptEditForm.orderNo}`, {
      receiptData: receiptData,
      adminNote: receiptEditForm.adminNote,
      modifiedBy: 'admin' // 实际项目中应该使用当前登录的管理员信息
    })
    
    if (response.data.code === 0) {
      ElMessage.success('回执单修改成功')
      receiptEditDialogVisible.value = false
      
      // 刷新回执单列表
      if (selectedOrder.value) {
        await fetchOrderReceipts(selectedOrder.value.orderNo)
      }
    } else {
      throw new Error(response.data.msg || '修改失败')
    }
  } catch (error) {
    console.error('保存回执单编辑失败:', error)
    ElMessage.error(error.message || '保存失败')
  } finally {
    receiptEditLoading.value = false
  }
}

// 查看历史变更
const viewHistoryDiff = (historyItem) => {
  const previousData = typeof historyItem.previousData === 'string' ? 
    JSON.parse(historyItem.previousData) : historyItem.previousData
  const newData = typeof historyItem.newData === 'string' ? 
    JSON.parse(historyItem.newData) : historyItem.newData
  
  let diffHtml = '<div style="padding: 10px;">'
  diffHtml += '<h4>修改前:</h4>'
  diffHtml += '<pre style="background: #ffe6e6; padding: 10px; border-radius: 4px;">'
  diffHtml += JSON.stringify(previousData, null, 2)
  diffHtml += '</pre>'
  diffHtml += '<h4 style="margin-top: 15px;">修改后:</h4>'
  diffHtml += '<pre style="background: #e6ffe6; padding: 10px; border-radius: 4px;">'
  diffHtml += JSON.stringify(newData, null, 2)
  diffHtml += '</pre>'
  diffHtml += '</div>'
  
  ElMessageBox.alert(diffHtml, '变更详情', {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '关闭',
    customClass: 'history-diff-dialog'
  })
}

// 初始化
onMounted(() => {
  fetchOrders()
  fetchStatistics()
  
  // 开始轮询（fetchOrders成功后会自动开始）
  console.log('💡 订单管理页面已加载')
  
  // 监听全局支付成功事件
  window.addEventListener('payment-success', handleGlobalPaymentSuccess)
  
  // 将处理函数暴露到全局，供其他页面调用
  window.notifyPaymentSuccess = handlePaymentSuccess
})

// 清理
onUnmounted(() => {
  stopPolling()
  console.log('🛑 订单管理页面已卸载，停止轮询')
  
  // 移除事件监听
  window.removeEventListener('payment-success', handleGlobalPaymentSuccess)
  
  // 清理全局函数
  delete window.notifyPaymentSuccess
})
</script>

<style scoped>
.order-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-area {
  margin-bottom: 20px;
}

.quick-filter-buttons {
  display: flex;
  align-items: center;
}

.filter-badge {
  margin-left: 5px;
}

.filter-badge :deep(.el-badge__content) {
  top: -2px;
  right: -12px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.statistics-panel {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 10px;
  background: white;
  border-radius: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.text-primary {
  color: #409EFF;
}

.text-danger {
  color: #F56C6C;
}

.text-success {
  color: #67C23A;
}

.today-stat {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.today-stat .stat-value {
  color: white;
}

.today-stat .stat-label {
  color: rgba(255, 255, 255, 0.9);
}

.order-detail {
  padding: 10px;
}

.receipt-section {
  margin-top: 20px;
}
</style>
