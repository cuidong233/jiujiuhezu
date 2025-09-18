import { defineComponent, ref, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { R as ReceiptModal } from './ReceiptModal-ppj2k2En.mjs';
import { _ as _export_sfc } from './server.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "PaySuccessModal",
  __ssrInlineRender: true,
  props: {
    orderId: {
      type: String,
      default: "N/A"
    },
    payType: {
      type: String,
      default: "balance"
    },
    amount: {
      type: [String, Number],
      default: 0
    },
    productName: {
      type: String,
      default: ""
    },
    productType: {
      type: String,
      default: ""
    }
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const showReceiptModal = ref(false);
    const receiptFilled = ref(false);
    const isRechargeService = computed(() => {
      var _a, _b;
      return props.productType === "recharge" || ((_a = props.productName) == null ? void 0 : _a.includes("\u4EE3\u5145")) || ((_b = props.productName) == null ? void 0 : _b.includes("\u5145\u503C"));
    });
    const safeOrderId = computed(() => {
      return props.orderId || "N/A";
    });
    const safeAmount = computed(() => {
      try {
        const num = typeof props.amount === "string" ? parseFloat(props.amount || "0") : props.amount || 0;
        return isNaN(num) ? "0.00" : num.toFixed(2);
      } catch {
        return "0.00";
      }
    });
    const safePayTypeName = computed(() => {
      const typeMap = {
        "alipay": "\u652F\u4ED8\u5B9D\u652F\u4ED8",
        "balance": "\u4F59\u989D\u652F\u4ED8",
        "other": "\u5176\u4ED6\u652F\u4ED8"
      };
      return typeMap[props.payType] || "\u672A\u77E5\u652F\u4ED8\u65B9\u5F0F";
    });
    const safeTime = computed(() => {
      try {
        const now = /* @__PURE__ */ new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hour = String(now.getHours()).padStart(2, "0");
        const minute = String(now.getMinutes()).padStart(2, "0");
        const second = String(now.getSeconds()).padStart(2, "0");
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
      } catch {
        return "\u83B7\u53D6\u65F6\u95F4\u5931\u8D25";
      }
    });
    const handleReceiptClose = () => {
      showReceiptModal.value = false;
    };
    const handleReceiptSuccess = () => {
      receiptFilled.value = true;
      showReceiptModal.value = false;
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "modal-mask" }, _attrs))} data-v-704f18f0>`);
      if (showReceiptModal.value) {
        _push(ssrRenderComponent(ReceiptModal, {
          orderNo: safeOrderId.value,
          productName: __props.productName,
          onClose: handleReceiptClose,
          onSuccess: handleReceiptSuccess
        }, null, _parent));
      } else {
        _push(`<div class="pay-success-modal" data-v-704f18f0><div class="success-header" data-v-704f18f0><div class="success-circle" data-v-704f18f0><svg width="80" height="80" viewBox="0 0 96 96" fill="none" data-v-704f18f0><circle cx="48" cy="48" r="48" fill="#fff" data-v-704f18f0></circle><path d="M30 50l14 14 22-28" stroke="#2196F3" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" data-v-704f18f0></path></svg></div><div class="success-title" data-v-704f18f0>\u652F\u4ED8\u6210\u529F\uFF01</div><div class="success-desc" data-v-704f18f0>${ssrInterpolate(isRechargeService.value ? "\u8BF7\u586B\u5199\u56DE\u6267\u4FE1\u606F\u4EE5\u5B8C\u6210\u8BA2\u5355" : "\u611F\u8C22\u60A8\u7684\u8D2D\u4E70\uFF0C\u8BA2\u5355\u5DF2\u5904\u7406\u5B8C\u6210")}</div></div><div class="success-info" data-v-704f18f0><div class="info-row" data-v-704f18f0><span class="info-label" data-v-704f18f0>\u8BA2\u5355\u7F16\u53F7</span><span class="info-value info-link" data-v-704f18f0>#${ssrInterpolate(safeOrderId.value)}</span></div><div class="info-divider" data-v-704f18f0></div><div class="info-row" data-v-704f18f0><span class="info-label" data-v-704f18f0>\u652F\u4ED8\u91D1\u989D</span><span class="info-value info-amount" data-v-704f18f0>\uFFE5${ssrInterpolate(safeAmount.value)}</span></div><div class="info-divider" data-v-704f18f0></div><div class="info-row" data-v-704f18f0><span class="info-label" data-v-704f18f0>\u652F\u4ED8\u65B9\u5F0F</span><span class="info-value info-paytype" data-v-704f18f0>${ssrInterpolate(safePayTypeName.value)}</span></div><div class="info-divider" data-v-704f18f0></div><div class="info-row" data-v-704f18f0><span class="info-label" data-v-704f18f0>\u652F\u4ED8\u65F6\u95F4</span><span class="info-value info-time" data-v-704f18f0>${ssrInterpolate(safeTime.value)}</span></div><div class="info-divider" data-v-704f18f0></div><div class="info-row" data-v-704f18f0><span class="info-label" data-v-704f18f0>\u8BA2\u5355\u72B6\u6001</span><span class="info-value info-status" data-v-704f18f0>\u5DF2\u652F\u4ED8\uFF0C\u5546\u54C1\u4FE1\u606F\u5DF2\u53D1\u9001\u90AE\u7BB1</span></div></div><div class="success-actions" data-v-704f18f0>`);
        if (isRechargeService.value && !receiptFilled.value) {
          _push(`<button class="order-btn" data-v-704f18f0> \u586B\u5199\u56DE\u6267\u5355 </button>`);
        } else {
          _push(`<button class="order-btn" data-v-704f18f0> \u524D\u5F80\u67E5\u770B\u8BA2\u5355 </button>`);
        }
        _push(`<button class="home-btn" data-v-704f18f0> \u8FD4\u56DE\u9996\u9875 </button></div><div class="success-tip" data-v-704f18f0> \u{1F4E7} \u8BA2\u5355\u8BE6\u60C5\u548C\u5546\u54C1\u4FE1\u606F\u5DF2\u53D1\u9001\u5230\u60A8\u7684\u90AE\u7BB1\uFF0C\u8BF7\u6CE8\u610F\u67E5\u6536 <br data-v-704f18f0>\u5982\u6709\u4EFB\u4F55\u95EE\u9898\uFF0C\u8BF7\u8054\u7CFB\u5BA2\u670D <span class="kefu-phone" data-v-704f18f0>400-123-4567</span></div></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PaySuccessModal.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const PaySuccessModal = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-704f18f0"]]);

export { PaySuccessModal as P };
//# sourceMappingURL=PaySuccessModal-CTEodsrH.mjs.map
