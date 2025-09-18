<template>
  <div class="tickets-section">
    <div class="section-header">
      <h2 class="section-title">我的工单</h2>
      <button class="apply-btn" @click="showTicketApplyModal = true">+ 申请工单</button>
    </div>
    <div class="tickets-tabs">
      <div 
        v-for="tab in tabs" 
        :key="tab.key"
        :class="['tab-item', { active: activeTab === tab.key }]"
        @click="selectTab(tab.key)"
      >
        {{ tab.label }}
      </div>
    </div>
    <div class="tickets-list">
      <div class="ticket-card" v-for="ticket in filteredTickets" :key="ticket.id" :class="ticket.statusClass">
        <!-- 标题区域 -->
        <div class="ticket-header-section">
          <span class="ticket-id">工单 #{{ ticket.id }}</span>
          <div class="ticket-status-circle" :class="ticket.statusClass">{{ ticket.statusText }}</div>
        </div>
        
        <!-- 内容区域 -->
        <div class="ticket-content-section">
          <div class="ticket-main-content">
            <div class="ticket-content">{{ ticket.content }}</div>
            <div class="ticket-meta">
              <div class="meta-item">提交时间：{{ ticket.time }}</div>
              <div class="meta-item">关联订单：<span class="order-link">#{{ ticket.orderId }}</span></div>
            </div>
          </div>
          
          <!-- 操作按钮区域 -->
          <div class="ticket-actions-right">
            <button class="action-btn-small view-detail">
              <i class="icon-view"></i>
              查看详情
            </button>
            <button v-if="ticket.status === 'processing'" class="action-btn-small add-reply">
              <i class="icon-reply"></i>
              添加回复
            </button>
            <button v-if="ticket.status === 'resolved'" class="action-btn-small add-reply">
              <i class="icon-reply"></i>
              添加回复
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <TicketApplyModal v-if="showTicketApplyModal" @close="showTicketApplyModal = false" />
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TicketApplyModal from '@/components/TicketApplyModal.vue'
import { http } from '@/utils/request'

// 标签页数据
const tabs = [
  { key: 'all', label: '全部工单' },
  { key: 'processing', label: '进行中' },
  { key: 'resolved', label: '已解决' }
]

const activeTab = ref('all')
const selectTab = (key: string) => { activeTab.value = key }

const tickets = ref<any[]>([])
const fetchTickets = async () => {
  const res = await http.get('/work/list')
  if (res && res.data) tickets.value = res.data
}
onMounted(fetchTickets)

const filteredTickets = computed(() => {
  if (activeTab.value === 'all') return tickets.value
  return tickets.value.filter(ticket => ticket.status === activeTab.value)
})

const showTicketApplyModal = ref(false)
</script>

<style scoped>
.tickets-section {
  padding: 0;
  height: 100%;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}
.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}
.apply-btn {
  background: #1890FF;
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 8px 22px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.apply-btn:hover {
  background: #1765ad;
}
.tickets-tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}
.tab-item {
  padding: 10px 16px;
  color: #666;
  cursor: pointer;
  font-size: 16px;
  background: #F8F8F8;
  border-radius: 20px;
  transition: all 0.3s;
  border: 1px solid transparent;
  font-weight: 500;
}
.tab-item:hover {
  background: #e8e8e8;
}
.tab-item.active {
  color: #1890FF;
  background: #E6F7FF;
  border-color: #1890FF;
}
.tickets-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.ticket-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border-left: 4px solid;
}
.ticket-card.processing {
  border-left-color: #1890FF;
}
.ticket-card.resolved {
  border-left-color: #52c41a;
}

/* 标题区域 */
.ticket-header-section {
  background: #E6F7FF;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ticket-id {
  font-weight: 600;
  font-size: 16px;
  color: #333;
}
.ticket-status-circle {
  width: 60px;
  height: 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
}
.ticket-status-circle.processing {
  background: #1890FF;
}
.ticket-status-circle.resolved {
  background: #52c41a;
}

/* 内容区域 */
.ticket-content-section {
  background: #fff;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}
.ticket-main-content {
  flex: 1;
}
.ticket-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 8px;
}
.ticket-content:last-of-type {
  margin-bottom: 16px;
}
.ticket-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.meta-item {
  font-size: 13px;
  color: #999;
}
.order-link {
  color: #1890FF;
  cursor: pointer;
}
.order-link:hover {
  text-decoration: underline;
}

/* 右侧操作按钮区域 */
.ticket-actions-right {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
  background: #fff;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}
.action-btn-small {
  display: flex;
  align-items: center;
  gap: 4px;
  border: none;
  font-size: 12px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s;
  white-space: nowrap;
  min-width: 80px;
  justify-content: center;
  font-weight: 500;
}
.action-btn-small.view-detail {
  background: #E6F7FF;
  color: #1890FF;
}
.action-btn-small.view-detail:hover {
  background: #d1f0ff;
}
.action-btn-small.add-reply {
  background: #F5F7FA;
  color: #666;
}
.action-btn-small.add-reply:hover {
  background: #e8ecf0;
}
.icon-view::before {
  content: "";
  background-image: url('/images/gongdan2.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  width: 16px;
  height: 16px;
  display: inline-block;
  margin-right: 4px;
}
.icon-reply::before {
  content: "";
  background-image: url('/images/gongdan4.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  width: 16px;
  height: 16px;
  display: inline-block;
  margin-right: 4px;
}
</style> 