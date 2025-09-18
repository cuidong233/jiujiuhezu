import { _ as __nuxt_component_0, a as __nuxt_component_1 } from './AppFooter-DftAiZQA.mjs';
import { _ as _export_sfc, f as useModalStore, j as useRoute, h as __nuxt_component_2 } from './server.mjs';
import { defineComponent, ref, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr } from 'vue/server-renderer';
import { p as publicAssetsURL } from '../nitro/nitro.mjs';
import { _ as _imports_4, a as _imports_6, b as _imports_8 } from './virtual_public-xbw59hvI.mjs';
import { u as useHead } from './v3-CddZA8nI.mjs';
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

const _imports_0 = publicAssetsURL("/images/tv-box-interface.jpg");
const _imports_1 = publicAssetsURL("/images/netflix-apps-interface.jpg");
const _imports_2 = publicAssetsURL("/images/device-setup-config.jpg");
const _imports_3 = publicAssetsURL("/images/related-1.jpg");
const _imports_5 = publicAssetsURL("/images/related-2.jpg");
const _imports_7 = publicAssetsURL("/images/related-3.jpg");
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    const modal = useModalStore();
    const route = useRoute();
    const articleId = route.params.id;
    const currentArticle = ref(null);
    const loading = ref(true);
    ref([]);
    const pageTitle = computed(() => currentArticle.value ? currentArticle.value.title : "\u6587\u7AE0\u8BE6\u60C5");
    useHead({
      title: computed(() => `${pageTitle.value} - \u51E1\u56FE\u62C9`),
      meta: computed(() => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
        return [
          { name: "description", content: ((_a = currentArticle.value) == null ? void 0 : _a.description) || "\u51E1\u56FE\u62C9\u6587\u7AE0\u8BE6\u60C5\u9875\u9762" },
          { name: "keywords", content: currentArticle.value ? `${currentArticle.value.title},\u6D41\u5A92\u4F53,\u6559\u7A0B,\u6280\u672F\u652F\u6301,${((_b = currentArticle.value.author) == null ? void 0 : _b.name) || ""}` : "\u51E1\u56FE\u62C9,\u6587\u7AE0" },
          { name: "author", content: ((_d = (_c = currentArticle.value) == null ? void 0 : _c.author) == null ? void 0 : _d.name) || "\u51E1\u56FE\u62C9" },
          { name: "robots", content: "index, follow" },
          { name: "article:published_time", content: ((_e = currentArticle.value) == null ? void 0 : _e.date) || "" },
          { name: "article:author", content: ((_g = (_f = currentArticle.value) == null ? void 0 : _f.author) == null ? void 0 : _g.name) || "" },
          // Open Graph
          { property: "og:title", content: `${pageTitle.value} - \u51E1\u56FE\u62C9` },
          { property: "og:description", content: ((_h = currentArticle.value) == null ? void 0 : _h.description) || "\u51E1\u56FE\u62C9\u6587\u7AE0\u8BE6\u60C5\u9875\u9762" },
          { property: "og:type", content: "article" },
          { property: "og:image", content: ((_i = currentArticle.value) == null ? void 0 : _i.image) || "/images/default-og.jpg" },
          { property: "og:url", content: `https://yourdomain.com/article/${articleId}` },
          { property: "article:published_time", content: ((_j = currentArticle.value) == null ? void 0 : _j.date) || "" },
          { property: "article:author", content: ((_l = (_k = currentArticle.value) == null ? void 0 : _k.author) == null ? void 0 : _l.name) || "" },
          { property: "article:section", content: ((_m = currentArticle.value) == null ? void 0 : _m.category) || "" },
          // Twitter Card
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:title", content: `${pageTitle.value} - \u51E1\u56FE\u62C9` },
          { name: "twitter:description", content: ((_n = currentArticle.value) == null ? void 0 : _n.description) || "\u51E1\u56FE\u62C9\u6587\u7AE0\u8BE6\u60C5\u9875\u9762" },
          { name: "twitter:image", content: ((_o = currentArticle.value) == null ? void 0 : _o.image) || "/images/default-og.jpg" }
        ];
      }),
      link: [
        { rel: "canonical", href: `https://yourdomain.com/article/${articleId}` }
      ],
      script: computed(() => {
        var _a;
        return currentArticle.value ? [
          {
            type: "application/ld+json",
            innerHTML: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": currentArticle.value.title,
              "description": currentArticle.value.description,
              "image": [currentArticle.value.image],
              "datePublished": currentArticle.value.date,
              "dateModified": currentArticle.value.date,
              "author": {
                "@type": "Person",
                "name": ((_a = currentArticle.value.author) == null ? void 0 : _a.name) || "\u7BA1\u7406\u5458"
              },
              "publisher": {
                "@type": "Organization",
                "name": "\u51E1\u56FE\u62C9",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://yourdomain.com/images/logo.png"
                }
              },
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `https://yourdomain.com/article/${articleId}`
              }
            })
          }
        ] : [];
      })
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_AppHeader = __nuxt_component_0;
      const _component_AppFooter = __nuxt_component_1;
      const _component_LoginRegisterModal = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "article-detail-page" }, _attrs))} data-v-47b5ad52>`);
      _push(ssrRenderComponent(_component_AppHeader, null, null, _parent));
      _push(`<div class="page-content" data-v-47b5ad52><div class="article-container" data-v-47b5ad52>`);
      if (loading.value) {
        _push(`<div class="loading-state" data-v-47b5ad52><div class="loading-spinner" data-v-47b5ad52></div><p data-v-47b5ad52>\u52A0\u8F7D\u6587\u7AE0\u4E2D...</p></div>`);
      } else if (currentArticle.value) {
        _push(`<div class="article-content" data-v-47b5ad52><div class="article-category" data-v-47b5ad52><span class="category-tag" data-v-47b5ad52>${ssrInterpolate(currentArticle.value.category)}</span></div><h1 class="article-title" data-v-47b5ad52>`);
        if (currentArticle.value.subtitle) {
          _push(`<div class="title-line-1" data-v-47b5ad52>${ssrInterpolate(currentArticle.value.title)}</div>`);
        } else {
          _push(`<!---->`);
        }
        if (currentArticle.value.subtitle) {
          _push(`<div class="title-line-2" data-v-47b5ad52>${ssrInterpolate(currentArticle.value.subtitle)}</div>`);
        } else {
          _push(`<div data-v-47b5ad52>${ssrInterpolate(currentArticle.value.title)}</div>`);
        }
        _push(`</h1><div class="article-meta" data-v-47b5ad52><div class="author-section" data-v-47b5ad52><img${ssrRenderAttr("src", currentArticle.value.author.avatar)}${ssrRenderAttr("alt", currentArticle.value.author.name)} class="author-avatar" data-v-47b5ad52><div class="author-details" data-v-47b5ad52><div class="author-info" data-v-47b5ad52><span class="author-name" data-v-47b5ad52>${ssrInterpolate(currentArticle.value.author.name)}</span></div><div class="meta-info" data-v-47b5ad52><span class="article-date" data-v-47b5ad52>${ssrInterpolate(currentArticle.value.date)}</span><span class="meta-divider" data-v-47b5ad52>\u2022</span><span class="read-time" data-v-47b5ad52>\u9605\u8BFB\u65F6\u95F4 ${ssrInterpolate(currentArticle.value.readTime)}</span></div></div></div></div><div class="content-container" data-v-47b5ad52>`);
        if (currentArticle.value.content) {
          _push(`<div class="article-body" data-v-47b5ad52>${(_a = currentArticle.value.content) != null ? _a : ""}</div>`);
        } else {
          _push(`<div class="article-body" data-v-47b5ad52><div class="intro-section" data-v-47b5ad52><p class="content-text" data-v-47b5ad52>${ssrInterpolate(currentArticle.value.description || "\u6587\u7AE0\u5185\u5BB9\u52A0\u8F7D\u4E2D...")}</p></div><div class="tip-notice" data-v-47b5ad52><p data-v-47b5ad52><strong data-v-47b5ad52>\u63D0\u793A\uFF1A</strong>\u672C\u6587\u9002\u7528\u4E8E\u5404\u79CD\u4E3B\u6D41\u7535\u89C6\u76D2\u5B50\uFF08\u5982NVIDIA Shield TV\u3001Apple TV\u3001\u5C0F\u7C73\u76D2\u5B50\u56FD\u9645\u7248\u7B49\uFF09\uFF0C\u4E5F\u9002\u7528\u4E8E\u90E8\u5206\u667A\u80FD\u7535\u89C6\u3002\u6559\u7A0B\u4E2D\u4F7F\u7528\u7684\u8BBE\u5907\u4E3ANVIDIA Shield TV Pro 2019\u3002</p></div><div class="section-block" data-v-47b5ad52><h2 class="section-title" data-v-47b5ad52>\u51C6\u5907\u5DE5\u4F5C</h2><p class="content-text" data-v-47b5ad52>\u5728\u5F00\u59CB\u4E4B\u524D\uFF0C\u8BF7\u786E\u4FDD\u60A8\u5DF2\u51C6\u5907\u597D\u4EE5\u4E0B\u5185\u5BB9\u3002\u8FD9\u4E9B\u662F\u89C2\u770B\u5948\u98DE4K\u5185\u5BB9\u7684\u57FA\u672C\u8981\u6C42\uFF1A</p><div class="requirements-grid" data-v-47b5ad52><div class="requirement-column" data-v-47b5ad52><h3 data-v-47b5ad52>\u786C\u4EF6\u8981\u6C42</h3><ul data-v-47b5ad52><li data-v-47b5ad52>\u652F\u63014K\u548CNetflix\u8BA4\u8BC1\u7684\u7535\u89C6\u76D2\u5B50</li><li data-v-47b5ad52>4K HDR\u7535\u89C6\uFF08HDMI 2.0\u63A5\u53E3\uFF09</li><li data-v-47b5ad52>\u9AD8\u901FHDMI 2.0\u7EBF\u7F06\uFF0818Gbps\uFF09</li><li data-v-47b5ad52>\u652F\u63015.1\u58F0\u9053\u6216\u675C\u6BD4\u5168\u666F\u58F0\u7684\u97F3\u54CD\u7CFB\u7EDF</li></ul></div><div class="requirement-column" data-v-47b5ad52><h3 data-v-47b5ad52>\u7F51\u7EDC\u8981\u6C42</h3><ul data-v-47b5ad52><li data-v-47b5ad52>\u7A33\u5B9A\u7684\u5BBD\u5E26\u7F51\u7EDC\uFF08\u5EFA\u8BAE100Mbps\u4EE5\u4E0A\uFF09</li><li data-v-47b5ad52>\u652F\u63015GHz\u9891\u6BB5\u7684\u8DEF\u7531\u5668</li><li data-v-47b5ad52>\u5948\u98DE\u652F\u6301\u7684DNS\u670D\u52A1\uFF08\u53EF\u9009\uFF09</li></ul></div><div class="requirement-column" data-v-47b5ad52><h3 data-v-47b5ad52>\u8D26\u53F7\u8981\u6C42</h3><ul data-v-47b5ad52><li data-v-47b5ad52>Netflix\u9AD8\u7EA7\u4F1A\u5458\u8D26\u53F7\uFF08\u652F\u63014K\uFF09</li><li data-v-47b5ad52>\u652F\u6301\u89E3\u9501\u5948\u98DE\u7684\u7F51\u7EDC\u73AF\u5883</li><li data-v-47b5ad52>\u652F\u4ED8\u65B9\u5F0F\uFF08\u4FE1\u7528\u5361/PayPal\uFF09</li></ul></div></div></div><div class="section-block" data-v-47b5ad52><h2 class="section-title" data-v-47b5ad52>\u8BE6\u7EC6\u6B65\u9AA4</h2><div class="step-section" data-v-47b5ad52><div class="step-header" data-v-47b5ad52><span class="step-number" data-v-47b5ad52>1</span><h3 class="step-title" data-v-47b5ad52>\u9009\u62E9\u5408\u9002\u7684\u7535\u89C6\u76D2\u5B50</h3></div><p class="content-text" data-v-47b5ad52> \u5E76\u975E\u6240\u6709\u7535\u89C6\u76D2\u5B50\u90FD\u652F\u6301\u5948\u98DE4K\u64AD\u653E\u3002\u4EE5\u4E0B\u662F\u7ECF\u8FC7\u6D4B\u8BD5\u786E\u5B9E\u652F\u6301\u5948\u98DE4K\u7684\u8BBE\u5907\uFF1A </p><div class="device-list" data-v-47b5ad52><div class="device-item" data-v-47b5ad52><strong data-v-47b5ad52>NVIDIA Shield TV Pro (2019)</strong> - \u6700\u4F73\u6027\u80FD\uFF0C\u652F\u6301\u675C\u6BD4\u89C6\u754C\u548C\u5168\u666F\u58F0 </div><div class="device-item" data-v-47b5ad52><strong data-v-47b5ad52>Apple TV 4K (2022)</strong> - \u4F18\u79C0\u7684\u751F\u6001\u7CFB\u7EDF\uFF0C\u6D41\u7545\u4F53\u9A8C </div><div class="device-item" data-v-47b5ad52><strong data-v-47b5ad52>\u5C0F\u7C73\u76D2\u5B50\u56FD\u9645\u7248</strong> - \u6027\u4EF7\u6BD4\u4E4B\u9009\uFF0C\u652F\u63014K\u4F46\u4E0D\u652F\u6301\u675C\u6BD4\u89C6\u754C </div><div class="device-item" data-v-47b5ad52><strong data-v-47b5ad52>Chromecast with Google TV</strong> - \u5C0F\u5DE7\u4FBF\u643A\uFF0C\u652F\u63014K HDR </div></div><div class="device-showcase" data-v-47b5ad52><img${ssrRenderAttr("src", _imports_0)} alt="\u667A\u80FD\u7535\u89C6\u76D2\u5B50\u754C\u9762\u5C55\u793A" class="showcase-image" data-v-47b5ad52></div><div class="warning-notice" data-v-47b5ad52><p data-v-47b5ad52><strong data-v-47b5ad52>\u6CE8\u610F\uFF1A</strong>\u56FD\u5185\u7248\u7535\u89C6\u76D2\u5B50\uFF08\u5982\u5929\u732B\u9B54\u76D2\u3001\u5F53\u8D1D\u76D2\u5B50\uFF09\u901A\u5E38\u65E0\u6CD5\u76F4\u63A5\u5B89\u88C5\u5B98\u65B9\u5948\u98DE\u5E94\u7528\uFF0C\u5373\u4FBF\u5B89\u88C5\u4E5F\u65E0\u6CD5\u64AD\u653E4K\u5185\u5BB9\u3002</p></div></div><div class="step-section" data-v-47b5ad52><div class="step-header" data-v-47b5ad52><span class="step-number" data-v-47b5ad52>2</span><h3 class="step-title" data-v-47b5ad52>\u914D\u7F6E\u7F51\u7EDC\u73AF\u5883</h3></div><p class="content-text" data-v-47b5ad52> \u7531\u4E8E\u5948\u98DE\u5BF9\u5730\u533A\u5185\u5BB9\u7684\u9650\u5236\uFF0C\u6211\u4EEC\u9700\u8981\u914D\u7F6E\u6B63\u786E\u7684\u7F51\u7EDC\u73AF\u5883\uFF1A </p><div class="network-steps" data-v-47b5ad52><div class="network-step" data-v-47b5ad52> \u4F7F\u7528\u652F\u6301\u5948\u98DE\u7684\u7F51\u7EDC\u670D\u52A1\uFF08\u786E\u4FDD\u53EF\u4EE5\u8BBF\u95EE\u5948\u98DE\u5E93\uFF09 </div><div class="network-step" data-v-47b5ad52> \u5728\u8DEF\u7531\u5668\u6216\u7535\u89C6\u76D2\u5B50\u8BBE\u7F6E\u4E2D\u914D\u7F6E\u7F51\u7EDC\u53C2\u6570 </div><div class="network-step" data-v-47b5ad52> \u6D4B\u8BD5\u7F51\u7EDC\u901F\u5EA6\uFF08\u5948\u98DE4K\u9700\u8981\u81F3\u5C1125Mbps\u7A33\u5B9A\u901F\u5EA6\uFF09 </div></div><div class="tip-box" data-v-47b5ad52><h4 data-v-47b5ad52>\u7F51\u7EDC\u4F18\u5316\u6280\u5DE7\uFF1A</h4><p data-v-47b5ad52>\u4F7F\u7528\u7F51\u7EBF\u8FDE\u63A5\u4EE3\u66FFWiFi\u53EF\u4EE5\u83B7\u5F97\u66F4\u7A33\u5B9A\u7684\u901F\u5EA6\u3002\u5982\u679C\u5FC5\u987B\u4F7F\u7528WiFi\uFF0C\u8BF7\u786E\u4FDD\u4F7F\u75285GHz\u9891\u6BB5\u5E76\u9760\u8FD1\u8DEF\u7531\u5668\u3002</p></div></div><div class="step-section" data-v-47b5ad52><div class="step-header" data-v-47b5ad52><span class="step-number" data-v-47b5ad52>3</span><h3 class="step-title" data-v-47b5ad52>\u5B89\u88C5\u5948\u98DE\u5E94\u7528</h3></div><p class="content-text" data-v-47b5ad52> \u5728\u8BBE\u5907\u4E0A\u5B89\u88C5\u5B98\u65B9Netflix\u5E94\u7528\uFF1A </p><div class="install-steps" data-v-47b5ad52><div class="install-step" data-v-47b5ad52> \u5728Google Play\u5546\u5E97\uFF08Android TV\u8BBE\u5907\uFF09\u6216App Store\uFF08Apple TV\uFF09\u641C\u7D22&quot;Netflix&quot; </div><div class="install-step" data-v-47b5ad52> \u4E0B\u8F7D\u5E76\u5B89\u88C5\u6700\u65B0\u7248\u5E94\u7528 </div><div class="install-step" data-v-47b5ad52> \u6253\u5F00\u5E94\u7528\u5E76\u767B\u5F55\u60A8\u7684Netflix\u8D26\u53F7 </div></div><div class="app-showcase" data-v-47b5ad52><img${ssrRenderAttr("src", _imports_1)} alt="\u7535\u89C6\u76D2\u5B50\u5E94\u7528\u754C\u9762\u5C55\u793A" class="showcase-image" data-v-47b5ad52></div><div class="warning-notice" data-v-47b5ad52><p data-v-47b5ad52><strong data-v-47b5ad52>\u6CE8\u610F\uFF1A</strong>\u8BF7\u786E\u4FDD\u5B89\u88C5\u7684\u662F\u5B98\u65B9Netflix\u5E94\u7528\uFF0C\u800C\u975E\u7B2C\u4E09\u65B9\u4FEE\u6539\u7248\uFF0C\u5426\u5219\u53EF\u80FD\u65E0\u6CD5\u64AD\u653E4K\u5185\u5BB9\u3002</p></div></div><div class="step-section" data-v-47b5ad52><div class="step-header" data-v-47b5ad52><span class="step-number" data-v-47b5ad52>4</span><h3 class="step-title" data-v-47b5ad52>\u914D\u7F6E\u64AD\u653E\u8BBE\u7F6E</h3></div><p class="content-text" data-v-47b5ad52> \u767B\u5F55\u540E\uFF0C\u8FDB\u5165\u8D26\u6237\u8BBE\u7F6E\u8C03\u6574\u64AD\u653E\u53C2\u6570\uFF1A </p><div class="config-steps" data-v-47b5ad52><div class="config-step" data-v-47b5ad52> \u8FDB\u5165&quot;\u8D26\u6237\u8BBE\u7F6E&quot;\u2192&quot;\u64AD\u653E\u8BBE\u7F6E&quot; </div><div class="config-step" data-v-47b5ad52> \u5C06\u6570\u636E\u4F7F\u7528\u8BBE\u7F6E\u4E3A&quot;\u9AD8&quot;\uFF084K\u6240\u9700\uFF09 </div><div class="config-step" data-v-47b5ad52> \u6253\u5F00&quot;\u6D4B\u8BD5\u53C2\u4E0E&quot;\u9009\u9879\u4EE5\u83B7\u53D6\u6700\u65B0\u529F\u80FD </div><div class="config-step" data-v-47b5ad52> \u8BBE\u7F6E\u9996\u9009\u5B57\u5E55\u6837\u5F0F\uFF08\u5927\u5C0F\u3001\u989C\u8272\u7B49\uFF09 </div></div><div class="config-showcase" data-v-47b5ad52><img${ssrRenderAttr("src", _imports_2)} alt="\u8BBE\u5907\u914D\u7F6E\u548C\u8BBE\u7F6E\u754C\u9762" class="showcase-image" data-v-47b5ad52></div></div><div class="step-section" data-v-47b5ad52><div class="step-header" data-v-47b5ad52><span class="step-number" data-v-47b5ad52>5</span><h3 class="step-title" data-v-47b5ad52>\u9A8C\u8BC14K\u64AD\u653E\u6548\u679C</h3></div><p class="content-text" data-v-47b5ad52> \u64AD\u653E\u5948\u98DE\u5185\u5BB9\u65F6\uFF0C\u5982\u4F55\u786E\u8BA4\u662F\u5426\u8FBE\u52304K\u753B\u8D28\uFF1A </p><div class="verify-steps" data-v-47b5ad52><div class="verify-step" data-v-47b5ad52> \u5728\u64AD\u653E\u754C\u9762\u6309&quot;\u4FE1\u606F&quot;\u6309\u94AE\uFF08\u4E0D\u540C\u8BBE\u5907\u6309\u952E\u4E0D\u540C\uFF09 </div><div class="verify-step" data-v-47b5ad52> \u67E5\u770B\u5206\u8FA8\u7387\u4FE1\u606F\uFF08\u5E94\u663E\u793A2160p\uFF09 </div><div class="verify-step" data-v-47b5ad52> \u68C0\u67E5HDR\u6807\u5FD7\uFF08DV\u6216HDR10\uFF09 </div><div class="verify-step" data-v-47b5ad52> \u6CE8\u610F\u97F3\u8F68\u4FE1\u606F\uFF08DD+\u6216Atmos\uFF09 </div></div><p class="content-text" data-v-47b5ad52> \u60A8\u4E5F\u53EF\u4EE5\u64AD\u653E\u5948\u98DE\u5B98\u65B9\u6D4B\u8BD5\u89C6\u9891\uFF08\u641C\u7D22&quot;Test Patterns&quot;\uFF09\u6765\u9A8C\u8BC1\u5206\u8FA8\u7387\u3002 </p></div><div class="section-block" data-v-47b5ad52><h2 class="section-title" data-v-47b5ad52>\u5E38\u89C1\u95EE\u9898\u89E3\u7B54</h2><div class="faq-item faq-item-orange" data-v-47b5ad52><div class="faq-question" data-v-47b5ad52><h3 data-v-47b5ad52>\u4E3A\u4EC0\u4E48\u6211\u7684\u5948\u98DE\u53EA\u663E\u793AHD\uFF0C\u6CA1\u67094K\u9009\u9879\uFF1F</h3></div><div class="faq-answer" data-v-47b5ad52><p data-v-47b5ad52>\u53EF\u80FD\u539F\u56E0\uFF1A1\uFF09\u60A8\u7684\u8D26\u53F7\u4E0D\u662F\u9AD8\u7EA7\u4F1A\u5458\uFF1B2\uFF09\u8BBE\u5907\u4E0D\u652F\u63014K\u64AD\u653E\uFF1B3\uFF09\u7F51\u7EDC\u901F\u5EA6\u4E0D\u8DB3\uFF1B4\uFF09\u5185\u5BB9\u5728\u8BE5\u5730\u533A\u6CA1\u67094K\u7248\u672C\u3002\u8BF7\u9010\u4E00\u68C0\u67E5\u8FD9\u4E9B\u56E0\u7D20\u3002</p></div></div><div class="faq-item faq-item-green" data-v-47b5ad52><div class="faq-question" data-v-47b5ad52><h3 data-v-47b5ad52>\u5982\u4F55\u83B7\u5F97\u4E2D\u6587\u5B57\u5E55\uFF1F</h3></div><div class="faq-answer" data-v-47b5ad52><p data-v-47b5ad52>\u5948\u98DE\u5927\u90E8\u5206\u5185\u5BB9\u90FD\u63D0\u4F9B\u4E2D\u6587\u5B57\u5E55\u3002\u64AD\u653E\u65F6\u70B9\u51FB&quot;\u5B57\u5E55\u548C\u97F3\u8F68&quot;\u56FE\u6807\uFF0C\u9009\u62E9&quot;\u4E2D\u6587(\u7B80\u4F53)&quot;\u5373\u53EF\u3002\u5982\u679C\u67D0\u4E9B\u5185\u5BB9\u6CA1\u6709\u4E2D\u6587\uFF0C\u53EF\u80FD\u662F\u5730\u533A\u9650\u5236\u5BFC\u81F4\u3002</p></div></div><div class="faq-item faq-item-blue" data-v-47b5ad52><div class="faq-question" data-v-47b5ad52><h3 data-v-47b5ad52>\u4E3A\u4EC0\u4E48\u64AD\u653E\u65F6\u7ECF\u5E38\u7F13\u51B2\uFF1F</h3></div><div class="faq-answer" data-v-47b5ad52><p data-v-47b5ad52>\u7F13\u51B2\u901A\u5E38\u7531\u7F51\u7EDC\u95EE\u9898\u5F15\u8D77\uFF1A1\uFF09\u7F51\u7EDC\u901F\u5EA6\u4E0D\u8DB3\uFF1B2\uFF09WiFi\u4FE1\u53F7\u4E0D\u7A33\u5B9A\uFF1B3\uFF09DNS\u89E3\u6790\u95EE\u9898\u3002\u5EFA\u8BAE\u4F7F\u7528\u7F51\u7EBF\u8FDE\u63A5\uFF0C\u66F4\u6362DNS\u670D\u52A1\u5668\uFF08\u5982Google DNS 8.8.8.8\uFF09\uFF0C\u6216\u5347\u7EA7\u7F51\u7EDC\u5E26\u5BBD\u3002</p></div></div></div><div class="section-block" data-v-47b5ad52><h2 class="section-title" data-v-47b5ad52>\u603B\u7ED3</h2><p class="content-text" data-v-47b5ad52> \u901A\u8FC7\u672C\u6587\u7684\u6307\u5BFC\uFF0C\u60A8\u5E94\u8BE5\u5DF2\u7ECF\u6210\u529F\u5728\u7535\u89C6\u76D2\u5B50\u4E0A\u914D\u7F6E\u597D\u4E86\u5948\u98DE4K\u64AD\u653E\u73AF\u5883\u3002\u4EAB\u53D74K HDR\u5E26\u6765\u7684\u89C6\u89C9\u76DB\u5BB4\u548C\u675C\u6BD4\u5168\u666F\u58F0\u7684\u6C89\u6D78\u5F0F\u4F53\u9A8C\u5427\uFF01\u5982\u679C\u5728\u914D\u7F6E\u8FC7\u7A0B\u4E2D\u9047\u5230\u4EFB\u4F55\u95EE\u9898\uFF0C\u6B22\u8FCE\u5728\u8BC4\u8BBA\u533A\u7559\u8A00\uFF0C\u6211\u4F1A\u5C3D\u529B\u89E3\u7B54\u3002 </p><div class="final-tip" data-v-47b5ad52><p data-v-47b5ad52><strong data-v-47b5ad52>\u6700\u540E\u63D0\u793A\uFF1A</strong>\u5948\u98DE\u76844K\u5185\u5BB9\u5728\u4E0D\u65AD\u66F4\u65B0\uFF0C\u5EFA\u8BAE\u5173\u6CE8\u5948\u98DE\u5B98\u65B9\u793E\u4EA4\u5A92\u4F53\u6216\u4F7F\u7528\u7B2C\u4E09\u65B9\u670D\u52A1\uFF08\u5982Unogs\uFF09\u67E5\u8BE2\u6700\u65B04K\u5185\u5BB9\u3002\u540C\u65F6\uFF0C\u4FDD\u6301\u8BBE\u5907\u548C\u5E94\u7528\u7684\u66F4\u65B0\uFF0C\u4EE5\u83B7\u5F97\u6700\u4F73\u4F53\u9A8C\u3002</p></div></div></div></div>`);
        }
        _push(`</div><div class="related-section" data-v-47b5ad52><h2 class="related-title" data-v-47b5ad52>\u76F8\u5173\u63A8\u8350</h2><div class="related-articles" data-v-47b5ad52><div class="related-article" data-v-47b5ad52><div class="related-image" data-v-47b5ad52><img${ssrRenderAttr("src", _imports_3)} alt="Apple TV 4K\u8BC4\u6D4B" data-v-47b5ad52></div><div class="related-content" data-v-47b5ad52><div class="related-category" data-v-47b5ad52>\u8BBE\u5907\u8BC4\u6D4B</div><h3 class="related-article-title" data-v-47b5ad52>2023\u5E74Apple TV 4K\u5168\u9762\u8BC4\u6D4B\uFF1A\u503C\u5F97\u8D2D\u4E70\u5417\uFF1F</h3><div class="related-author" data-v-47b5ad52><img${ssrRenderAttr("src", _imports_4)} alt="\u674E\u8BC4\u6D4B" class="author-avatar-small" data-v-47b5ad52><span class="author-name-small" data-v-47b5ad52>\u674E\u8BC4\u6D4B</span><span class="publish-date-small" data-v-47b5ad52>2023-06-15</span></div></div></div><div class="related-article" data-v-47b5ad52><div class="related-image" data-v-47b5ad52><img${ssrRenderAttr("src", _imports_5)} alt="\u5BB6\u5EAD\u5F71\u9662\u642D\u5EFA" data-v-47b5ad52></div><div class="related-content" data-v-47b5ad52><div class="related-category" data-v-47b5ad52>\u5BB6\u5C45\u5F71\u9662</div><h3 class="related-article-title" data-v-47b5ad52>\u6253\u9020\u5B8C\u7F8E\u5BB6\u5EAD\u5F71\u9662\uFF1A\u4ECE\u5165\u95E8\u5230\u4E13\u4E1A\u7684\u5B8C\u6574\u6307\u5357</h3><div class="related-author" data-v-47b5ad52><img${ssrRenderAttr("src", _imports_6)} alt="\u738B\u5F71\u97F3" class="author-avatar-small" data-v-47b5ad52><span class="author-name-small" data-v-47b5ad52>\u738B\u5F71\u97F3</span><span class="publish-date-small" data-v-47b5ad52>2023-06-10</span></div></div></div><div class="related-article" data-v-47b5ad52><div class="related-image" data-v-47b5ad52><img${ssrRenderAttr("src", _imports_7)} alt="\u6D41\u5A92\u4F53\u5E73\u53F0\u5BF9\u6BD4" data-v-47b5ad52></div><div class="related-content" data-v-47b5ad52><div class="related-category" data-v-47b5ad52>\u6D41\u5A92\u4F53</div><h3 class="related-article-title" data-v-47b5ad52>\u4E94\u5927\u6D41\u5A92\u4F53\u5E73\u53F0\u5BF9\u6BD4\uFF1ANetflix\u3001Disney+\u3001HBO\u54EA\u5BB6\u5F3A\uFF1F</h3><div class="related-author" data-v-47b5ad52><img${ssrRenderAttr("src", _imports_8)} alt="\u8D75\u5A92\u4F53" class="author-avatar-small" data-v-47b5ad52><span class="author-name-small" data-v-47b5ad52>\u8D75\u5A92\u4F53</span><span class="publish-date-small" data-v-47b5ad52>2023-06-05</span></div></div></div></div></div></div>`);
      } else {
        _push(`<div class="content-placeholder" data-v-47b5ad52><h1 data-v-47b5ad52>\u6587\u7AE0\u4E0D\u5B58\u5728</h1><p data-v-47b5ad52>\u62B1\u6B49\uFF0C\u60A8\u8BBF\u95EE\u7684\u6587\u7AE0\u4E0D\u5B58\u5728\u3002</p><button class="back-btn" data-v-47b5ad52>\u8FD4\u56DE\u4E0A\u4E00\u9875</button></div>`);
      }
      _push(`</div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/article/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _id_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-47b5ad52"]]);

export { _id_ as default };
//# sourceMappingURL=_id_-KVejOkqd.mjs.map
