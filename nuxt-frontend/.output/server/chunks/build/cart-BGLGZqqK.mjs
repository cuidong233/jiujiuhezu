import { defineComponent, computed, ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain } from 'vue/server-renderer';
import { useRouter } from 'vue-router';
import { _ as _export_sfc, d as useUserStore } from './server.mjs';
import { _ as __nuxt_component_0, a as __nuxt_component_1 } from './AppFooter-DftAiZQA.mjs';
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
import './v3-CddZA8nI.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import './virtual_public-rJCVlDvA.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "cart",
  __ssrInlineRender: true,
  setup(__props) {
    useRouter();
    const userStore = useUserStore();
    computed(() => {
      var _a;
      return ((_a = userStore.user) == null ? void 0 : _a.id) || 1;
    });
    const cartItems = ref([]);
    const selectedIds = ref([]);
    const totalPrice = computed(() => {
      if (!cartItems.value || !Array.isArray(cartItems.value) || cartItems.value.length === 0) return 0;
      return cartItems.value.reduce((sum, i) => {
        if (!i || typeof i.price !== "number" || typeof i.quantity !== "number") return sum;
        return sum + i.price * i.quantity;
      }, 0);
    });
    const discount = computed(() => {
      if (totalPrice.value >= 1e3) return 120;
      if (totalPrice.value >= 500) return 50;
      if (totalPrice.value >= 200) return 20;
      return 0;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "cart-page" }, _attrs))} data-v-e568987b>`);
      _push(ssrRenderComponent(__nuxt_component_0, null, null, _parent));
      _push(`<div class="cart-main-bg" data-v-e568987b><div class="cart-container" data-v-e568987b><div class="cart-list-section" data-v-e568987b><h2 class="cart-title" data-v-e568987b>\u8D2D\u7269\u8F66</h2><table class="cart-table" data-v-e568987b><thead data-v-e568987b><tr data-v-e568987b><th data-v-e568987b>\u9009\u62E9</th><th data-v-e568987b>\u5546\u54C1\u4FE1\u606F</th><th data-v-e568987b>\u5355\u4EF7</th><th data-v-e568987b>\u6570\u91CF</th><th data-v-e568987b>\u5C0F\u8BA1</th><th data-v-e568987b>\u64CD\u4F5C</th></tr></thead><tbody data-v-e568987b><!--[-->`);
      ssrRenderList(cartItems.value, (item) => {
        _push(`<tr data-v-e568987b><td data-v-e568987b><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(selectedIds.value) ? ssrLooseContain(selectedIds.value, item.id) : selectedIds.value) ? " checked" : ""}${ssrRenderAttr("value", item.id)} data-v-e568987b></td><td class="cart-goods-info" data-v-e568987b><img${ssrRenderAttr("src", item.image)} class="cart-goods-img" data-v-e568987b><div class="cart-goods-meta" data-v-e568987b><div class="cart-goods-name" data-v-e568987b>${ssrInterpolate(item.name)}</div>`);
        if (item.skuName) {
          _push(`<div class="cart-goods-spec" data-v-e568987b>\u89C4\u683C\uFF1A${ssrInterpolate(item.skuName)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></td><td class="cart-price" data-v-e568987b>\uFFE5${ssrInterpolate((item.price || 0).toFixed(2))}</td><td class="cart-qty" data-v-e568987b><button data-v-e568987b>-</button><span data-v-e568987b>${ssrInterpolate(item.quantity)}</span><button data-v-e568987b>+</button></td><td class="cart-subtotal" data-v-e568987b>\uFFE5${ssrInterpolate((item.price * item.quantity).toFixed(2))}</td><td data-v-e568987b><button class="cart-remove" data-v-e568987b>\u5220\u9664</button></td></tr>`);
      });
      _push(`<!--]--></tbody></table></div><div class="cart-summary-section" data-v-e568987b><div class="summary-title" data-v-e568987b>\u8BA2\u5355\u7ED3\u7B97</div><div class="summary-row" data-v-e568987b><span data-v-e568987b>\u5546\u54C1\u603B\u989D</span><span data-v-e568987b>\uFFE5${ssrInterpolate(totalPrice.value.toFixed(2))}</span></div><div class="summary-row" data-v-e568987b><span data-v-e568987b>\u4F18\u60E0\u6298\u6263</span><span class="discount" data-v-e568987b>-\uFFE5${ssrInterpolate(discount.value.toFixed(2))}</span></div><div class="summary-row line" data-v-e568987b><span data-v-e568987b>\u8FD0\u8D39</span><span data-v-e568987b>\uFFE50.00</span></div><div class="summary-row total" data-v-e568987b><span data-v-e568987b>\u5E94\u4ED8\u603B\u989D</span><span class="total-price" data-v-e568987b>\uFFE5${ssrInterpolate((totalPrice.value - discount.value).toFixed(2))}</span></div><button class="checkout-btn" data-v-e568987b>\u53BB\u7ED3\u7B97 (${ssrInterpolate(cartItems.value.length)})</button><div class="cart-tips" data-v-e568987b><div data-v-e568987b><div class="tips-title" data-v-e568987b>\u4F18\u60E0\u63D0\u793A</div><div class="tips-content" data-v-e568987b> \u6EE1\uFFE5200\u51CF\uFFE520\uFF5C\u6EE1\uFFE5500\u51CF\uFFE550\uFF5C\u6EE1\uFFE51000\u51CF\uFFE5120<br data-v-e568987b> \u6EE1\uFFE5200\u51CF\uFFE520\uFF5C\u6EE1\uFFE5500\u51CF\uFFE550\uFF5C\u6EE1\uFFE51000\u51CF\uFFE5120 \u518D\u8D2D\uFFE58094.00 \u53EF\u4EAB\u53D7\u6EE1\uFFE59000\u51CF\uFFE5500\u4F18\u60E0 </div></div></div></div></div></div>`);
      _push(ssrRenderComponent(__nuxt_component_1, null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/cart.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const cart = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-e568987b"]]);

export { cart as default };
//# sourceMappingURL=cart-BGLGZqqK.mjs.map
