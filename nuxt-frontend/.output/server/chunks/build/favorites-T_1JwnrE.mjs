import { defineComponent, computed, ref, watch, useSSRContext } from 'vue';
import { ssrRenderList, ssrRenderAttr, ssrInterpolate, ssrRenderClass, ssrRenderComponent } from 'vue/server-renderer';
import { useRouter } from 'vue-router';
import { _ as _export_sfc, d as useUserStore } from './server.mjs';
import { O as OrderPayModal } from './OrderPayModal-Bq5WvYUW.mjs';
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
import './virtual_public-rJCVlDvA.mjs';
import './virtual_public-DvjXfd9G.mjs';
import './PaySuccessModal-CTEodsrH.mjs';
import './ReceiptModal-ppj2k2En.mjs';
import 'qrcode';

const payCountdown = 900;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "favorites",
  __ssrInlineRender: true,
  setup(__props) {
    useRouter();
    const userStore = useUserStore();
    computed(() => {
      var _a;
      return ((_a = userStore.user) == null ? void 0 : _a.id) || 1;
    });
    const favorites2 = ref([]);
    const selectedPrices = ref({});
    const showPayModal = ref(false);
    const payGoods = ref({});
    const handlePayClose = () => {
      showPayModal.value = false;
    };
    const handlePayTimeout = () => {
      showPayModal.value = false;
    };
    const handlePaySuccess = (paymentInfo) => {
      showPayModal.value = false;
    };
    const initializePriceSelections = () => {
      favorites2.value.forEach((item) => {
        if (!(item.id in selectedPrices.value)) {
          selectedPrices.value[item.id] = 0;
        }
      });
    };
    watch(favorites2, () => {
      initializePriceSelections();
    }, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[--><div class="favorites-section" data-v-c11fe9e9><div class="section-header" data-v-c11fe9e9><h2 class="section-title" data-v-c11fe9e9>\u6211\u7684\u6536\u85CF</h2></div><div class="favorites-tabs" data-v-c11fe9e9><div class="tab-item active" data-v-c11fe9e9>\u5168\u90E8\u6536\u85CF</div><div class="tab-item" data-v-c11fe9e9>Netflix</div><div class="tab-item" data-v-c11fe9e9>Disney+</div><div class="tab-item" data-v-c11fe9e9>HBO Max</div><div class="tab-item" data-v-c11fe9e9>Apple TV+</div><div class="tab-item" data-v-c11fe9e9>Hulu</div><div class="tab-item" data-v-c11fe9e9>Prime Video</div></div>`);
      if (favorites2.value.length === 0) {
        _push(`<div class="empty-state" data-v-c11fe9e9><div class="empty-icon" data-v-c11fe9e9>\u2661</div><div class="empty-text" data-v-c11fe9e9>\u6682\u65E0\u6536\u85CF\u5546\u54C1</div><div class="empty-desc" data-v-c11fe9e9>\u53BB\u5546\u54C1\u9875\u9762\u6536\u85CF\u559C\u6B22\u7684\u5546\u54C1\u5427~</div><button class="go-shopping-btn" data-v-c11fe9e9>\u53BB\u901B\u901B</button></div>`);
      } else {
        _push(`<div class="favorites-list" data-v-c11fe9e9><!--[-->`);
        ssrRenderList(favorites2.value, (item) => {
          _push(`<div class="favorite-card" data-v-c11fe9e9><div class="card-header" data-v-c11fe9e9><img${ssrRenderAttr("src", item.image)}${ssrRenderAttr("alt", item.name)} class="favorite-logo" data-v-c11fe9e9><span class="favorite-title" data-v-c11fe9e9>${ssrInterpolate(item.name)}</span>`);
          if (item.hot) {
            _push(`<span class="favorite-hot" data-v-c11fe9e9>\u70ED\u95E8</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="favorite-desc" data-v-c11fe9e9>${ssrInterpolate(item.desc)}</div><div class="favorite-params" data-v-c11fe9e9><div data-v-c11fe9e9><span class="favorite-param-label" data-v-c11fe9e9>\u5730\u533A\uFF1A</span><span class="favorite-param-value" data-v-c11fe9e9>${ssrInterpolate(item.region)}</span></div><div data-v-c11fe9e9><span class="favorite-param-label" data-v-c11fe9e9>\u6E05\u6670\u5EA6\uFF1A</span><span class="favorite-param-value" data-v-c11fe9e9>${ssrInterpolate(item.quality)}</span></div><div data-v-c11fe9e9><span class="favorite-param-label" data-v-c11fe9e9>\u8BBE\u5907\u6570\uFF1A</span><span class="favorite-param-value" data-v-c11fe9e9>${ssrInterpolate(item.devices)}</span></div><div data-v-c11fe9e9><span class="favorite-param-label" data-v-c11fe9e9>\u652F\u6301\u4E0B\u8F7D\uFF1A</span><span class="favorite-param-value" data-v-c11fe9e9>${ssrInterpolate(item.download)}</span></div></div><div class="favorite-prices" data-v-c11fe9e9><!--[-->`);
          ssrRenderList(item.prices, (price, priceIndex) => {
            _push(`<div class="${ssrRenderClass([{ selected: selectedPrices.value[item.id] === priceIndex }, "price-item"])}" data-v-c11fe9e9><span class="price-label" data-v-c11fe9e9>${ssrInterpolate(price.label)}</span><span class="price-value" data-v-c11fe9e9>${ssrInterpolate(price.value)}</span></div>`);
          });
          _push(`<!--]--></div><div class="favorite-actions" data-v-c11fe9e9><button class="buy-btn" data-v-c11fe9e9>\u7ACB\u5373\u8D2D\u4E70</button><button class="cancel-btn" data-v-c11fe9e9>\u53D6\u6D88\u6536\u85CF</button></div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div>`);
      if (showPayModal.value) {
        _push(ssrRenderComponent(OrderPayModal, {
          shopLogo: payGoods.value.shopLogo,
          shopName: payGoods.value.shopName,
          shopDesc: payGoods.value.shopDesc,
          orderId: payGoods.value.orderId,
          price: payGoods.value.price,
          countdown: payCountdown,
          onClose: handlePayClose,
          onTimeout: handlePayTimeout,
          onPaySuccess: handlePaySuccess
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/profile/favorites.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const favorites = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c11fe9e9"]]);

export { favorites as default };
//# sourceMappingURL=favorites-T_1JwnrE.mjs.map
