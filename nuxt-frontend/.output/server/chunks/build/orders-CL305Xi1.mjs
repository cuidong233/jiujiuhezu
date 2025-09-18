import { defineComponent, ref, computed, watch, resolveComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderAttr } from 'vue/server-renderer';
import { useRouter } from 'vue-router';
import { _ as _export_sfc, d as useUserStore, l as http } from './server.mjs';
import { R as ReceiptModal } from './ReceiptModal-ppj2k2En.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'ipx';
import 'form-data';
import 'crypto';
import 'url';
import 'proxy-from-env';
import 'http';
import 'https';
import 'util';
import 'follow-redirects';
import 'zlib';
import 'stream';
import 'events';

const orderApi = {
  /**
   * 创建订单
   * @param params 订单参数
   */
  createOrder(params) {
    return http.post("/product/order/createOrder", params);
  },
  /**
   * 创建续费订单
   * @param params 续费参数
   */
  createRenewOrder(params) {
    return http.post("/product/order/createRenewOrder", params);
  },
  // ✅ 真实API调用（已启用）
  /**
   * 获取订单列表
   * @param params 查询参数
   */
  getOrderList(params) {
    const userStore = useUserStore();
    const user = userStore.user;
    if (user == null ? void 0 : user.id) {
      return http.get(`/order/user/${user.id}`, params);
    }
    if (params.userEmail) {
      return http.get("/order/admin/list", params);
    }
    return Promise.reject(new Error("\u7528\u6237\u672A\u767B\u5F55"));
  },
  /**
   * 获取订单详情
   * @param orderNo 订单号
   */
  getOrderDetail(orderNo) {
    return http.get(`/product/order/info/${orderNo}`);
  },
  /**
   * 取消订单
   * @param orderNo 订单号
   */
  cancelOrder(orderNo) {
    return http.post(`/product/order/closeOrder/${orderNo}`);
  },
  // 🎨 前端UI设计阶段 - 订单删除功能（已注释，用于检查页面功能）
  // /**
  //  * 删除订单
  //  * @param orderNo 订单号
  //  */
  // deleteOrder(orderNo: string): Promise<ApiResponse<null>> {
  //   return http.delete(`/product/order/deleteOrder/${orderNo}`)
  // },
  /**
   * 获取订单发货信息
   * @param orderNo 订单号
   */
  getDeliveryInfo(orderNo) {
    return http.get(`/order/delivery-info/${orderNo}`);
  },
  /**
   * 获取订单回执单信息
   * @param orderNo 订单号
   */
  getOrderReceipts(orderNo) {
    return http.get(`/order/receipts/${orderNo}`);
  },
  /**
   * 填写回执
   * @param orderNo 订单号
   * @param params 回执参数
   */
  submitReceipt(orderNo, params) {
    return http.post(`/order/receipts/${orderNo}/submit`, params);
  },
  /**
   * 申请修改回执单
   * @param orderNo 订单号
   * @param params 修改参数
   */
  modifyReceipt(orderNo, params) {
    return http.post(`/order/receipts/${orderNo}/modify`, params);
  },
  // TODO: 待后端实现退款申请功能
  // /**
  //  * 申请退款
  //  * @param orderId 订单ID
  //  * @param params 退款参数
  //  */
  // applyRefund(orderId: number, params: {
  //   reason: string
  //   amount: number
  //   description?: string
  // }): Promise<ApiResponse<null>> {
  //   return http.post(`/product/order/refund/${orderId}`, params)
  // },
  /**
   * 获取拼友列表
   * @param orderNo 订单号
   */
  getFriends(orderNo) {
    return http.get(`/product/order/friend/${orderNo}`);
  },
  /**
   * 获取订单支付信息
   * @param orderNo 订单号
   */
  getPaymentInfo(orderNo) {
    return http.get(`/product/order/payment/${orderNo}`);
  },
  /**
   * 获取订单状态
   * @param orderNo 订单号
   */
  getOrderStatus(orderNo) {
    return http.get(`/product/order/status/${orderNo}`);
  }
  // TODO: 待后端实现退款记录查询功能
  // /**
  //  * 获取退款记录
  //  * @param params 分页参数
  //  */
  // getRefundList(params: PageParams): Promise<ApiResponse<PageResponse<any>>> {
  //   return http.get('/api/order/refunds', params)
  // },
  // TODO: 待后端实现订单统计功能
  // /**
  //  * 获取订单统计
  //  */
  // getOrderStats(): Promise<ApiResponse<{
  //   total: number
  //   pending: number
  //   paid: number
  //   shipped: number
  //   completed: number
  //   cancelled: number
  // }>> {
  //   return http.get('/api/order/stats')
  // }
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "orders",
  __ssrInlineRender: true,
  setup(__props) {
    const router = useRouter();
    const userStore = useUserStore();
    const loading = ref(true);
    const errorMessage = ref("");
    const orders2 = ref([]);
    const currentFilter = ref("all");
    const showDetailModal = ref(false);
    const showDeliveryModal = ref(false);
    const showReceiptModal = ref(false);
    const selectedOrder = ref(null);
    const deliveryInfo = ref(null);
    const receiptInfo = ref(null);
    const copiedIndex = ref(-1);
    const pagination = ref({
      page: 1,
      limit: 10,
      total: 0,
      totalPage: 0
    });
    const filterTabs = ref([
      { key: "all", label: "\u5168\u90E8", count: 0 },
      { key: "shipping", label: "\u5F85\u53D1\u8D27", count: 0 },
      { key: "delivered", label: "\u5DF2\u53D1\u8D27", count: 0 }
    ]);
    const displayOrders = computed(() => {
      if (currentFilter.value === "all") {
        return orders2.value;
      }
      return orders2.value.filter((order) => {
        const status = getOrderDisplayStatus(order);
        return status === currentFilter.value;
      });
    });
    const orderStats = computed(() => {
      const stats = {
        total: orders2.value.length,
        shipping: 0,
        delivered: 0
      };
      orders2.value.forEach((order) => {
        const status = getOrderDisplayStatus(order);
        if (status === "shipping") {
          stats.shipping++;
        } else if (status === "delivered") {
          stats.delivered++;
        }
      });
      return stats;
    });
    const fetchOrders = async (page = 1) => {
      if (!userStore.isLoggedIn) {
        await router.push("/login");
        return;
      }
      loading.value = true;
      errorMessage.value = "";
      try {
        const params = {
          page,
          limit: pagination.value.limit,
          paymentStatus: 1
          // 只获取已支付的订单
          // 不需要传userEmail，API会自动使用登录用户的ID
        };
        if (currentFilter.value !== "all") {
          params.status = getApiStatusValue(currentFilter.value);
        }
        const response = await orderApi.getOrderList(params);
        if ((response.code === 0 || response.success) && response.data) {
          orders2.value = response.data.list || [];
          pagination.value = {
            page: response.data.page || 1,
            limit: response.data.limit || 10,
            total: response.data.total || 0,
            totalPage: response.data.totalPage || 1
          };
          updateFilterCounts();
          if (page === 1) {
            fetchAllOrderStats();
          }
        } else if (response.msg === "\u67E5\u8BE2\u6210\u529F" && response.data) {
          orders2.value = response.data.list || [];
          pagination.value = {
            page: response.data.page || 1,
            limit: response.data.limit || 10,
            total: response.data.total || 0,
            totalPage: response.data.totalPage || 1
          };
          updateFilterCounts();
          if (page === 1) {
            fetchAllOrderStats();
          }
        } else {
          throw new Error(response.msg || "\u83B7\u53D6\u8BA2\u5355\u5217\u8868\u5931\u8D25");
        }
      } catch (error) {
        errorMessage.value = error.message || "\u83B7\u53D6\u8BA2\u5355\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5";
        showErrorToast();
      } finally {
        loading.value = false;
      }
    };
    const getOrderDisplayStatus = (order) => {
      if (order.paymentStatus === 1) {
        if (order.deliveryStatus === 0 || order.deliveryStatus === 1) {
          return "shipping";
        } else if (order.deliveryStatus === 2 || order.deliveryStatus === 3) {
          return "delivered";
        }
      }
      return "shipping";
    };
    const getApiStatusValue = (filterStatus) => {
      switch (filterStatus) {
        case "pending":
          return 0;
        case "shipping":
          return 1;
        case "delivered":
          return 2;
        case "completed":
          return 4;
        case "cancelled":
          return 5;
        default:
          return 0;
      }
    };
    const getOrderStatusText = (order) => {
      const status = getOrderDisplayStatus(order);
      const statusMap = {
        shipping: "\u5F85\u53D1\u8D27",
        delivered: "\u5DF2\u53D1\u8D27"
      };
      return statusMap[status] || "\u5F85\u53D1\u8D27";
    };
    const getOrderStatusClass = (order) => {
      const status = getOrderDisplayStatus(order);
      const classMap = {
        shipping: "status-shipping",
        delivered: "status-delivered"
      };
      return classMap[status] || "status-shipping";
    };
    const formatDate = (dateStr) => {
      if (!dateStr) return "\u672A\u77E5\u65F6\u95F4";
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          return dateStr;
        }
        const now = /* @__PURE__ */ new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1e3 * 60 * 60 * 24));
        const timeStr = date.toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        });
        if (days < 0) {
          const futureDays = Math.abs(days);
          if (futureDays === 1) {
            return `${timeStr} (\u660E\u5929)`;
          } else {
            return `${timeStr} (${futureDays}\u5929\u540E)`;
          }
        } else if (days === 0) {
          return `${timeStr} (\u4ECA\u5929)`;
        } else if (days === 1) {
          return `${timeStr} (\u6628\u5929)`;
        } else if (days < 7) {
          return `${timeStr} (${days}\u5929\u524D)`;
        } else if (days < 30) {
          const weeks = Math.floor(days / 7);
          return `${timeStr} (${weeks}\u5468\u524D)`;
        } else if (days < 365) {
          const months = Math.floor(days / 30);
          return `${timeStr} (${months}\u4E2A\u6708\u524D)`;
        } else {
          const years = Math.floor(days / 365);
          return `${timeStr} (${years}\u5E74\u524D)`;
        }
      } catch (error) {
        return dateStr;
      }
    };
    const formatPrice = (price) => {
      if (!price) return "0.00";
      const numPrice = typeof price === "string" ? parseFloat(price.replace(/[¥,]/g, "")) : price;
      return numPrice.toFixed(2);
    };
    const formatPayMethod = (method) => {
      const methodMap = {
        "wechat": "\u5FAE\u4FE1\u652F\u4ED8",
        "alipay": "\u652F\u4ED8\u5B9D",
        "binance": "\u5E01\u5B89\u652F\u4ED8",
        "balance": "\u4F59\u989D\u652F\u4ED8",
        "2": "\u5FAE\u4FE1\u652F\u4ED8",
        "4": "\u652F\u4ED8\u5B9D",
        "3": "\u5E01\u5B89\u652F\u4ED8"
      };
      return methodMap[method] || method || "\u672A\u77E5\u652F\u4ED8\u65B9\u5F0F";
    };
    const getPageNumbers = () => {
      const current = pagination.value.page;
      const total = pagination.value.totalPage;
      const pages = [];
      if (total > 0) pages.push(1);
      for (let i = Math.max(2, current - 2); i <= Math.min(total - 1, current + 2); i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (total > 1 && !pages.includes(total)) pages.push(total);
      return pages.sort((a, b) => a - b);
    };
    const fetchAllOrderStats = async () => {
      try {
        const userStore2 = useUserStore();
        const user = userStore2.user;
        if (!(user == null ? void 0 : user.id)) return;
        const params = { page: 1, limit: 100, paymentStatus: 1 };
        try {
          const response = await orderApi.getOrderList(params);
          if ((response.code === 0 || response.success || response.msg === "\u67E5\u8BE2\u6210\u529F") && response.data) {
            const allPaidOrders = response.data.list || [];
            let shippingCount = 0;
            let deliveredCount = 0;
            allPaidOrders.forEach((order) => {
              if (order.deliveryStatus === 0 || order.deliveryStatus === 1) {
                shippingCount++;
              } else if (order.deliveryStatus === 2 || order.deliveryStatus === 3) {
                deliveredCount++;
              }
            });
            filterTabs.value[0].count = allPaidOrders.length;
            filterTabs.value[1].count = shippingCount;
            filterTabs.value[2].count = deliveredCount;
          }
        } catch {
        }
      } catch (error) {
      }
    };
    const updateFilterCounts = () => {
      const currentTab = filterTabs.value.find((tab) => tab.key === currentFilter.value);
      if (currentTab) {
        currentTab.count = pagination.value.total || 0;
      }
    };
    const canCancelShipping = (order) => {
      return order.paymentStatus === 1 && order.deliveryStatus === 0;
    };
    const isDelivered = (order) => {
      return order.paymentStatus === 1 && (order.deliveryStatus === 2 || order.deliveryStatus === 3);
    };
    const hasReceipts = (order) => {
      return order.deliveryRequiresReceipt || order.hasReceipt || false;
    };
    const handleReceiptSuccess = () => {
      fetchOrders(pagination.value.page);
    };
    const closeReceiptModal = () => {
      showReceiptModal.value = false;
      receiptInfo.value = null;
    };
    const getDeliveryStatusText = (status) => {
      const statusMap = {
        0: "\u5F85\u53D1\u8D27",
        1: "\u90E8\u5206\u53D1\u8D27",
        2: "\u5DF2\u53D1\u8D27",
        3: "\u5DF2\u9001\u8FBE"
      };
      return statusMap[status] || "\u672A\u77E5";
    };
    const parseDeliveryContent = (content) => {
      try {
        const parsed = JSON.parse(content);
        return parsed.cdkCode || content;
      } catch {
        return content;
      }
    };
    const getEmptyText = () => {
      const textMap = {
        all: "\u6682\u65E0\u8BA2\u5355",
        shipping: "\u6682\u65E0\u5F85\u53D1\u8D27\u8BA2\u5355",
        delivered: "\u6682\u65E0\u5DF2\u53D1\u8D27\u8BA2\u5355"
      };
      return textMap[currentFilter.value] || "\u6682\u65E0\u76F8\u5173\u8BA2\u5355";
    };
    const getEmptyDesc = () => {
      const descMap = {
        all: "\u60A8\u8FD8\u6CA1\u6709\u4EFB\u4F55\u8BA2\u5355",
        shipping: "\u60A8\u8FD8\u6CA1\u6709\u5F85\u53D1\u8D27\u7684\u8BA2\u5355",
        delivered: "\u60A8\u8FD8\u6CA1\u6709\u5DF2\u53D1\u8D27\u7684\u8BA2\u5355"
      };
      return descMap[currentFilter.value] || "\u6682\u65E0\u76F8\u5173\u8BA2\u5355\u6570\u636E";
    };
    const showErrorToast = () => {
      setTimeout(() => {
        errorMessage.value = "";
      }, 5e3);
    };
    watch(() => userStore.isLoggedIn, (isLoggedIn) => {
      if (!isLoggedIn) {
        router.push("/login");
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
      const _component_NotificationBell = resolveComponent("NotificationBell");
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "orders-container" }, _attrs))} data-v-6a019135>`);
      if (loading.value) {
        _push(`<div class="loading-state" data-v-6a019135><div class="loading-spinner" data-v-6a019135></div><div class="loading-text" data-v-6a019135>\u52A0\u8F7D\u8BA2\u5355\u4E2D...</div></div>`);
      } else {
        _push(`<div class="orders-section" data-v-6a019135><div class="section-header" data-v-6a019135><h2 class="section-title" data-v-6a019135>\u6211\u7684\u8BA2\u5355</h2><div class="header-right" data-v-6a019135>`);
        _push(ssrRenderComponent(_component_NotificationBell, null, null, _parent));
        _push(`<div class="order-stats" data-v-6a019135><div class="stat-item" data-v-6a019135><span class="stat-count" data-v-6a019135>${ssrInterpolate(orderStats.value.total)}</span><span class="stat-label" data-v-6a019135>\u5168\u90E8</span></div><div class="stat-item" data-v-6a019135><span class="stat-count" data-v-6a019135>${ssrInterpolate(orderStats.value.shipping)}</span><span class="stat-label" data-v-6a019135>\u5F85\u53D1\u8D27</span></div><div class="stat-item" data-v-6a019135><span class="stat-count" data-v-6a019135>${ssrInterpolate(orderStats.value.delivered)}</span><span class="stat-label" data-v-6a019135>\u5DF2\u53D1\u8D27</span></div></div></div></div><div class="filter-tabs" data-v-6a019135><!--[-->`);
        ssrRenderList(filterTabs.value, (tab) => {
          _push(`<div class="${ssrRenderClass(["filter-tab", { active: currentFilter.value === tab.key }])}" data-v-6a019135>${ssrInterpolate(tab.label)} `);
          if (tab.count > 0) {
            _push(`<span class="tab-badge" data-v-6a019135>${ssrInterpolate(tab.count)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
        if (displayOrders.value.length === 0) {
          _push(`<div class="empty-state" data-v-6a019135><div class="empty-icon" data-v-6a019135>\u{1F4E6}</div><div class="empty-text" data-v-6a019135>${ssrInterpolate(getEmptyText())}</div><div class="empty-desc" data-v-6a019135>${ssrInterpolate(getEmptyDesc())}</div><button class="go-shopping-btn" data-v-6a019135>${ssrInterpolate(currentFilter.value === "all" ? "\u53BB\u8D2D\u7269" : "\u67E5\u770B\u5168\u90E8\u8BA2\u5355")}</button></div>`);
        } else {
          _push(`<div class="orders-list" data-v-6a019135><!--[-->`);
          ssrRenderList(displayOrders.value, (order) => {
            _push(`<div class="order-card" data-v-6a019135><div class="order-header" data-v-6a019135><div class="order-meta" data-v-6a019135><span class="order-number" data-v-6a019135>\u8BA2\u5355\u53F7: ${ssrInterpolate(order.orderNo || order.id)}</span><span class="order-date" data-v-6a019135><svg class="icon-clock" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" data-v-6a019135><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" data-v-6a019135></path></svg> \u4E0B\u5355\u65F6\u95F4: ${ssrInterpolate(formatDate(order.createdAt || order.createTime || order.time))}</span></div><div class="${ssrRenderClass([getOrderStatusClass(order), "order-status"])}" data-v-6a019135>${ssrInterpolate(getOrderStatusText(order))}</div></div><div class="order-content" data-v-6a019135><div class="product-info" data-v-6a019135><div class="product-title" data-v-6a019135>${ssrInterpolate(order.goodsName || order.title || order.productName || "\u5546\u54C1")}</div><div class="product-details" data-v-6a019135>`);
            if (order.productType || order.category) {
              _push(`<div class="detail-row" data-v-6a019135><span class="detail-label" data-v-6a019135>\u5546\u54C1\u7C7B\u578B:</span><span class="detail-value" data-v-6a019135>${ssrInterpolate(order.productType || order.category || "\u865A\u62DF\u5546\u54C1")}</span></div>`);
            } else {
              _push(`<!---->`);
            }
            if (order.specifications || order.spec) {
              _push(`<div class="detail-row" data-v-6a019135><span class="detail-label" data-v-6a019135>\u89C4\u683C:</span><span class="detail-value" data-v-6a019135>${ssrInterpolate(order.specifications || order.spec || "\u6807\u51C6\u7248")}</span></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<div class="detail-row" data-v-6a019135><span class="detail-label" data-v-6a019135>\u6570\u91CF:</span><span class="detail-value" data-v-6a019135>${ssrInterpolate(order.quantity || 1)}</span></div>`);
            if (order.payMethod) {
              _push(`<div class="detail-row" data-v-6a019135><span class="detail-label" data-v-6a019135>\u652F\u4ED8\u65B9\u5F0F:</span><span class="detail-value" data-v-6a019135>${ssrInterpolate(formatPayMethod(order.payMethod))}</span></div>`);
            } else {
              _push(`<!---->`);
            }
            if (order.paidAt || order.payTime) {
              _push(`<div class="detail-row" data-v-6a019135><span class="detail-label" data-v-6a019135>\u652F\u4ED8\u65F6\u95F4:</span><span class="detail-value" data-v-6a019135>${ssrInterpolate(formatDate(order.paidAt || order.payTime))}</span></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div><div class="price-info" data-v-6a019135><div class="total-price" data-v-6a019135>\xA5${ssrInterpolate(formatPrice(order.totalAmount || order.amount))}</div>`);
            if (order.price) {
              _push(`<div class="unit-price" data-v-6a019135> \u5355\u4EF7: \xA5${ssrInterpolate(formatPrice(order.price))}</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div><div class="order-actions" data-v-6a019135>`);
            if (canCancelShipping(order)) {
              _push(`<button class="action-btn secondary" data-v-6a019135> \u53D6\u6D88\u8BA2\u5355 </button>`);
            } else {
              _push(`<!---->`);
            }
            if (hasReceipts(order)) {
              _push(`<button class="action-btn warning" data-v-6a019135> \u67E5\u770B\u56DE\u6267\u5355 </button>`);
            } else {
              _push(`<!---->`);
            }
            if (isDelivered(order) && !hasReceipts(order)) {
              _push(`<button class="action-btn primary" data-v-6a019135> \u67E5\u770B\u53D1\u8D27\u4FE1\u606F </button>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<button class="action-btn secondary" data-v-6a019135> \u67E5\u770B\u8BE6\u60C5 </button></div></div>`);
          });
          _push(`<!--]--></div>`);
        }
        if (pagination.value.totalPage > 1) {
          _push(`<div class="pagination" data-v-6a019135><button${ssrIncludeBooleanAttr(pagination.value.page <= 1) ? " disabled" : ""} class="page-btn" data-v-6a019135> \u4E0A\u4E00\u9875 </button><div class="page-numbers" data-v-6a019135><!--[-->`);
          ssrRenderList(getPageNumbers(), (pageNum) => {
            _push(`<button class="${ssrRenderClass(["page-number", { active: pageNum === pagination.value.page }])}" data-v-6a019135>${ssrInterpolate(pageNum)}</button>`);
          });
          _push(`<!--]--></div><button${ssrIncludeBooleanAttr(pagination.value.page >= pagination.value.totalPage) ? " disabled" : ""} class="page-btn" data-v-6a019135> \u4E0B\u4E00\u9875 </button><div class="page-info" data-v-6a019135> \u7B2C ${ssrInterpolate(pagination.value.page)} \u9875\uFF0C\u5171 ${ssrInterpolate(pagination.value.totalPage)} \u9875\uFF0C${ssrInterpolate(pagination.value.total)} \u6761\u8BB0\u5F55 </div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      if (showDetailModal.value) {
        _push(`<div class="modal-mask" data-v-6a019135><div class="detail-modal" data-v-6a019135><div class="modal-header" data-v-6a019135><h3 class="modal-title" data-v-6a019135>\u8BA2\u5355\u8BE6\u60C5</h3><button class="modal-close" data-v-6a019135>\xD7</button></div>`);
        if (selectedOrder.value) {
          _push(`<div class="modal-body" data-v-6a019135><div class="detail-section" data-v-6a019135><h4 data-v-6a019135>\u8BA2\u5355\u4FE1\u606F</h4><div class="detail-grid" data-v-6a019135><div class="detail-item" data-v-6a019135><span class="label" data-v-6a019135>\u8BA2\u5355\u53F7:</span><span class="value" data-v-6a019135>${ssrInterpolate(selectedOrder.value.orderNo || selectedOrder.value.id)}</span></div><div class="detail-item" data-v-6a019135><span class="label" data-v-6a019135>\u5546\u54C1\u540D\u79F0:</span><span class="value" data-v-6a019135>${ssrInterpolate(selectedOrder.value.goodsName || selectedOrder.value.title)}</span></div><div class="detail-item" data-v-6a019135><span class="label" data-v-6a019135>\u8BA2\u5355\u72B6\u6001:</span><span class="${ssrRenderClass([getOrderStatusClass(selectedOrder.value), "value status"])}" data-v-6a019135>${ssrInterpolate(getOrderStatusText(selectedOrder.value))}</span></div><div class="detail-item" data-v-6a019135><span class="label" data-v-6a019135>\u4E0B\u5355\u65F6\u95F4:</span><span class="value" data-v-6a019135>${ssrInterpolate(formatDate(selectedOrder.value.createdAt || selectedOrder.value.createTime || selectedOrder.value.time))}</span></div>`);
          if (selectedOrder.value.paidAt || selectedOrder.value.payTime) {
            _push(`<div class="detail-item" data-v-6a019135><span class="label" data-v-6a019135>\u652F\u4ED8\u65F6\u95F4:</span><span class="value" data-v-6a019135>${ssrInterpolate(formatDate(selectedOrder.value.paidAt || selectedOrder.value.payTime))}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          if (selectedOrder.value.payMethod) {
            _push(`<div class="detail-item" data-v-6a019135><span class="label" data-v-6a019135>\u652F\u4ED8\u65B9\u5F0F:</span><span class="value" data-v-6a019135>${ssrInterpolate(formatPayMethod(selectedOrder.value.payMethod))}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div><div class="detail-section" data-v-6a019135><h4 data-v-6a019135>\u5546\u54C1\u4FE1\u606F</h4><div class="detail-grid" data-v-6a019135><div class="detail-item" data-v-6a019135><span class="label" data-v-6a019135>\u5546\u54C1\u4EF7\u683C:</span><span class="value" data-v-6a019135>\xA5${ssrInterpolate(formatPrice(selectedOrder.value.price || selectedOrder.value.amount))}</span></div><div class="detail-item" data-v-6a019135><span class="label" data-v-6a019135>\u8D2D\u4E70\u6570\u91CF:</span><span class="value" data-v-6a019135>${ssrInterpolate(selectedOrder.value.quantity || 1)}</span></div><div class="detail-item" data-v-6a019135><span class="label" data-v-6a019135>\u8BA2\u5355\u603B\u989D:</span><span class="value highlight" data-v-6a019135>\xA5${ssrInterpolate(formatPrice(selectedOrder.value.totalAmount || selectedOrder.value.amount))}</span></div></div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (showReceiptModal.value) {
        _push(ssrRenderComponent(ReceiptModal, {
          orderNo: ((_a = selectedOrder.value) == null ? void 0 : _a.orderNo) || ((_b = selectedOrder.value) == null ? void 0 : _b.id),
          productName: ((_c = selectedOrder.value) == null ? void 0 : _c.productName) || ((_d = selectedOrder.value) == null ? void 0 : _d.goodsName),
          isViewing: true,
          onClose: closeReceiptModal,
          onSuccess: handleReceiptSuccess
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (showDeliveryModal.value) {
        _push(`<div class="modal-mask" data-v-6a019135><div class="delivery-modal" data-v-6a019135><div class="modal-header" data-v-6a019135><h3 class="modal-title" data-v-6a019135>\u53D1\u8D27\u4FE1\u606F</h3><button class="modal-close" data-v-6a019135>\xD7</button></div><div class="modal-body" data-v-6a019135>`);
        if (deliveryInfo.value) {
          _push(`<div class="delivery-content" data-v-6a019135><div class="info-section" data-v-6a019135><h4 data-v-6a019135>\u8BA2\u5355\u4FE1\u606F</h4><div class="info-grid" data-v-6a019135><div class="info-item" data-v-6a019135><span class="label" data-v-6a019135>\u8BA2\u5355\u53F7:</span><span class="value" data-v-6a019135>${ssrInterpolate((_e = deliveryInfo.value.order) == null ? void 0 : _e.orderNo)}</span></div><div class="info-item" data-v-6a019135><span class="label" data-v-6a019135>\u5546\u54C1\u540D\u79F0:</span><span class="value" data-v-6a019135>${ssrInterpolate((_f = deliveryInfo.value.order) == null ? void 0 : _f.productName)}</span></div><div class="info-item" data-v-6a019135><span class="label" data-v-6a019135>\u53D1\u8D27\u72B6\u6001:</span><span class="value status" data-v-6a019135>${ssrInterpolate(getDeliveryStatusText((_g = deliveryInfo.value.order) == null ? void 0 : _g.deliveryStatus))}</span></div>`);
          if ((_h = deliveryInfo.value.order) == null ? void 0 : _h.deliveredAt) {
            _push(`<div class="info-item" data-v-6a019135><span class="label" data-v-6a019135>\u53D1\u8D27\u65F6\u95F4:</span><span class="value" data-v-6a019135>${ssrInterpolate(formatDate((_i = deliveryInfo.value.order) == null ? void 0 : _i.deliveredAt))}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
          if (((_j = deliveryInfo.value.deliveryRecords) == null ? void 0 : _j.length) > 0) {
            _push(`<div class="info-section" data-v-6a019135><h4 data-v-6a019135>CDK\u4FE1\u606F</h4><div class="cdk-list" data-v-6a019135><!--[-->`);
            ssrRenderList(deliveryInfo.value.deliveryRecords, (record, index) => {
              _push(`<div class="cdk-item" data-v-6a019135><div class="cdk-header" data-v-6a019135><span class="cdk-index" data-v-6a019135>#${ssrInterpolate(index + 1)}</span><span class="${ssrRenderClass([record.deliveryStatus === 1 ? "success" : "failed", "cdk-status"])}" data-v-6a019135>${ssrInterpolate(record.deliveryStatus === 1 ? "\u53D1\u8D27\u6210\u529F" : "\u53D1\u8D27\u5931\u8D25")}</span></div>`);
              if (record.cdkCode) {
                _push(`<div class="cdk-code-wrapper" data-v-6a019135><input${ssrRenderAttr("value", record.cdkCode)} readonly class="cdk-code" data-v-6a019135><button class="copy-btn" data-v-6a019135>${ssrInterpolate(copiedIndex.value === index ? "\u5DF2\u590D\u5236" : "\u590D\u5236")}</button></div>`);
              } else if (record.deliveryContent) {
                _push(`<div class="delivery-text" data-v-6a019135>${ssrInterpolate(parseDeliveryContent(record.deliveryContent))}</div>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div>`);
            });
            _push(`<!--]--></div><div class="cdk-tips" data-v-6a019135><span class="tips-icon" data-v-6a019135>\u{1F4A1}</span><span data-v-6a019135>\u8BF7\u59A5\u5584\u4FDD\u5B58\u60A8\u7684CDK\u4FE1\u606F\uFF0C\u907F\u514D\u6CC4\u9732\u7ED9\u4ED6\u4EBA</span></div></div>`);
          } else {
            _push(`<div class="empty-delivery" data-v-6a019135><div class="empty-icon" data-v-6a019135>\u{1F4E7}</div><div class="empty-text" data-v-6a019135>\u5546\u54C1\u4FE1\u606F\u5DF2\u901A\u8FC7\u90AE\u4EF6\u53D1\u9001</div><div class="empty-desc" data-v-6a019135> \u6211\u4EEC\u5DF2\u5C06\u5B8C\u6574\u7684\u5546\u54C1\u4FE1\u606F\u548C\u4F7F\u7528\u8BF4\u660E\u53D1\u9001\u5230\u60A8\u7684\u90AE\u7BB1<br data-v-6a019135> \u8BF7\u68C0\u67E5\u6536\u4EF6\u7BB1\u548C\u5783\u573E\u90AE\u4EF6\u6587\u4EF6\u5939 </div></div>`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (errorMessage.value) {
        _push(`<div class="error-toast" data-v-6a019135><div class="toast-content" data-v-6a019135><span class="toast-icon" data-v-6a019135>\u26A0\uFE0F</span><span class="toast-text" data-v-6a019135>${ssrInterpolate(errorMessage.value)}</span></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/profile/orders.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const orders = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-6a019135"]]);

export { orders as default };
//# sourceMappingURL=orders-CL305Xi1.mjs.map
