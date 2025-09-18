import { defineComponent, ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderList, ssrRenderClass, ssrInterpolate } from 'vue/server-renderer';
import { _ as _export_sfc, d as useUserStore } from './server.mjs';
import { useRouter } from 'vue-router';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "exchange",
  __ssrInlineRender: true,
  setup(__props) {
    useUserStore();
    useRouter();
    const couponList = ref([]);
    const redeemCode = ref("");
    const activeTab = ref("all");
    const filteredCoupons = () => {
      if (activeTab.value === "all") return couponList.value;
      if (activeTab.value === "used") return couponList.value.filter((c) => c.isUsed);
      if (activeTab.value === "expired") return couponList.value.filter((c) => new Date(c.expireTime) < /* @__PURE__ */ new Date());
      return couponList.value.filter((c) => !c.isUsed && new Date(c.expireTime) >= /* @__PURE__ */ new Date());
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "exchange-section" }, _attrs))} data-v-3deed277><div class="section-header" data-v-3deed277><h2 class="section-title" data-v-3deed277>\u5151\u6362\u4E2D\u5FC3</h2></div><div class="exchange-container" data-v-3deed277><div class="exchange-title-area" data-v-3deed277><h3 class="exchange-title" data-v-3deed277>\u5151\u6362\u4F18\u60E0\u5238</h3></div><div class="exchange-input-area" data-v-3deed277><div class="input-wrapper" data-v-3deed277><input type="text" class="exchange-input" placeholder="\u8BF7\u8F93\u5165\u5151\u6362\u7801"${ssrRenderAttr("value", redeemCode.value)} data-v-3deed277><button class="exchange-btn" data-v-3deed277>\u7ACB\u5373\u5151\u6362</button></div><p class="exchange-tips" data-v-3deed277>\u5151\u6362\u7801\u901A\u5E38\u753116\u4F4D\u5B57\u6BCD\u548C\u6570\u5B57\u7EC4\u6210\uFF0C\u533A\u5206\u5927\u5C0F\u5199</p></div></div><div class="coupon-tabs" data-v-3deed277><div class="tab-item active" data-v-3deed277>\u5168\u90E8\u4F18\u60E0\u5238</div><div class="tab-item" data-v-3deed277>\u672A\u4F7F\u7528</div><div class="tab-item" data-v-3deed277>\u5DF2\u4F7F\u7528</div><div class="tab-item" data-v-3deed277>\u5DF2\u8FC7\u671F</div></div><div class="coupon-list" data-v-3deed277><!--[-->`);
      ssrRenderList(filteredCoupons, (coupon) => {
        _push(`<div class="${ssrRenderClass([{ "available": !coupon.isUsed, "expired": new Date(coupon.expireTime) < /* @__PURE__ */ new Date() }, "coupon-card"])}" data-v-3deed277><div class="coupon-header" data-v-3deed277><div class="coupon-amount" data-v-3deed277>\xA5${ssrInterpolate(coupon.amount)}</div><div class="coupon-info" data-v-3deed277><div class="coupon-type" data-v-3deed277>${ssrInterpolate(coupon.name)}</div><div class="coupon-condition" data-v-3deed277>\u6EE1\xA5${ssrInterpolate(coupon.minOrderAmount)}\u53EF\u7528</div></div></div><div class="coupon-body" data-v-3deed277><div class="coupon-desc" data-v-3deed277>${ssrInterpolate(coupon.description)}</div></div><div class="coupon-footer" data-v-3deed277><div class="coupon-expiry" data-v-3deed277><span class="expiry-label" data-v-3deed277>\u6709\u6548\u671F\uFF1A</span><span class="expiry-date" data-v-3deed277>${ssrInterpolate(new Date(coupon.expireTime).toISOString().slice(0, 10))}</span></div>`);
        if (!coupon.isUsed && new Date(coupon.expireTime) >= /* @__PURE__ */ new Date()) {
          _push(`<button class="coupon-action use-btn" data-v-3deed277>\u53BB\u4F7F\u7528</button>`);
        } else if (new Date(coupon.expireTime) < /* @__PURE__ */ new Date()) {
          _push(`<button class="coupon-action expired-btn" data-v-3deed277>\u5DF2\u8FC7\u671F</button>`);
        } else {
          _push(`<button class="coupon-action use-btn" data-v-3deed277>\u5DF2\u4F7F\u7528</button>`);
        }
        _push(`</div></div>`);
      });
      _push(`<!--]--></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/profile/exchange.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const exchange = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-3deed277"]]);

export { exchange as default };
//# sourceMappingURL=exchange-DV7wZJKM.mjs.map
