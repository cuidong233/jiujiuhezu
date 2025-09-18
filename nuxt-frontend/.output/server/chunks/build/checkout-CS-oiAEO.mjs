import { defineComponent, ref, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrRenderClass, ssrInterpolate, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { useRouter } from 'vue-router';
import { _ as __nuxt_component_0, a as __nuxt_component_1 } from './AppFooter-DftAiZQA.mjs';
import { p as publicAssetsURL } from '../nitro/nitro.mjs';
import { _ as _export_sfc, d as useUserStore } from './server.mjs';
import { P as PaySuccessModal } from './PaySuccessModal-CTEodsrH.mjs';
import './v3-CddZA8nI.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import './virtual_public-rJCVlDvA.mjs';
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
import './ReceiptModal-ppj2k2En.mjs';

const _imports_0 = publicAssetsURL("/images/yue.png");
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "BalanceNotEnoughModal",
  __ssrInlineRender: true,
  props: {
    balance: { type: Number, default: 0 },
    needAmount: { type: Number, default: 0 },
    options: { type: Array, default: () => [
      { value: 50, desc: "\u65E0\u4F18\u60E0" },
      { value: 100, desc: "\u9001\uFFE520" },
      { value: 200, desc: "\u9001\uFFE550" },
      { value: 500, desc: "\u9001\uFFE5150" }
    ] }
  },
  setup(__props) {
    const props = __props;
    const diffAmount = computed(() => Math.max(props.needAmount - props.balance, 0));
    const selectedIdx = ref(1);
    const inputValue = ref(null);
    useRouter();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "modal-mask" }, _attrs))} data-v-680eb8e3><div class="balance-modal" data-v-680eb8e3><div class="modal-header" data-v-680eb8e3><div class="modal-title" data-v-680eb8e3>\u4F59\u989D\u4E0D\u8DB3</div><div class="modal-subtitle" data-v-680eb8e3>\u60A8\u7684\u8D26\u6237\u4F59\u989D\u4E0D\u8DB3\u4EE5\u5B8C\u6210\u5F53\u524D\u64CD\u4F5C</div><button class="modal-close" data-v-680eb8e3>\xD7</button></div><div class="modal-content" data-v-680eb8e3><div class="warn-icon-box" data-v-680eb8e3><svg class="warn-icon" viewBox="0 0 80 80" fill="none" data-v-680eb8e3><path d="M40 12L72 68H8L40 12Z" fill="#FF5B5B" data-v-680eb8e3></path><rect x="37" y="36" width="6" height="18" rx="3" fill="#fff" data-v-680eb8e3></rect><rect x="37" y="58" width="6" height="6" rx="3" fill="#fff" data-v-680eb8e3></rect></svg></div><div class="main-tip" data-v-680eb8e3> \u5F53\u524D\u64CD\u4F5C\u9700\u8981<span class="need-amount" data-v-680eb8e3>\uFFE5${ssrInterpolate(__props.needAmount.toFixed(2))}</span>\uFF0C\u4F46\u60A8\u7684\u8D26\u6237\u4F59\u989D\u4E0D\u8DB3\uFF0C<br data-v-680eb8e3>\u8BF7\u5145\u503C\u540E\u518D\u7EE7\u7EED\u64CD\u4F5C </div><div class="amount-row-card2" data-v-680eb8e3><div class="amount-block-card2" data-v-680eb8e3><div class="amount-label" data-v-680eb8e3>\u5F53\u524D\u8D26\u6237\u4F59\u989D</div><div class="amount-value" data-v-680eb8e3>\uFFE5${ssrInterpolate(__props.balance.toFixed(2))}</div></div><div class="amount-block-card2" data-v-680eb8e3><div class="amount-label" data-v-680eb8e3>\u9700\u8981\u91D1\u989D</div><div class="amount-value need" data-v-680eb8e3>\uFFE5${ssrInterpolate(__props.needAmount.toFixed(2))}</div><div class="amount-diff" data-v-680eb8e3>\u5DEE\u989D: <span data-v-680eb8e3>\uFFE5${ssrInterpolate(diffAmount.value.toFixed(2))}</span></div></div></div><div class="recharge-section-card2" data-v-680eb8e3><div class="recharge-title" data-v-680eb8e3>\u8BF7\u9009\u62E9\u5145\u503C\u91D1\u989D</div><div class="recharge-options-card2" data-v-680eb8e3><!--[-->`);
      ssrRenderList(__props.options, (item, idx) => {
        _push(`<div class="${ssrRenderClass(["recharge-option-card2", { active: selectedIdx.value === idx }])}" data-v-680eb8e3><div class="recharge-main" data-v-680eb8e3>\uFFE5${ssrInterpolate(item.value)}</div><div class="recharge-desc" data-v-680eb8e3>${ssrInterpolate(item.desc)}</div></div>`);
      });
      _push(`<!--]--></div><div class="recharge-input-row" data-v-680eb8e3><input${ssrRenderAttr("value", inputValue.value)} type="number" min="1" placeholder="\u8F93\u5165\u5176\u4ED6\u91D1\u989D" data-v-680eb8e3><button class="input-confirm-card2" data-v-680eb8e3>\u786E\u5B9A</button></div></div></div><div class="modal-actions-card" data-v-680eb8e3><button class="btn-cancel-card" data-v-680eb8e3>\u53D6\u6D88</button><button class="btn-confirm-card" data-v-680eb8e3><img${ssrRenderAttr("src", _imports_0)} alt="\u4F59\u989D\u5145\u503C" style="${ssrRenderStyle({ "width": "20px", "height": "20px", "margin-right": "6px", "vertical-align": "middle" })}" data-v-680eb8e3> \u524D\u5F80\u94B1\u5305\u5145\u503C </button></div><div class="modal-tip-card" data-v-680eb8e3> \u5145\u503C\u91D1\u989D\u5373\u65F6\u5230\u8D26\uFF0C\u53EF\u7528\u4E8E\u5E73\u53F0\u6240\u6709\u6D88\u8D39 <a href="#" class="recharge-link" data-v-680eb8e3>\u67E5\u770B\u5145\u503C\u8BF4\u660E</a></div></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/BalanceNotEnoughModal.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const BalanceNotEnoughModal = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-680eb8e3"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "checkout",
  __ssrInlineRender: true,
  setup(__props) {
    useRouter();
    const userStore = useUserStore();
    const showBalanceModal = ref(false);
    const showPaySuccess = ref(false);
    const needAmount = ref(0);
    const payMethod = ref("balance");
    const cartItems = ref([]);
    ref([]);
    ref([]);
    const selectedCoupon = ref(null);
    const totalPrice = computed(() => cartItems.value.reduce((sum, i) => sum + i.price * i.quantity, 0));
    const discount = computed(() => selectedCoupon.value ? selectedCoupon.value.amount : 0);
    computed(() => totalPrice.value - discount.value);
    return (_ctx, _push, _parent, _attrs) => {
      var _a2;
      var _a;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "checkout-page" }, _attrs))} data-v-2bb57c7c>`);
      _push(ssrRenderComponent(__nuxt_component_0, null, null, _parent));
      _push(`<div class="checkout-content" data-v-2bb57c7c><div class="checkout-container" data-v-2bb57c7c><div class="order-info" data-v-2bb57c7c><div class="order-card" data-v-2bb57c7c><div class="order-header" data-v-2bb57c7c><img src="https://via.placeholder.com/64x64?text=N" class="order-logo" data-v-2bb57c7c><div class="order-header-main" data-v-2bb57c7c><div class="order-title-row" data-v-2bb57c7c><span class="brand" data-v-2bb57c7c>NETFLIX</span><span class="price-tag" data-v-2bb57c7c>\uFFE529/\u6708</span></div><div class="order-meta" data-v-2bb57c7c><span data-v-2bb57c7c>\u5546\u54C1\u5C5E\u6027\uFF1ANetflix\u4E00\u4E2A\u6708</span><span data-v-2bb57c7c>\u8BA2\u5355\u53F7\uFF1A1471461548159010</span></div></div></div><div class="order-divider" data-v-2bb57c7c></div><div class="section-title" data-v-2bb57c7c>\u6838\u5BF9\u60A8\u7684\u5957\u9910</div><div class="plan-main" data-v-2bb57c7c><div class="plan-box" data-v-2bb57c7c><div class="plan-title" data-v-2bb57c7c>\u6708\u4ED8\u5957\u9910</div><div class="plan-features" data-v-2bb57c7c><div data-v-2bb57c7c>\u57FA\u7840\u6E05\u6670\u5EA6\uFF08720p\uFF09</div><div data-v-2bb57c7c>\u65E0\u5E7F\u544A\u4F53\u9A8C</div><div data-v-2bb57c7c>1\u53F0\u8BBE\u5907\u540C\u65F6\u89C2\u770B</div><div data-v-2bb57c7c>\u6BCF\u6708\u81EA\u52A8\u7EED\u8BA2</div></div></div><div class="plan-options" data-v-2bb57c7c><div class="option-group" data-v-2bb57c7c><div class="option-title" data-v-2bb57c7c>\u5730\u533A\u9009\u62E9</div><div class="option-list" data-v-2bb57c7c><label data-v-2bb57c7c><input type="checkbox" data-v-2bb57c7c> \u7F8E\u56FD\uFF08\u5185\u5BB9\u6700\u5168\uFF09</label><label data-v-2bb57c7c><input type="checkbox" data-v-2bb57c7c> \u82F1\u56FD\uFF08\u66F4\u65B0\u6700\u5FEB\uFF09</label><label data-v-2bb57c7c><input type="checkbox" data-v-2bb57c7c> \u65E5\u672C\uFF08\u52A8\u6F2B\u6700\u591A\uFF09</label></div></div><div class="option-group" data-v-2bb57c7c><div class="option-title" data-v-2bb57c7c>\u6E05\u6670\u5EA6\u9009\u62E9</div><div class="option-list" data-v-2bb57c7c><label data-v-2bb57c7c><input type="checkbox" data-v-2bb57c7c> \u9AD8\u6E05\uFF081080p\uFF09</label><label data-v-2bb57c7c><input type="checkbox" data-v-2bb57c7c> \u8D85\u9AD8\u6E05\uFF084K\uFF09</label></div></div></div></div><div class="section-title" style="${ssrRenderStyle({ "margin-top": "32px" })}" data-v-2bb57c7c>Disney+ \u5E74\u5EA6\u8BA2\u9605</div><div class="disney-section" data-v-2bb57c7c><img src="https://via.placeholder.com/100x100?text=Disney+" class="disney-img" data-v-2bb57c7c><div class="disney-info" data-v-2bb57c7c><div class="disney-price-row" data-v-2bb57c7c><span class="disney-title" data-v-2bb57c7c>\uFFE5180</span><span class="disney-discount" data-v-2bb57c7c>\u7ACB\u51CF\uFFE510</span></div><div class="disney-desc" data-v-2bb57c7c>\u6D77\u91CF\u8FEA\u58EB\u5C3C\u3001\u76AE\u514B\u65AF\u3001\u6F2B\u5A01\u3001\u661F\u7403\u5927\u6218\u548C\u56FD\u5BB6\u5730\u7406\u5185\u5BB9</div><button class="disney-btn" data-v-2bb57c7c>\u52A0\u8D2D</button></div></div></div></div><div class="order-summary" data-v-2bb57c7c><div class="summary-card" data-v-2bb57c7c><div class="summary-title" data-v-2bb57c7c>\u4EF7\u683C\u660E\u7EC6</div><div class="summary-list" data-v-2bb57c7c><div class="summary-row" data-v-2bb57c7c><span data-v-2bb57c7c>Netflix \u6708\u4ED8</span><span data-v-2bb57c7c>\uFFE529</span></div><div class="summary-row" data-v-2bb57c7c><span data-v-2bb57c7c>Netflix \u6708\u4ED8\u52A0\u8D2D</span><span data-v-2bb57c7c>\uFFE529</span></div><div class="summary-row" data-v-2bb57c7c><span data-v-2bb57c7c>Disney+ \u5E74\u5EA6\u8BA2\u9605</span><span data-v-2bb57c7c>\uFFE50</span></div><div class="summary-row" data-v-2bb57c7c><span data-v-2bb57c7c>\u6298\u6263</span><span class="discount" data-v-2bb57c7c>-\uFFE50</span></div><div class="summary-row total" data-v-2bb57c7c><span data-v-2bb57c7c>\u5408\u8BA1</span><span class="total-price" data-v-2bb57c7c>\uFFE558</span></div></div><div class="coupon-row" data-v-2bb57c7c><input class="coupon-input" placeholder="\u70B9\u51FB\u8F93\u5165\u4F18\u60E0\u7801" data-v-2bb57c7c><button class="coupon-btn" data-v-2bb57c7c>\u5E94\u7528</button></div><div class="coupon-tip" data-v-2bb57c7c>\u8F93\u5165\u4F18\u60E0\u7801\u53EF\u4EAB\u53D7\u989D\u5916\u6298\u6263</div><div class="pay-methods" data-v-2bb57c7c><div class="${ssrRenderClass([{ selected: payMethod.value === "balance" }, "pay-method"])}" data-v-2bb57c7c><span class="pay-icon" data-v-2bb57c7c>\u{1F3AB}</span> \u4F59\u989D\u652F\u4ED8 `);
      if (payMethod.value === "balance") {
        _push(`<span class="check" data-v-2bb57c7c>\u2714</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="${ssrRenderClass([{ selected: payMethod.value === "alipay" }, "pay-method"])}" data-v-2bb57c7c><span class="pay-icon" data-v-2bb57c7c>\u{1F4B3}</span> \u652F\u4ED8\u5B9D\u652F\u4ED8 `);
      if (payMethod.value === "alipay") {
        _push(`<span class="check" data-v-2bb57c7c>\u2714</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="privacy-tip" data-v-2bb57c7c>\u9690\u79C1\u653F\u7B56/\u7528\u6237\u534F\u8BAE\u9075\u7167\u653F\u7B56</div><div class="summary-actions" data-v-2bb57c7c><button class="gift-btn" data-v-2bb57c7c>\u8D2D\u4E70\u540E\u8D60\u9001AI\u4F53\u9A8C\u5361\uFF08\u4EF7\u503C\uFFE599\uFF09</button><button class="pay-btn" data-v-2bb57c7c>${ssrInterpolate(payMethod.value === "balance" ? "\u4F59\u989D\u652F\u4ED8" : "\u652F\u4ED8\u5B9D\u652F\u4ED8")}</button><div class="pay-tip" data-v-2bb57c7c>*\u70B9\u51FB\u652F\u4ED8\u5373\u8868\u793A\u60A8\u540C\u610F\u6211\u4EEC\u7684\u670D\u52A1\u534F\u8BAE\u548C\u9690\u79C1\u653F\u7B56</div></div></div></div></div></div>`);
      _push(ssrRenderComponent(__nuxt_component_1, null, null, _parent));
      if (showBalanceModal.value) {
        _push(ssrRenderComponent(BalanceNotEnoughModal, {
          balance: (_a2 = (_a = unref(userStore).user) == null ? void 0 : _a.balance) != null ? _a2 : 0,
          needAmount: needAmount.value,
          onClose: ($event) => showBalanceModal.value = false
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (showPaySuccess.value) {
        _push(ssrRenderComponent(PaySuccessModal, null, null, _parent));
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/checkout.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const checkout = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-2bb57c7c"]]);

export { checkout as default };
//# sourceMappingURL=checkout-CS-oiAEO.mjs.map
