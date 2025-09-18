import { defineComponent, ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderStyle } from 'vue/server-renderer';
import { p as publicAssetsURL } from '../nitro/nitro.mjs';
import { _ as _export_sfc, d as useUserStore } from './server.mjs';
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

const _imports_0 = publicAssetsURL("/images/tuiguang1.png");
const _imports_1 = publicAssetsURL("/images/tuiguang2.png");
const _imports_2 = publicAssetsURL("/images/tuiguang3.png");
const _imports_3 = publicAssetsURL("/images/tuiguang4.png");
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "referral",
  __ssrInlineRender: true,
  setup(__props) {
    useUserStore();
    const stats = ref({
      registerNum: 0,
      orderNum: 0,
      orderAmount: 0
    });
    const inviteInfo = ref({
      code: "",
      link: "",
      nickName: "",
      avatar: ""
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "referral-section" }, _attrs))} data-v-4081a97a><div class="section-header" data-v-4081a97a><h2 class="section-title" data-v-4081a97a>\u8FD4\u73B0\u63A8\u5E7F</h2></div><div class="referral-top" data-v-4081a97a><div class="invite-area" data-v-4081a97a><h3 class="invite-title" data-v-4081a97a>\u9080\u8BF7\u597D\u53CB\uFF0C\u8D5A\u53D6\u9AD8\u989D\u8FD4\u73B0</h3><p class="invite-desc" data-v-4081a97a>\u5206\u4EAB\u63A8\u5E7F\u7801\u9080\u8BF7\u597D\u53CB</p></div><div class="earnings-area" data-v-4081a97a><div class="earnings-content" data-v-4081a97a><div class="earnings-label" data-v-4081a97a>\u6211\u7684\u63A8\u5E7F\u6536\u76CA</div><div class="earnings-amount" data-v-4081a97a>\xA5 ${ssrInterpolate((_a = stats.value.orderAmount) != null ? _a : 0)}</div></div><button class="withdraw-btn" data-v-4081a97a>\u7ACB\u5373\u63D0\u73B0</button></div></div><div class="referral-middle" data-v-4081a97a><div class="referral-code-area" data-v-4081a97a><div class="area-header" data-v-4081a97a>\u6211\u7684\u63A8\u5E7F\u7801</div><div class="code-content" data-v-4081a97a><div class="code-label" data-v-4081a97a>\u60A8\u7684\u4E13\u5C5E\u63A8\u5E7F\u7801</div><div class="code-section" data-v-4081a97a><div class="code-display" data-v-4081a97a>${ssrInterpolate(inviteInfo.value.code)}</div><button class="copy-code-btn" data-v-4081a97a>\u590D\u5236\u63A8\u5E7F\u7801</button></div></div></div><div class="referral-link-area" data-v-4081a97a><div class="area-header" data-v-4081a97a>\u63A8\u5E7F\u94FE\u63A5</div><div class="link-content" data-v-4081a97a><div class="link-label" data-v-4081a97a>\u60A8\u7684\u4E13\u5C5E\u63A8\u5E7F\u94FE\u63A5</div><div class="link-section" data-v-4081a97a><input type="text" class="link-input"${ssrRenderAttr("value", inviteInfo.value.link)} readonly data-v-4081a97a><button class="copy-link-btn" data-v-4081a97a>\u590D\u5236\u94FE\u63A5</button></div><p class="link-tip" data-v-4081a97a>\u5206\u4EAB\u6B64\u94FE\u63A5\u7ED9\u597D\u53CB\uFF0C\u597D\u53CB\u901A\u8FC7\u6B64\u94FE\u63A5\u6CE8\u518C\u5373\u53EF\u6210\u4E3A\u60A8\u7684\u63A8\u5E7F\u7528\u6237</p></div></div></div><div class="referral-stats" data-v-4081a97a><div class="stat-item" data-v-4081a97a><div class="stat-icon" data-v-4081a97a><img${ssrRenderAttr("src", _imports_0)} alt="\u63A8\u5E7F\u7528\u6237\u56FE\u6807" class="stat-icon-img" onerror="this.style.display=&#39;none&#39;; this.nextElementSibling.style.display=&#39;block&#39;;" data-v-4081a97a><div class="stat-icon-placeholder" style="${ssrRenderStyle({ "display": "none" })}" data-v-4081a97a><div class="placeholder-box" data-v-4081a97a>\u7528\u6237</div></div></div><div class="stat-label" data-v-4081a97a>\u63A8\u5E7F\u7528\u6237</div><div class="stat-value" data-v-4081a97a>${ssrInterpolate((_b = stats.value.registerNum) != null ? _b : 0)}</div></div><div class="stat-item" data-v-4081a97a><div class="stat-icon" data-v-4081a97a><img${ssrRenderAttr("src", _imports_1)} alt="\u6210\u529F\u8BA2\u5355\u56FE\u6807" class="stat-icon-img" onerror="this.style.display=&#39;none&#39;; this.nextElementSibling.style.display=&#39;block&#39;;" data-v-4081a97a><div class="stat-icon-placeholder" style="${ssrRenderStyle({ "display": "none" })}" data-v-4081a97a><div class="placeholder-box" data-v-4081a97a>\u8BA2\u5355</div></div></div><div class="stat-label" data-v-4081a97a>\u6210\u529F\u8BA2\u5355</div><div class="stat-value" data-v-4081a97a>${ssrInterpolate((_c = stats.value.orderNum) != null ? _c : 0)}</div></div><div class="stat-item" data-v-4081a97a><div class="stat-icon" data-v-4081a97a><img${ssrRenderAttr("src", _imports_2)} alt="\u7D2F\u8BA1\u6536\u76CA\u56FE\u6807" class="stat-icon-img" onerror="this.style.display=&#39;none&#39;; this.nextElementSibling.style.display=&#39;block&#39;;" data-v-4081a97a><div class="stat-icon-placeholder" style="${ssrRenderStyle({ "display": "none" })}" data-v-4081a97a><div class="placeholder-box" data-v-4081a97a>\u6536\u76CA</div></div></div><div class="stat-label" data-v-4081a97a>\u7D2F\u8BA1\u6536\u76CA</div><div class="stat-value" data-v-4081a97a>\xA5${ssrInterpolate((_d = stats.value.orderAmount) != null ? _d : 0)}</div></div><div class="stat-item" data-v-4081a97a><div class="stat-icon" data-v-4081a97a><img${ssrRenderAttr("src", _imports_3)} alt="\u672C\u6708\u6536\u76CA\u56FE\u6807" class="stat-icon-img" onerror="this.style.display=&#39;none&#39;; this.nextElementSibling.style.display=&#39;block&#39;;" data-v-4081a97a><div class="stat-icon-placeholder" style="${ssrRenderStyle({ "display": "none" })}" data-v-4081a97a><div class="placeholder-box" data-v-4081a97a>\u6708\u6536\u76CA</div></div></div><div class="stat-label" data-v-4081a97a>\u672C\u6708\u6536\u76CA</div><div class="stat-value" data-v-4081a97a>--</div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/profile/referral.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const referral = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-4081a97a"]]);

export { referral as default };
//# sourceMappingURL=referral-gLmQIJqF.mjs.map
