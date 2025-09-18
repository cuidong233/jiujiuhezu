import { ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrInterpolate } from 'vue/server-renderer';
import { d as useUserStore } from './server.mjs';
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

const _sfc_main = {
  __name: "debug",
  __ssrInlineRender: true,
  setup(__props) {
    const userStore = useUserStore();
    const tokenFromCookie = ref("");
    const documentCookie = ref("");
    const localStorageToken = ref("");
    const localStorageUser = ref("");
    const testResult = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ style: { "padding": "20px", "font-family": "monospace" } }, _attrs))}><h1>\u{1F50D} \u8C03\u8BD5\u9875\u9762 - \u767B\u5F55\u72B6\u6001\u68C0\u67E5</h1><div style="${ssrRenderStyle({ "margin": "20px 0", "padding": "15px", "background": "#f0f0f0", "border-radius": "5px" })}"><h2>Cookie\u72B6\u6001\uFF1A</h2><p><strong>token (useCookie):</strong> ${ssrInterpolate(tokenFromCookie.value || "\u7A7A")}</p><p><strong>document.cookie:</strong> ${ssrInterpolate(documentCookie.value)}</p></div><div style="${ssrRenderStyle({ "margin": "20px 0", "padding": "15px", "background": "#f0f0f0", "border-radius": "5px" })}"><h2>LocalStorage\u72B6\u6001\uFF1A</h2><p><strong>token:</strong> ${ssrInterpolate(localStorageToken.value || "\u7A7A")}</p><p><strong>user:</strong> ${ssrInterpolate(localStorageUser.value)}</p></div><div style="${ssrRenderStyle({ "margin": "20px 0", "padding": "15px", "background": "#f0f0f0", "border-radius": "5px" })}"><h2>UserStore\u72B6\u6001\uFF1A</h2><p><strong>isLoggedIn:</strong> ${ssrInterpolate(unref(userStore).isLoggedIn)}</p><p><strong>token:</strong> ${ssrInterpolate(unref(userStore).token || "\u7A7A")}</p><p><strong>user:</strong> ${ssrInterpolate(JSON.stringify(unref(userStore).user))}</p></div><div style="${ssrRenderStyle({ "margin": "20px 0" })}"><button style="${ssrRenderStyle({ "padding": "10px 20px", "margin-right": "10px" })}"> \u6D4B\u8BD5\u8BBE\u7F6ECookie </button><button style="${ssrRenderStyle({ "padding": "10px 20px", "margin-right": "10px" })}"> \u6D4B\u8BD5\u767B\u5F55 </button><button style="${ssrRenderStyle({ "padding": "10px 20px", "margin-right": "10px" })}"> \u5237\u65B0\u9875\u9762 </button><button style="${ssrRenderStyle({ "padding": "10px 20px" })}"> \u6E05\u9664\u6240\u6709\u6570\u636E </button></div><div style="${ssrRenderStyle({ "margin": "20px 0", "padding": "15px", "background": "#ffffcc", "border-radius": "5px" })}"><h3>\u6D4B\u8BD5\u7ED3\u679C\uFF1A</h3><pre>${ssrInterpolate(testResult.value)}</pre></div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/debug.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=debug-DlcgsT1W.mjs.map
