import { defineComponent, ref, mergeProps, watch, computed, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderStyle } from 'vue/server-renderer';
import { O as OrderPayModal, s as setInterval } from './OrderPayModal-Bq5WvYUW.mjs';
import { _ as _export_sfc, f as useModalStore, d as useUserStore } from './server.mjs';
import { _ as __nuxt_component_0$1, a as __nuxt_component_1$1, b as __nuxt_component_0$1$1 } from './AppFooter-DftAiZQA.mjs';
import { _ as _imports_4, a as _imports_6, b as _imports_8 } from './virtual_public-xbw59hvI.mjs';
import { useRouter } from 'vue-router';
import { u as useHead } from './v3-CddZA8nI.mjs';
import './virtual_public-rJCVlDvA.mjs';
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
import './virtual_public-DvjXfd9G.mjs';
import './PaySuccessModal-CTEodsrH.mjs';
import './ReceiptModal-ppj2k2En.mjs';
import 'qrcode';
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
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';

const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "BannerSection",
  __ssrInlineRender: true,
  props: {
    banners: {}
  },
  setup(__props) {
    const props = __props;
    const currentIndex = ref(0);
    let timer = null;
    const startAutoPlay = () => {
      stopAutoPlay();
      if (props.banners.length > 1) {
        timer = setInterval();
      }
    };
    const stopAutoPlay = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };
    watch(() => props.banners, () => {
      currentIndex.value = 0;
      startAutoPlay();
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "banner-section" }, _attrs))} data-v-c0cb12e6><div class="banner-inner" data-v-c0cb12e6><div class="banner-slider" data-v-c0cb12e6>`);
      if (_ctx.banners.length > 0) {
        _push(`<div class="banner-item" data-v-c0cb12e6><img${ssrRenderAttr("src", _ctx.banners[currentIndex.value].image)}${ssrRenderAttr("alt", _ctx.banners[currentIndex.value].title)} class="banner-image" data-v-c0cb12e6></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (_ctx.banners.length > 1) {
        _push(`<div class="banner-indicators" data-v-c0cb12e6><!--[-->`);
        ssrRenderList(_ctx.banners, (banner, index2) => {
          _push(`<span class="${ssrRenderClass(["indicator", { active: index2 === currentIndex.value }])}" data-v-c0cb12e6></span>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      if (_ctx.banners.length > 1) {
        _push(`<div class="banner-controls" data-v-c0cb12e6><button class="control-btn prev" data-v-c0cb12e6>\u2039</button><button class="control-btn next" data-v-c0cb12e6>\u203A</button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></section>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/BannerSection.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-c0cb12e6"]]);
const payCountdown = 900;
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "GoodsSection",
  __ssrInlineRender: true,
  props: {
    goodsList: {}
  },
  setup(__props) {
    const props = __props;
    useUserStore();
    useModalStore();
    const activeDiscount = ref(null);
    const tabs = [
      { key: "all", label: "\u5168\u90E8", categoryId: null },
      { key: "video", label: "\u89C6\u9891\u97F3\u4E50", categoryId: 3 },
      { key: "vtuber", label: "Vtuber", categoryId: 4 },
      { key: "recharge", label: "\u4EE3\u5145\u4EE3\u4ED8", categoryId: 8 },
      { key: "game", label: "\u6E38\u620F", categoryId: 9 },
      { key: "card", label: "\u5361\u5238", categoryId: 10 },
      { key: "welfare", label: "\u798F\u5229\u793E", categoryId: 11 }
    ];
    const activeTab = ref("all");
    computed(() => tabs.findIndex((t) => t.key === activeTab.value));
    ref([]);
    const underlineStyle = ref({ left: "0px", width: "120px" });
    const filteredGoods = computed(() => {
      const activeTabData = tabs.find((t) => t.key === activeTab.value);
      if (!activeTabData) return props.goodsList;
      if (activeTabData.categoryId === null) {
        return props.goodsList;
      }
      return props.goodsList.filter((goods) => {
        const goodsCategoryId = Number(goods.categoryId || goods.categoryCode);
        return goodsCategoryId === activeTabData.categoryId;
      });
    });
    const getGoodsTags = (goods) => {
      var _a, _b;
      if (goods.attributes && goods.attributes.tags) {
        if (typeof goods.attributes.tags === "string") {
          try {
            return JSON.parse(goods.attributes.tags);
          } catch {
            return goods.attributes.tags.split(",").map((tag) => tag.trim());
          }
        }
        if (Array.isArray(goods.attributes.tags)) {
          return goods.attributes.tags;
        }
      }
      if (typeof goods.attributes === "string") {
        try {
          const attrs = JSON.parse(goods.attributes);
          if (attrs.tags) {
            if (Array.isArray(attrs.tags)) {
              return attrs.tags;
            }
            if (typeof attrs.tags === "string") {
              return attrs.tags.split(",").map((tag) => tag.trim());
            }
          }
        } catch {
        }
      }
      if (goods.tags) {
        if (Array.isArray(goods.tags)) {
          return goods.tags;
        }
        if (typeof goods.tags === "string") {
          return goods.tags.split(",").map((tag) => tag.trim());
        }
      }
      const defaultTags = [];
      if (goods.quality === "4K" || ((_a = goods.name) == null ? void 0 : _a.includes("4K"))) {
        defaultTags.push("4K\u9AD8\u6E05");
      }
      if (goods.region === "\u5168\u7403" || ((_b = goods.name) == null ? void 0 : _b.includes("\u5168\u7403"))) {
        defaultTags.push("\u5168\u7403\u89E3\u9501");
      }
      if (goods.duration === "\u6708" || goods.duration === "1\u4E2A\u6708") {
        defaultTags.push("\u5355\u6708\u8D77\u552E");
      }
      return defaultTags.slice(0, 4);
    };
    const getTagClass = (tag) => {
      if (tag.includes("\u5168\u7403") || tag.includes("\u89E3\u9501")) return "feature-global";
      if (tag.includes("4K") || tag.includes("\u9AD8\u6E05")) return "feature-4k";
      if (tag.includes("\u675C\u6BD4") || tag.includes("\u97F3\u6548")) return "feature-dolby";
      if (tag.includes("\u6708") || tag.includes("\u8D77\u552E")) return "feature-monthly";
      return "";
    };
    const getDisplayPrice = (goods) => {
      if (goods.min_sku_price !== void 0 && goods.min_sku_price !== null) {
        return goods.min_sku_price;
      }
      if (goods.skus && Array.isArray(goods.skus) && goods.skus.length > 0) {
        const validSkus = goods.skus.filter(
          (sku) => sku.status === 1 && sku.stock > 0
        );
        if (validSkus.length > 0) {
          const sortedSkus = validSkus.sort(
            (a, b) => parseFloat(a.price) - parseFloat(b.price)
          );
          return sortedSkus[0].price;
        }
      }
      if (goods.min_price !== void 0 && goods.min_price !== null) {
        return goods.min_price;
      }
      return goods.price || "0.00";
    };
    const showPayModal = ref(false);
    const payGoods = ref(null);
    function handlePayTimeout() {
      showPayModal.value = false;
    }
    useRouter();
    const getDiscountText = () => {
      if (!activeDiscount.value) return "";
      if (activeDiscount.value.discount_type === "percentage") {
        const discount = activeDiscount.value.discount_value / 10;
        return `\u9650\u65F6${discount}\u6298`;
      } else {
        return `\u7ACB\u51CF\xA5${activeDiscount.value.discount_value}`;
      }
    };
    const handlePaySuccess = (paymentInfo) => {
      var _a, _b;
      console.log("\u{1F6D2} \u5546\u54C1\u5217\u8868\u9875\u652F\u4ED8\u6210\u529F\uFF01", paymentInfo);
      alert(`\u{1F389} \u652F\u4ED8\u6210\u529F\uFF01
\u5546\u54C1\uFF1A${((_a = payGoods.value) == null ? void 0 : _a.name) || ((_b = payGoods.value) == null ? void 0 : _b.title)}
\u8BA2\u5355\u53F7\uFF1A${paymentInfo.orderId}
\u91D1\u989D\uFF1A\xA5${paymentInfo.amount}`);
      showPayModal.value = false;
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_OptimizedImage = __nuxt_component_0$1$1;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "goods-section" }, _attrs))} data-v-b90ba080><div class="goods-inner" data-v-b90ba080><div class="goods-tabs-wrap" data-v-b90ba080><div class="goods-tabs" data-v-b90ba080><!--[-->`);
      ssrRenderList(tabs, (tab, idx) => {
        _push(`<div class="${ssrRenderClass(["goods-tab", { active: tab.key === activeTab.value }])}" data-v-b90ba080><div class="tab-icon" data-v-b90ba080></div><div class="tab-label" data-v-b90ba080>${ssrInterpolate(tab.label)}</div></div>`);
      });
      _push(`<!--]--></div><div class="tab-underline" style="${ssrRenderStyle(underlineStyle.value)}" data-v-b90ba080></div></div><div class="goods-grid" data-v-b90ba080><!--[-->`);
      ssrRenderList(filteredGoods.value, (goods, index2) => {
        _push(`<div class="goods-card" style="${ssrRenderStyle({ "cursor": "pointer" })}" data-v-b90ba080>`);
        if (goods.status === 1) {
          _push(`<div class="goods-hot-tag" data-v-b90ba080>\u70ED\u5356</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="goods-default-layout" data-v-b90ba080><div class="goods-image special-image" data-v-b90ba080><img${ssrRenderAttr("src", goods.image || "/images/netflix.png")}${ssrRenderAttr("alt", goods.name)} class="special-img" data-v-b90ba080></div><div class="goods-info" data-v-b90ba080><div class="goods-title-row2" data-v-b90ba080><span class="goods-name2" data-v-b90ba080>${ssrInterpolate(goods.name)}</span><span class="goods-recent" data-v-b90ba080>\u{1F552} XX\u5206\u949F\u524D\u8D2D\u4E70\u8FC7</span><span class="goods-help" data-v-b90ba080><svg width="16" height="16" viewBox="0 0 16 16" fill="none" data-v-b90ba080><circle cx="8" cy="8" r="8" fill="#EDF3FF" data-v-b90ba080></circle><text x="8" y="12" text-anchor="middle" font-size="12" fill="#235CDC" data-v-b90ba080>?</text></svg></span></div><div class="goods-meta2" data-v-b90ba080><span class="goods-price-label" data-v-b90ba080>\u5238\u540E</span><span class="goods-price2" data-v-b90ba080>${ssrInterpolate(getDisplayPrice(goods))}</span><span class="goods-price-unit" data-v-b90ba080>/${ssrInterpolate(goods.add_unit || "12\u4E2A\u6708")}</span></div><div class="goods-sales-row2" data-v-b90ba080><span data-v-b90ba080>\u9500\u91CF: ${ssrInterpolate(goods.sales || "2.5\u4E07+")}</span><span data-v-b90ba080>\u597D\u8BC4: 98%</span></div><div class="goods-features2 special-features" data-v-b90ba080><!--[-->`);
        ssrRenderList(getGoodsTags(goods), (tag, idx) => {
          _push(`<span class="goods-feature2" data-v-b90ba080>${ssrInterpolate(tag)}</span>`);
        });
        _push(`<!--]-->`);
        if (!getGoodsTags(goods).length) {
          _push(`<span class="goods-feature2" data-v-b90ba080>\u70ED\u9500\u5546\u54C1</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        {
          _push(`<div class="goods-promo2 special-promo" data-v-b90ba080>`);
          if (activeDiscount.value) {
            _push(`<div class="discount-badge" data-v-b90ba080><span class="discount-text" data-v-b90ba080>${ssrInterpolate(getDiscountText())}</span></div>`);
          } else {
            _push(ssrRenderComponent(_component_OptimizedImage, {
              src: "/images/cut.png",
              alt: "\u9650\u65F6\u4F18\u60E0",
              title: "\u9650\u65F6\u4F18\u60E0",
              width: 60,
              height: 20,
              loading: "lazy",
              class: "cut-img"
            }, null, _parent));
          }
          _push(`</div>`);
        }
        _push(`</div></div><div class="goods-hover-layout" data-v-b90ba080><div class="hover-header" data-v-b90ba080><div class="hover-app-icon" data-v-b90ba080><img${ssrRenderAttr("src", goods.image || "/images/netflix.png")}${ssrRenderAttr("alt", goods.name || goods.title)} class="hover-icon-img" data-v-b90ba080></div></div><div class="hover-app-info" data-v-b90ba080><div class="hover-app-name" data-v-b90ba080>${ssrInterpolate(goods.name || goods.title)}</div><div class="hover-app-meta" data-v-b90ba080><div class="hover-user-avatars" data-v-b90ba080><img${ssrRenderAttr("src", _imports_4)} alt="\u7528\u62371" class="hover-avatar" data-v-b90ba080><img${ssrRenderAttr("src", _imports_6)} alt="\u7528\u62372" class="hover-avatar" data-v-b90ba080><img${ssrRenderAttr("src", _imports_8)} alt="\u7528\u62373" class="hover-avatar" data-v-b90ba080></div><span class="hover-purchased-text" data-v-b90ba080>\u8C01\u8D2D\u4E70\u8FC7</span><div class="hover-verified-icon" data-v-b90ba080><svg width="20" height="20" viewBox="0 0 20 20" fill="none" data-v-b90ba080><circle cx="10" cy="10" r="10" fill="#235CDC" data-v-b90ba080></circle><text x="10" y="14" text-anchor="middle" font-size="12" fill="white" data-v-b90ba080>?</text></svg></div></div></div><div class="hover-price-section" data-v-b90ba080><span class="hover-price-label" data-v-b90ba080>\u5238\u540E</span><span class="hover-price-number" data-v-b90ba080>${ssrInterpolate(getDisplayPrice(goods))}</span><span class="hover-price-unit" data-v-b90ba080>/${ssrInterpolate(goods.add_unit || "12\u4E2A\u6708")}</span></div><div class="hover-stats" data-v-b90ba080><span class="hover-sales" data-v-b90ba080>\u9500\u91CF: ${ssrInterpolate(goods.sales || "2.5\u4E07+")}</span><span class="hover-rating" data-v-b90ba080>\u597D\u8BC4: 98%</span></div><div class="hover-features" data-v-b90ba080><!--[-->`);
        ssrRenderList(getGoodsTags(goods), (tag, idx) => {
          _push(`<span class="${ssrRenderClass([getTagClass(tag), "hover-feature-tag"])}" data-v-b90ba080>${ssrInterpolate(tag)}</span>`);
        });
        _push(`<!--]-->`);
        if (!getGoodsTags(goods).length) {
          _push(`<span class="hover-feature-tag" data-v-b90ba080>\u70ED\u9500\u5546\u54C1</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="hover-buy-section" data-v-b90ba080><button class="hover-buy-btn" data-v-b90ba080>\u8D2D\u4E70</button></div></div></div>`);
      });
      _push(`<!--]--></div></div>`);
      if (showPayModal.value) {
        _push(ssrRenderComponent(OrderPayModal, {
          shopLogo: payGoods.value.shopLogo,
          shopName: payGoods.value.shopName,
          shopDesc: payGoods.value.shopDesc,
          orderId: payGoods.value.orderId,
          price: payGoods.value.price,
          countdown: payCountdown,
          onClose: ($event) => showPayModal.value = false,
          onTimeout: handlePayTimeout,
          onPaySuccess: handlePaySuccess
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/GoodsSection.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-b90ba080"]]);
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "FaqSection",
  __ssrInlineRender: true,
  setup(__props) {
    const expandedItems = ref([]);
    const faqList = ref([
      {
        id: 1,
        title: "\u5982\u4F55\u8D2D\u4E70\u5546\u54C1\uFF1F",
        content: "\u9009\u62E9\u60A8\u9700\u8981\u7684\u5546\u54C1\uFF0C\u70B9\u51FB\u8D2D\u4E70\u6309\u94AE\uFF0C\u9009\u62E9\u652F\u4ED8\u65B9\u5F0F\u5B8C\u6210\u652F\u4ED8\u5373\u53EF\u3002\u652F\u4ED8\u6210\u529F\u540E\uFF0C\u7CFB\u7EDF\u4F1A\u81EA\u52A8\u53D1\u9001CDK\u5230\u60A8\u7684\u90AE\u7BB1\u6216\u8D26\u6237\u4E2D\u3002"
      },
      {
        id: 2,
        title: "\u652F\u4ED8\u540E\u591A\u4E45\u80FD\u6536\u5230CDK\uFF1F",
        content: '\u652F\u4ED8\u6210\u529F\u540E\uFF0C\u7CFB\u7EDF\u4F1A\u7ACB\u5373\u81EA\u52A8\u53D1\u8D27\uFF0C\u60A8\u53EF\u4EE5\u5728"\u6211\u7684\u8BA2\u5355"\u4E2D\u67E5\u770BCDK\u4FE1\u606F\u3002\u5982\u9047\u7279\u6B8A\u60C5\u51B5\uFF0C\u8BF7\u8054\u7CFB\u5728\u7EBF\u5BA2\u670D\u5904\u7406\u3002'
      },
      {
        id: 3,
        title: "\u652F\u6301\u54EA\u4E9B\u652F\u4ED8\u65B9\u5F0F\uFF1F",
        content: "\u6211\u4EEC\u652F\u6301\u652F\u4ED8\u5B9D\u3001\u5FAE\u4FE1\u652F\u4ED8\u3001\u94F6\u884C\u5361\u7B49\u591A\u79CD\u652F\u4ED8\u65B9\u5F0F\uFF0C\u60A8\u53EF\u4EE5\u9009\u62E9\u6700\u65B9\u4FBF\u7684\u65B9\u5F0F\u8FDB\u884C\u652F\u4ED8\u3002"
      },
      {
        id: 4,
        title: "CDK\u5982\u4F55\u4F7F\u7528\uFF1F",
        content: "\u83B7\u5F97CDK\u540E\uFF0C\u8BF7\u5728\u5BF9\u5E94\u5E73\u53F0\u7684\u5151\u6362\u9875\u9762\u8F93\u5165CDK\u7801\u8FDB\u884C\u5151\u6362\u3002\u5177\u4F53\u64CD\u4F5C\u6B65\u9AA4\u8BF7\u53C2\u8003\u5546\u54C1\u8BE6\u60C5\u9875\u7684\u4F7F\u7528\u8BF4\u660E\u3002"
      },
      {
        id: 5,
        title: "\u53EF\u4EE5\u9000\u6B3E\u5417\uFF1F",
        content: "\u865A\u62DF\u5546\u54C1\u4E00\u7ECF\u552E\u51FA\uFF0C\u5982\u65E0\u8D28\u91CF\u95EE\u9898\u4E0D\u652F\u6301\u9000\u6B3E\u3002\u5982\u9047\u5230CDK\u65E0\u6CD5\u4F7F\u7528\u7B49\u95EE\u9898\uFF0C\u8BF7\u53CA\u65F6\u8054\u7CFB\u5BA2\u670D\uFF0C\u6211\u4EEC\u4F1A\u4E3A\u60A8\u5904\u7406\u3002"
      },
      {
        id: 6,
        title: "\u5982\u4F55\u8054\u7CFB\u5BA2\u670D\uFF1F",
        content: '\u60A8\u53EF\u4EE5\u70B9\u51FB\u9875\u9762\u53F3\u4E0B\u89D2\u7684\u5BA2\u670D\u6309\u94AE\uFF0C\u6216\u5728\u5BFC\u822A\u680F\u70B9\u51FB"\u5BA2\u670D"\u8FDB\u5165\u5728\u7EBF\u5BA2\u670D\u7CFB\u7EDF\uFF0C\u6211\u4EEC\u7684\u5BA2\u670D\u56E2\u961F\u4F1A\u53CA\u65F6\u4E3A\u60A8\u89E3\u7B54\u3002'
      }
    ]);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "faq-section" }, _attrs))} data-v-67b25a83><div class="faq-container" data-v-67b25a83><div class="section-header" data-v-67b25a83><h2 class="section-title" data-v-67b25a83>\u5E38\u89C1\u95EE\u9898</h2><p class="section-subtitle" data-v-67b25a83>\u5FEB\u901F\u4E86\u89E3\u6211\u4EEC\u7684\u670D\u52A1</p></div><div class="faq-grid" data-v-67b25a83><!--[-->`);
      ssrRenderList(faqList.value, (item, index2) => {
        _push(`<div class="faq-card" data-v-67b25a83><div class="faq-question" data-v-67b25a83><h3 class="question-text" data-v-67b25a83>${ssrInterpolate(item.title)}</h3><span class="${ssrRenderClass([{ "expanded": expandedItems.value.includes(index2) }, "toggle-icon"])}" data-v-67b25a83><svg width="20" height="20" viewBox="0 0 20 20" fill="none" data-v-67b25a83><path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-67b25a83></path></svg></span></div>`);
        if (expandedItems.value.includes(index2)) {
          _push(`<div class="faq-answer" data-v-67b25a83><p data-v-67b25a83>${ssrInterpolate(item.content || item.answer)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]--></div></div></section>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/FaqSection.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-67b25a83"]]);
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "AboutSection",
  __ssrInlineRender: true,
  setup(__props) {
    const cards = [
      {
        icon: "/images/about1.png",
        title: "\u5927\u56E2\u961F\u5F00\u53D1",
        desc: "\u6240\u6709\u5546\u54C1\u5747\u4E3A\u56E2\u961F\u5F00\u53D1\uFF0C\u54C1\u8D28\u4FDD\u969C"
      },
      {
        icon: "/images/about2.png",
        title: "\u4EBA\u5DE5\u5BA2\u670D\u670D\u52A1",
        desc: "\u63D0\u4F9B\u5B8C\u5584\u7684\u552E\u540E\u670D\u52A1\uFF0C\u8D2D\u7269\u65E0\u5FE7"
      },
      {
        icon: "/images/about3.png",
        title: "\u5927\u5E73\u53F0\u66F4\u653E\u5FC3",
        desc: "\u5341\u5E74\u5F00\u53D1\u7ECF\u9A8C\uFF0C\u670D\u52A1\u5343\u4E07\u7528\u6237"
      },
      {
        icon: "/images/about4.png",
        title: "\u5168\u7F51\u77E9\u9635",
        desc: "\u8986\u76D6\u5168\u56FD\u5E73\u53F0\uFF0C\u5FEB\u901F\u9001\u8FBE"
      }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "about-section" }, _attrs))} data-v-ca548900><div class="about-bg" data-v-ca548900><div class="about-title" data-v-ca548900>\u5173\u4E8E\u6211\u4EEC</div><div class="about-subtitle" data-v-ca548900>\u63D0\u4F9B\u9AD8\u54C1\u8D28\u4F18\u8D28\u670D\u52A1</div><div class="about-cards" data-v-ca548900><!--[-->`);
      ssrRenderList(cards, (item) => {
        _push(`<div class="about-card" data-v-ca548900><div class="about-icon" data-v-ca548900><img${ssrRenderAttr("src", item.icon)} alt="icon" width="48" height="48" data-v-ca548900></div><div class="about-card-title" data-v-ca548900>${ssrInterpolate(item.title)}</div><div class="about-card-desc" data-v-ca548900>${ssrInterpolate(item.desc)}</div></div>`);
      });
      _push(`<!--]--></div><button class="about-more-btn" data-v-ca548900>\u67E5\u770B\u66F4\u591A \u2192</button></div></section>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AboutSection.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_3 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-ca548900"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "\u51E1\u56FE\u62C9 - \u4F18\u8D28\u5546\u54C1\u5E73\u53F0",
      meta: [
        { name: "description", content: "\u51E1\u56FE\u62C9\u63D0\u4F9B\u4F18\u8D28\u5546\u54C1\u548C\u670D\u52A1\uFF0C\u7CBE\u9009\u5404\u7C7B\u5546\u54C1\uFF0C\u786E\u4FDD\u54C1\u8D28\u4E0E\u4EF7\u683C\u7684\u5B8C\u7F8E\u5E73\u8861\u3002" },
        { name: "keywords", content: "\u51E1\u56FE\u62C9,\u5546\u54C1,\u8D2D\u7269,\u7535\u5546,\u4F18\u8D28\u5546\u54C1" },
        { property: "og:title", content: "\u51E1\u56FE\u62C9 - \u4F18\u8D28\u5546\u54C1\u5E73\u53F0" },
        { property: "og:description", content: "\u51E1\u56FE\u62C9\u63D0\u4F9B\u4F18\u8D28\u5546\u54C1\u548C\u670D\u52A1\uFF0C\u7CBE\u9009\u5404\u7C7B\u5546\u54C1\uFF0C\u786E\u4FDD\u54C1\u8D28\u4E0E\u4EF7\u683C\u7684\u5B8C\u7F8E\u5E73\u8861\u3002" },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://fantula.com" }
      ]
    });
    const banners = ref([
      {
        id: 1,
        image: "/images/banner.png",
        link: "",
        title: "\u51E1\u56FE\u62C9 - \u4F18\u8D28\u5546\u54C1\u5E73\u53F0"
      }
    ]);
    const hotGoods = ref([]);
    useModalStore();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BannerSection = __nuxt_component_0;
      const _component_GoodsSection = __nuxt_component_1;
      const _component_FaqSection = __nuxt_component_2;
      const _component_AboutSection = __nuxt_component_3;
      const _component_AppFooter = __nuxt_component_1$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "home-page" }, _attrs))} data-v-5e751bbb>`);
      _push(ssrRenderComponent(__nuxt_component_0$1, null, null, _parent));
      _push(ssrRenderComponent(_component_BannerSection, { banners: banners.value }, null, _parent));
      _push(ssrRenderComponent(_component_GoodsSection, { goodsList: hotGoods.value }, null, _parent));
      _push(ssrRenderComponent(_component_FaqSection, null, null, _parent));
      _push(ssrRenderComponent(_component_AboutSection, null, null, _parent));
      _push(ssrRenderComponent(_component_AppFooter, null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-5e751bbb"]]);

export { index as default };
//# sourceMappingURL=index-Cpdg3bcM.mjs.map
