import { defineComponent, ref, mergeProps, computed, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderComponent, ssrRenderAttr, ssrRenderStyle, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { _ as _imports_0 } from './virtual_public-DvjXfd9G.mjs';
import { _ as _imports_1 } from './virtual_public-rJCVlDvA.mjs';
import { _ as _export_sfc } from './server.mjs';
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
import 'vue-router';
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

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "WalletRechargeModal",
  __ssrInlineRender: true,
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const options = [
      { value: 50 },
      { value: 100 },
      { value: 200 },
      { value: 500 }
    ];
    const selectedIdx = ref(0);
    const inputValue = ref(null);
    const payType = ref("alipay");
    const rateLoading = ref(false);
    const exchangeRate = ref({
      buy: 7.35,
      sell: 7.25,
      mid: 7.3,
      spread: 0.1,
      source: "Binance P2P"
    });
    const usdtAmount = computed(() => {
      const amount = selectedIdx.value >= 0 ? options[selectedIdx.value].value : inputValue.value || 0;
      return (amount / exchangeRate.value.sell).toFixed(2);
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "modal-mask" }, _attrs))} data-v-00bcbd3a><div class="wallet-recharge-modal" data-v-00bcbd3a><div class="modal-header" data-v-00bcbd3a><div class="modal-title" data-v-00bcbd3a>\u5145\u503C</div><div class="modal-subtitle" data-v-00bcbd3a>\u4E3A\u60A8\u7684\u4F59\u989D\u5145\u503C\u5427\uFF01</div><button class="modal-close" data-v-00bcbd3a>\xD7</button></div><div class="modal-content" data-v-00bcbd3a><div class="section-label" data-v-00bcbd3a>\u5145\u503C</div><div class="amount-options" data-v-00bcbd3a><!--[-->`);
      ssrRenderList(options, (item, idx) => {
        _push(`<div class="${ssrRenderClass(["amount-option", { active: selectedIdx.value === idx }])}" data-v-00bcbd3a><div class="amount-main" data-v-00bcbd3a>\xA5${ssrInterpolate(item.value)}</div></div>`);
      });
      _push(`<!--]--><div class="${ssrRenderClass(["amount-option", "custom-option", { active: selectedIdx.value === -1 }])}" data-v-00bcbd3a><span data-v-00bcbd3a>\u81EA\u5B9A\u4E49</span></div></div>`);
      if (selectedIdx.value === -1) {
        _push(`<div class="custom-amount-row" data-v-00bcbd3a><input${ssrRenderAttr("value", inputValue.value)} type="number" min="1" placeholder="\u8BF7\u8F93\u5165\u5145\u503C\u91D1\u989D" data-v-00bcbd3a></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="section-label pay-label" data-v-00bcbd3a>\u9009\u62E9\u652F\u4ED8\u65B9\u5F0F</div><div class="pay-methods" data-v-00bcbd3a><div class="${ssrRenderClass(["pay-method", payType.value === "alipay" ? "active" : ""])}" data-v-00bcbd3a><div class="pay-method-content" data-v-00bcbd3a><img class="pay-icon"${ssrRenderAttr("src", _imports_0)} alt="\u652F\u4ED8\u5B9D" data-v-00bcbd3a><span data-v-00bcbd3a>\u652F\u4ED8\u5B9D</span></div></div><div class="${ssrRenderClass(["pay-method", payType.value === "wechat" ? "active" : ""])}" data-v-00bcbd3a><div class="pay-method-content" data-v-00bcbd3a><img class="pay-icon"${ssrRenderAttr("src", _imports_1)} alt="\u5FAE\u4FE1\u652F\u4ED8" data-v-00bcbd3a><span data-v-00bcbd3a>\u5FAE\u4FE1\u652F\u4ED8</span></div></div><div class="${ssrRenderClass(["pay-method", payType.value === "binance" ? "active" : ""])}" data-v-00bcbd3a><div class="pay-method-content" data-v-00bcbd3a><span style="${ssrRenderStyle({ "font-size": "24px", "margin-right": "12px" })}" data-v-00bcbd3a>\u20AE</span><span data-v-00bcbd3a>USDT\u5145\u503C</span></div></div></div>`);
      if (payType.value === "binance") {
        _push(`<div class="binance-rate-info" data-v-00bcbd3a><div class="rate-header" data-v-00bcbd3a><span class="rate-title" data-v-00bcbd3a>\u5B9E\u65F6\u6C47\u7387</span><button class="rate-refresh"${ssrIncludeBooleanAttr(rateLoading.value) ? " disabled" : ""} data-v-00bcbd3a>${ssrInterpolate(rateLoading.value ? "\u5237\u65B0\u4E2D..." : "\u5237\u65B0")}</button></div><div class="rate-content" data-v-00bcbd3a><div class="rate-item" data-v-00bcbd3a><span class="rate-label" data-v-00bcbd3a>USDT/CNY\uFF1A</span><span class="rate-value" data-v-00bcbd3a>\xA5${ssrInterpolate(exchangeRate.value.sell)}</span></div><div class="rate-item" data-v-00bcbd3a><span class="rate-label" data-v-00bcbd3a>\u5145\u503C\u91D1\u989D\uFF1A</span><span class="rate-value" data-v-00bcbd3a>${ssrInterpolate(usdtAmount.value)} USDT</span></div><div class="rate-source" data-v-00bcbd3a>\u6570\u636E\u6765\u6E90\uFF1A${ssrInterpolate(exchangeRate.value.source)}</div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="btn-confirm" data-v-00bcbd3a>\u7ACB\u5373\u5145\u503C</button></div><div class="modal-bottom-blank" data-v-00bcbd3a></div></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/WalletRechargeModal.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-00bcbd3a"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "wallet",
  __ssrInlineRender: true,
  setup(__props) {
    const showRechargeModal = ref(false);
    const balance = ref(0);
    const transactions = ref([]);
    const closeRechargeModal = () => {
      showRechargeModal.value = false;
    };
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_WalletRechargeModal = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "wallet-section" }, _attrs))} data-v-c942fcb0><div class="section-header" data-v-c942fcb0><h2 class="section-title" data-v-c942fcb0>\u6211\u7684\u94B1\u5305</h2></div><div class="balance-card" data-v-c942fcb0><div class="balance-content" data-v-c942fcb0><div class="balance-label" data-v-c942fcb0>\u53EF\u7528\u4F59\u989D</div><div class="balance-amount" data-v-c942fcb0>\xA5 ${ssrInterpolate((_a = balance.value.toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })) != null ? _a : "0.00")}</div><button class="recharge-btn" data-v-c942fcb0>\u53BB\u5145\u503C</button></div></div><div class="balance-details" data-v-c942fcb0><div class="details-header" data-v-c942fcb0><h3 class="details-title" data-v-c942fcb0>\u4F59\u989D\u660E\u7EC6</h3></div><div class="transaction-list" data-v-c942fcb0><!--[-->`);
      ssrRenderList(transactions.value, (item) => {
        _push(`<div class="transaction-item" data-v-c942fcb0><div class="transaction-info" data-v-c942fcb0><div class="transaction-title" data-v-c942fcb0>${ssrInterpolate(item.type)}</div><div class="transaction-time" data-v-c942fcb0>${ssrInterpolate(item.created_at)}</div></div><div class="${ssrRenderClass([{ positive: item.amount > 0, negative: item.amount < 0 }, "transaction-amount"])}" data-v-c942fcb0>${ssrInterpolate(item.amount > 0 ? "+" : "")}${ssrInterpolate((item.amount || 0).toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}</div></div>`);
      });
      _push(`<!--]--></div></div>`);
      if (showRechargeModal.value) {
        _push(ssrRenderComponent(_component_WalletRechargeModal, { onClose: closeRechargeModal }, null, _parent));
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/profile/wallet.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const wallet = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c942fcb0"]]);

export { wallet as default };
//# sourceMappingURL=wallet-DjC5vbjv.mjs.map
