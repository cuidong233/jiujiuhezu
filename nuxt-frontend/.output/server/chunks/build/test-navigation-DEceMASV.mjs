import { _ as _export_sfc, i as useRouter, j as useRoute, a as __nuxt_component_0, n as navigateTo } from './server.mjs';
import { defineComponent, ref, computed, resolveComponent, mergeProps, withCtx, createTextVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "test-navigation",
  __ssrInlineRender: true,
  setup(__props) {
    const router = useRouter();
    const route = useRoute();
    const consoleOutput = ref("");
    const routeInfo = computed(() => {
      return {
        path: route.path,
        fullPath: route.fullPath,
        name: route.name,
        params: route.params,
        query: route.query
      };
    });
    const addLog = (message) => {
      const timestamp = (/* @__PURE__ */ new Date()).toLocaleTimeString("zh-CN");
      consoleOutput.value += `[${timestamp}] ${message}
`;
    };
    const testNavigateTo = async (path) => {
      addLog(`\u5C1D\u8BD5\u4F7F\u7528 navigateTo \u5BFC\u822A\u5230: ${path}`);
      try {
        await navigateTo(path);
        addLog(`\u2705 \u5BFC\u822A\u6210\u529F: ${path}`);
      } catch (error) {
        addLog(`\u274C \u5BFC\u822A\u5931\u8D25: ${error.message}`);
        console.error("NavigateTo \u9519\u8BEF:", error);
      }
    };
    const testRouterPush = async (path) => {
      addLog(`\u5C1D\u8BD5\u4F7F\u7528 router.push \u5BFC\u822A\u5230: ${path}`);
      try {
        await router.push(path);
        addLog(`\u2705 \u5BFC\u822A\u6210\u529F: ${path}`);
      } catch (error) {
        addLog(`\u274C \u5BFC\u822A\u5931\u8D25: ${error.message}`);
        console.error("Router.push \u9519\u8BEF:", error);
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_el_button = resolveComponent("el-button");
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "test-navigation" }, _attrs))} data-v-e6971110><h1 data-v-e6971110>\u8DEF\u7531\u6D4B\u8BD5\u9875\u9762</h1><div class="navigation-test" data-v-e6971110><h2 data-v-e6971110>\u6D4B\u8BD5\u5BFC\u822A\u529F\u80FD</h2><div class="button-group" data-v-e6971110><h3 data-v-e6971110>\u4F7F\u7528 navigateTo (\u63A8\u8350)</h3>`);
      _push(ssrRenderComponent(_component_el_button, {
        onClick: ($event) => testNavigateTo("/profile")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u4E2A\u4EBA\u4E2D\u5FC3`);
          } else {
            return [
              createTextVNode("\u4E2A\u4EBA\u4E2D\u5FC3")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_el_button, {
        onClick: ($event) => testNavigateTo("/profile/orders")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u6211\u7684\u8BA2\u5355`);
          } else {
            return [
              createTextVNode("\u6211\u7684\u8BA2\u5355")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_el_button, {
        onClick: ($event) => testNavigateTo("/profile/wallet")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u6211\u7684\u94B1\u5305`);
          } else {
            return [
              createTextVNode("\u6211\u7684\u94B1\u5305")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_el_button, {
        onClick: ($event) => testNavigateTo("/profile/notifications")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u901A\u77E5\u9875\u9762`);
          } else {
            return [
              createTextVNode("\u901A\u77E5\u9875\u9762")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="button-group" data-v-e6971110><h3 data-v-e6971110>\u4F7F\u7528 router.push</h3>`);
      _push(ssrRenderComponent(_component_el_button, {
        onClick: ($event) => testRouterPush("/profile")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u4E2A\u4EBA\u4E2D\u5FC3`);
          } else {
            return [
              createTextVNode("\u4E2A\u4EBA\u4E2D\u5FC3")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_el_button, {
        onClick: ($event) => testRouterPush("/profile/orders")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u6211\u7684\u8BA2\u5355`);
          } else {
            return [
              createTextVNode("\u6211\u7684\u8BA2\u5355")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_el_button, {
        onClick: ($event) => testRouterPush("/profile/wallet")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u6211\u7684\u94B1\u5305`);
          } else {
            return [
              createTextVNode("\u6211\u7684\u94B1\u5305")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="button-group" data-v-e6971110><h3 data-v-e6971110>\u4F7F\u7528 NuxtLink</h3>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/profile",
        class: "link-button"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_el_button, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u4E2A\u4EBA\u4E2D\u5FC3`);
                } else {
                  return [
                    createTextVNode("\u4E2A\u4EBA\u4E2D\u5FC3")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_el_button, null, {
                default: withCtx(() => [
                  createTextVNode("\u4E2A\u4EBA\u4E2D\u5FC3")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/profile/orders",
        class: "link-button"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_el_button, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u6211\u7684\u8BA2\u5355`);
                } else {
                  return [
                    createTextVNode("\u6211\u7684\u8BA2\u5355")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_el_button, null, {
                default: withCtx(() => [
                  createTextVNode("\u6211\u7684\u8BA2\u5355")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/profile/wallet",
        class: "link-button"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_el_button, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u6211\u7684\u94B1\u5305`);
                } else {
                  return [
                    createTextVNode("\u6211\u7684\u94B1\u5305")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_el_button, null, {
                default: withCtx(() => [
                  createTextVNode("\u6211\u7684\u94B1\u5305")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div><div class="route-info" data-v-e6971110><h2 data-v-e6971110>\u5F53\u524D\u8DEF\u7531\u4FE1\u606F</h2><pre data-v-e6971110>${ssrInterpolate(routeInfo.value)}</pre></div><div class="console-output" data-v-e6971110><h2 data-v-e6971110>\u63A7\u5236\u53F0\u8F93\u51FA</h2><pre data-v-e6971110>${ssrInterpolate(consoleOutput.value)}</pre></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/test-navigation.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const testNavigation = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-e6971110"]]);

export { testNavigation as default };
//# sourceMappingURL=test-navigation-DEceMASV.mjs.map
