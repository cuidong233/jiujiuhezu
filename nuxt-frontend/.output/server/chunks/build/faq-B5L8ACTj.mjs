import { _ as __nuxt_component_0, a as __nuxt_component_1 } from './AppFooter-DftAiZQA.mjs';
import { defineComponent, ref, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrRenderList, ssrRenderClass, ssrInterpolate } from 'vue/server-renderer';
import { p as publicAssetsURL } from '../nitro/nitro.mjs';
import { u as useHead } from './v3-CddZA8nI.mjs';
import { _ as _export_sfc } from './server.mjs';
import 'vue-router';
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
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
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

const _imports_0 = publicAssetsURL("/images/wenhao.png");
const _imports_1 = publicAssetsURL("/images/kefu.png");
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "faq",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "\u5E2E\u52A9\u4E2D\u5FC3 - \u51E1\u56FE\u62C9",
      meta: [
        { name: "description", content: "\u51E1\u56FE\u62C9\u5E2E\u52A9\u4E2D\u5FC3\uFF0C\u63D0\u4F9B\u5E38\u89C1\u95EE\u9898\u89E3\u7B54\uFF0C\u5E2E\u52A9\u60A8\u5FEB\u901F\u4E86\u89E3\u5E73\u53F0\u4F7F\u7528\u65B9\u6CD5\u548C\u76F8\u5173\u653F\u7B56\u3002" },
        { name: "keywords", content: "\u51E1\u56FE\u62C9,\u5E2E\u52A9\u4E2D\u5FC3,\u5E38\u89C1\u95EE\u9898,FAQ,\u5E2E\u52A9,\u5BA2\u670D,\u4F7F\u7528\u6307\u5357" }
      ]
    });
    const searchQuery = ref("");
    const activeCategory = ref("all");
    const expandedItems = ref([]);
    const categories = ref([]);
    const faqs = ref([]);
    const filteredFaqs = computed(() => {
      let result = faqs.value;
      if (activeCategory.value !== "all") {
        result = result.filter((faq2) => faq2.categoryName === activeCategory.value);
      }
      if (searchQuery.value.trim()) {
        result = result.filter(
          (faq2) => faq2.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || faq2.content && faq2.content.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
      }
      return result;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AppHeader = __nuxt_component_0;
      const _component_AppFooter = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "faq-page" }, _attrs))} data-v-d0f47d06>`);
      _push(ssrRenderComponent(_component_AppHeader, null, null, _parent));
      _push(`<div class="page-content" data-v-d0f47d06><div class="content-container" data-v-d0f47d06><div class="header-section" data-v-d0f47d06><h1 class="main-title" data-v-d0f47d06>\u5E2E\u52A9\u4E2D\u5FC3</h1><p class="main-subtitle" data-v-d0f47d06>\u6211\u4EEC\u6574\u7406\u4E86\u7528\u6237\u6700\u5E38\u89C1\u7684\u95EE\u9898\uFF0C\u5E2E\u52A9\u60A8\u5FEB\u901F\u627E\u5230\u7B54\u6848</p></div><div class="search-section" data-v-d0f47d06><h3 class="search-title" data-v-d0f47d06>\u6709\u95EE\u9898\uFF1F\u5FEB\u901F\u641C\u7D22\u89E3\u7B54</h3><div class="search-box" data-v-d0f47d06><input${ssrRenderAttr("value", searchQuery.value)} type="text" placeholder="\u8F93\u5165\u60A8\u7684\u95EE\u9898\u5173\u952E\u8BCD..." class="search-input" data-v-d0f47d06><button class="search-btn" data-v-d0f47d06>\u641C\u7D22</button></div></div><div class="category-section" data-v-d0f47d06><!--[-->`);
      ssrRenderList(categories.value, (category) => {
        _push(`<button class="${ssrRenderClass(["category-btn", { active: activeCategory.value === category.key }])}" data-v-d0f47d06>${ssrInterpolate(category.label)}</button>`);
      });
      _push(`<!--]--></div><div class="faq-header-section" data-v-d0f47d06><div class="faq-header" data-v-d0f47d06><div class="faq-icon" data-v-d0f47d06><img${ssrRenderAttr("src", _imports_0)} alt="\u95EE\u53F7" data-v-d0f47d06></div><h3 class="faq-title" data-v-d0f47d06>\u5E38\u89C1\u95EE\u9898\u89E3\u7B54</h3></div></div><div class="faq-list-section" data-v-d0f47d06><div class="faq-list" data-v-d0f47d06><!--[-->`);
      ssrRenderList(filteredFaqs.value, (faq2, index) => {
        _push(`<div class="faq-item" data-v-d0f47d06><div class="faq-question" data-v-d0f47d06>${ssrInterpolate(faq2.title)}</div>`);
        if (faq2.content && expandedItems.value.includes(index)) {
          _push(`<div class="faq-answer" data-v-d0f47d06>${ssrInterpolate(faq2.content)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]--></div></div><div class="contact-section" data-v-d0f47d06><h3 class="contact-title" data-v-d0f47d06>\u6CA1\u6709\u627E\u5230\u60A8\u7684\u95EE\u9898\uFF1F</h3><p class="contact-desc" data-v-d0f47d06>\u6211\u4EEC\u7684\u5BA2\u670D\u56E2\u961F\u968F\u65F6\u4E3A\u60A8\u63D0\u4F9B\u5E2E\u52A9\uFF0C\u5E73\u5747\u54CD\u5E94\u65F6\u95F4\u4E0D\u8D85\u8FC73\u5206\u949F\uFF0C\u89E3\u51B3\u7387\u9AD8\u8FBE99.8%!</p><button class="contact-btn" data-v-d0f47d06><span class="contact-icon" data-v-d0f47d06><img${ssrRenderAttr("src", _imports_1)} alt="\u5BA2\u670D" data-v-d0f47d06></span> \u8054\u7CFB\u5728\u7EBF\u5BA2\u670D </button></div></div></div>`);
      _push(ssrRenderComponent(_component_AppFooter, null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/faq.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const faq = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-d0f47d06"]]);

export { faq as default };
//# sourceMappingURL=faq-B5L8ACTj.mjs.map
