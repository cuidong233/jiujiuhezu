import { _ as __nuxt_component_0, a as __nuxt_component_1 } from './AppFooter-DftAiZQA.mjs';
import { _ as _export_sfc, f as useModalStore, i as useRouter, a as __nuxt_component_0$1, h as __nuxt_component_2 } from './server.mjs';
import { defineComponent, ref, computed, mergeProps, withCtx, createVNode, toDisplayString, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrRenderStyle, ssrRenderAttr, ssrInterpolate } from 'vue/server-renderer';
import { u as useHead } from './v3-CddZA8nI.mjs';
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
import './virtual_public-rJCVlDvA.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "community",
  __ssrInlineRender: true,
  setup(__props) {
    const modal = useModalStore();
    const activeTag = ref("all");
    const categoryTags = [
      { key: "\u8BBE\u5907\u8BC4\u6D4B", label: "\u8BBE\u5907\u8BC4\u6D4B", icon: "\u{1F3E0}", color: "#FF7A7A" },
      { key: "\u6559\u7A0B\u6307\u5357", label: "\u6559\u7A0B\u6307\u5357", icon: "\u{1F4DD}", color: "#4CAF50" },
      { key: "\u5BB6\u5C45\u5F71\u9662", label: "\u5BB6\u5C45\u5F71\u9662", icon: "\u{1F527}", color: "#2196F3" },
      { key: "\u6D41\u5A92\u4F53", label: "\u6D41\u5A92\u4F53", icon: "\u{1F4F1}", color: "#FF9800" },
      { key: "\u6280\u672F\u6587\u7AE0", label: "\u6280\u672F\u6587\u7AE0", icon: "\u{1F512}", color: "#9C27B0" }
    ];
    const articles = ref([]);
    ref(false);
    const filteredArticles = computed(() => {
      if (activeTag.value === "all") {
        return articles.value;
      }
      return articles.value.filter((article) => article.category === activeTag.value);
    });
    useRouter();
    useHead({
      title: "\u793E\u533A\u5E2E\u52A9 - \u51E1\u56FE\u62C9",
      meta: [
        { name: "description", content: "\u51E1\u56FE\u62C9\u793E\u533A\u5E2E\u52A9\u4E2D\u5FC3\uFF0C\u4E3A\u60A8\u63D0\u4F9B\u5168\u9762\u7684\u4F7F\u7528\u6307\u5357\u548C\u5BA2\u670D\u652F\u6301\u3002" }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AppHeader = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_AppFooter = __nuxt_component_1;
      const _component_LoginRegisterModal = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "community-page" }, _attrs))} data-v-20a289c6>`);
      _push(ssrRenderComponent(_component_AppHeader, null, null, _parent));
      _push(`<div class="page-content" data-v-20a289c6><div class="category-tags" data-v-20a289c6><!--[-->`);
      ssrRenderList(categoryTags, (tag) => {
        _push(`<button class="${ssrRenderClass(["tag-btn", { active: activeTag.value === tag.key && activeTag.value !== "all" }])}" style="${ssrRenderStyle({ background: activeTag.value === tag.key ? tag.color : "#fff", color: activeTag.value === tag.key ? "#fff" : tag.color, border: `1.5px solid ${tag.color}` })}"${ssrRenderAttr("title", activeTag.value === tag.key && activeTag.value !== "all" ? "\u518D\u6B21\u70B9\u51FB\u8FD4\u56DE\u6240\u6709\u6587\u7AE0" : `\u67E5\u770B${tag.label}\u5206\u7C7B\u6587\u7AE0`)} data-v-20a289c6><span class="tag-icon" data-v-20a289c6>${ssrInterpolate(tag.icon)}</span> ${ssrInterpolate(tag.label)} `);
        if (activeTag.value === tag.key && activeTag.value !== "all") {
          _push(`<span class="reset-hint" data-v-20a289c6>\xD7</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</button>`);
      });
      _push(`<!--]--></div><div class="articles-grid" data-v-20a289c6><!--[-->`);
      ssrRenderList(filteredArticles.value, (article) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: article.id,
          to: `/article/${article.id}`,
          class: "article-card"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="article-image" data-v-20a289c6${_scopeId}><img${ssrRenderAttr("src", article.image)}${ssrRenderAttr("alt", article.title)} data-v-20a289c6${_scopeId}></div><div class="article-content" data-v-20a289c6${_scopeId}><h3 class="article-title" data-v-20a289c6${_scopeId}>${ssrInterpolate(article.title)}</h3><p class="article-description" data-v-20a289c6${_scopeId}>${ssrInterpolate(article.description)}</p><div class="article-meta" data-v-20a289c6${_scopeId}><span class="article-date" data-v-20a289c6${_scopeId}>${ssrInterpolate(article.date)}</span><div class="article-author" data-v-20a289c6${_scopeId}><span class="author-avatar" data-v-20a289c6${_scopeId}>${ssrInterpolate(article.author.avatar)}</span><span class="author-name" data-v-20a289c6${_scopeId}>${ssrInterpolate(article.author.name)}</span></div></div></div>`);
            } else {
              return [
                createVNode("div", { class: "article-image" }, [
                  createVNode("img", {
                    src: article.image,
                    alt: article.title
                  }, null, 8, ["src", "alt"])
                ]),
                createVNode("div", { class: "article-content" }, [
                  createVNode("h3", { class: "article-title" }, toDisplayString(article.title), 1),
                  createVNode("p", { class: "article-description" }, toDisplayString(article.description), 1),
                  createVNode("div", { class: "article-meta" }, [
                    createVNode("span", { class: "article-date" }, toDisplayString(article.date), 1),
                    createVNode("div", { class: "article-author" }, [
                      createVNode("span", { class: "author-avatar" }, toDisplayString(article.author.avatar), 1),
                      createVNode("span", { class: "author-name" }, toDisplayString(article.author.name), 1)
                    ])
                  ])
                ])
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div><div class="publish-section" data-v-20a289c6><button class="publish-btn" data-v-20a289c6><span class="publish-icon" data-v-20a289c6>+</span> \u53D1\u5E03\u6587\u7AE0 </button></div></div>`);
      _push(ssrRenderComponent(_component_AppFooter, null, null, _parent));
      _push(ssrRenderComponent(_component_LoginRegisterModal, {
        visible: unref(modal).showLogin,
        onClose: ($event) => unref(modal).closeLogin()
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/community.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const community = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-20a289c6"]]);

export { community as default };
//# sourceMappingURL=community-DBtPBfB4.mjs.map
