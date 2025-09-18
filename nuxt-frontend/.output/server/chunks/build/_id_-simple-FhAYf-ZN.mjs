import { _ as __nuxt_component_0, a as __nuxt_component_1 } from './AppFooter-DftAiZQA.mjs';
import { defineComponent, ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { useRoute } from 'vue-router';
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
import './v3-CddZA8nI.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]-simple",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const goodsId = ref(route.params.id);
    const loading = ref(true);
    const error = ref("");
    const goodsInfo = ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AppHeader = __nuxt_component_0;
      const _component_AppFooter = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "goods-detail-page" }, _attrs))} data-v-a4ef45a7>`);
      _push(ssrRenderComponent(_component_AppHeader, null, null, _parent));
      _push(`<div class="debug-info" data-v-a4ef45a7><h3 data-v-a4ef45a7>\u8C03\u8BD5\u4FE1\u606F</h3><p data-v-a4ef45a7>\u5546\u54C1ID: ${ssrInterpolate(goodsId.value)}</p><p data-v-a4ef45a7>\u52A0\u8F7D\u72B6\u6001: ${ssrInterpolate(loading.value ? "\u6B63\u5728\u52A0\u8F7D" : "\u52A0\u8F7D\u5B8C\u6210")}</p><p data-v-a4ef45a7>\u9519\u8BEF\u4FE1\u606F: ${ssrInterpolate(error.value || "\u65E0")}</p><p data-v-a4ef45a7>\u6570\u636E: ${ssrInterpolate(JSON.stringify(goodsInfo.value, null, 2))}</p></div>`);
      if (!loading.value && goodsInfo.value) {
        _push(`<div class="goods-content" data-v-a4ef45a7><h1 data-v-a4ef45a7>${ssrInterpolate(goodsInfo.value.name)}</h1><p data-v-a4ef45a7>\u4EF7\u683C: \xA5${ssrInterpolate(goodsInfo.value.price)}</p><p data-v-a4ef45a7>\u63CF\u8FF0: ${ssrInterpolate(goodsInfo.value.desc)}</p><button data-v-a4ef45a7>\u8FD4\u56DE</button></div>`);
      } else if (loading.value) {
        _push(`<div class="loading" data-v-a4ef45a7> \u6B63\u5728\u52A0\u8F7D\u5546\u54C1\u4FE1\u606F... </div>`);
      } else if (error.value) {
        _push(`<div class="error" data-v-a4ef45a7> \u52A0\u8F7D\u5931\u8D25: ${ssrInterpolate(error.value)} <button data-v-a4ef45a7>\u91CD\u8BD5</button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_AppFooter, null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/goods/[id]-simple.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _id_Simple = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-a4ef45a7"]]);

export { _id_Simple as default };
//# sourceMappingURL=_id_-simple-FhAYf-ZN.mjs.map
