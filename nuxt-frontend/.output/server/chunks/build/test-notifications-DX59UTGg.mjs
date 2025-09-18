import { defineComponent, computed, ref, resolveComponent, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, createBlock, createCommentVNode, openBlock, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList } from 'vue/server-renderer';
import { x as notificationApi, y as ElMessage } from '../_/index.mjs';
import { _ as _export_sfc, d as useUserStore } from './server.mjs';
import '@vueuse/core';
import 'lodash-unified';
import '@vue/shared';
import '@element-plus/icons-vue';
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
  __name: "test-notifications",
  __ssrInlineRender: true,
  setup(__props) {
    const userStore = useUserStore();
    const userInfo = computed(() => userStore.userInfo);
    const notifications = ref([]);
    const debugInfo = ref("");
    const testNotifications2 = async () => {
      var _a;
      try {
        debugInfo.value = "\u6B63\u5728\u83B7\u53D6\u901A\u77E5...\n";
        const response = await notificationApi.getList({
          page: 1,
          pageSize: 20
        });
        debugInfo.value += `\u54CD\u5E94\u72B6\u6001: ${response.code || response.status}
`;
        debugInfo.value += `\u54CD\u5E94\u6570\u636E: ${JSON.stringify(response, null, 2)}
`;
        if (response.success || response.code === 200) {
          notifications.value = response.data.list || [];
          ElMessage.success(`\u83B7\u53D6\u5230 ${notifications.value.length} \u6761\u901A\u77E5`);
        } else {
          ElMessage.error("\u83B7\u53D6\u901A\u77E5\u5931\u8D25");
        }
      } catch (error) {
        debugInfo.value += `\u9519\u8BEF: ${error.message}
`;
        debugInfo.value += `\u9519\u8BEF\u8BE6\u60C5: ${JSON.stringify((_a = error.response) == null ? void 0 : _a.data, null, 2)}
`;
        ElMessage.error("\u83B7\u53D6\u901A\u77E5\u5931\u8D25: " + error.message);
      }
    };
    const getUnreadCount = async () => {
      try {
        const response = await notificationApi.getUnreadCount();
        if (response.success || response.code === 200) {
          ElMessage.success(`\u672A\u8BFB\u901A\u77E5\u6570\u91CF: ${response.data.count}`);
          debugInfo.value = `\u672A\u8BFB\u6570\u91CF: ${response.data.count}
`;
        }
      } catch (error) {
        ElMessage.error("\u83B7\u53D6\u672A\u8BFB\u6570\u91CF\u5931\u8D25: " + error.message);
        debugInfo.value = `\u9519\u8BEF: ${error.message}
`;
      }
    };
    const markAsRead = async (id) => {
      try {
        await notificationApi.markAsRead(id);
        ElMessage.success("\u5DF2\u6807\u8BB0\u4E3A\u5DF2\u8BFB");
        await testNotifications2();
      } catch (error) {
        ElMessage.error("\u6807\u8BB0\u5931\u8D25: " + error.message);
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NotificationBell = resolveComponent("NotificationBell");
      const _component_el_button = resolveComponent("el-button");
      const _component_el_card = resolveComponent("el-card");
      const _component_el_tag = resolveComponent("el-tag");
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "test-notifications-page" }, _attrs))} data-v-44d960cf><h1 data-v-44d960cf>\u901A\u77E5\u6D4B\u8BD5\u9875\u9762</h1><div class="user-info" data-v-44d960cf><h2 data-v-44d960cf>\u5F53\u524D\u7528\u6237\u4FE1\u606F</h2>`);
      if (unref(userInfo)) {
        _push(`<p data-v-44d960cf> \u7528\u6237ID: ${ssrInterpolate(unref(userInfo).id)}<br data-v-44d960cf> \u90AE\u7BB1: ${ssrInterpolate(unref(userInfo).email)}<br data-v-44d960cf> \u6635\u79F0: ${ssrInterpolate(unref(userInfo).nickname)}</p>`);
      } else {
        _push(`<p data-v-44d960cf>\u672A\u767B\u5F55</p>`);
      }
      _push(`</div><div class="notification-section" data-v-44d960cf><h2 data-v-44d960cf>\u901A\u77E5\u94C3\u94DB\u7EC4\u4EF6</h2>`);
      _push(ssrRenderComponent(_component_NotificationBell, null, null, _parent));
      _push(`</div><div class="manual-test" data-v-44d960cf><h2 data-v-44d960cf>\u624B\u52A8\u6D4B\u8BD5\u901A\u77E5API</h2>`);
      _push(ssrRenderComponent(_component_el_button, { onClick: testNotifications2 }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u83B7\u53D6\u901A\u77E5`);
          } else {
            return [
              createTextVNode("\u83B7\u53D6\u901A\u77E5")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_el_button, { onClick: getUnreadCount }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u83B7\u53D6\u672A\u8BFB\u6570\u91CF`);
          } else {
            return [
              createTextVNode("\u83B7\u53D6\u672A\u8BFB\u6570\u91CF")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      if (notifications.value.length > 0) {
        _push(`<div class="notifications-list" data-v-44d960cf><h3 data-v-44d960cf>\u901A\u77E5\u5217\u8868 (${ssrInterpolate(notifications.value.length)} \u6761)</h3><!--[-->`);
        ssrRenderList(notifications.value, (n) => {
          _push(`<div class="notification-item" data-v-44d960cf>`);
          _push(ssrRenderComponent(_component_el_card, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<h4 data-v-44d960cf${_scopeId}>${ssrInterpolate(n.title)}</h4><p data-v-44d960cf${_scopeId}>${ssrInterpolate(n.content)}</p><p data-v-44d960cf${_scopeId}>`);
                _push2(ssrRenderComponent(_component_el_tag, {
                  type: n.isRead ? "info" : "danger"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(n.isRead ? "\u5DF2\u8BFB" : "\u672A\u8BFB")}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(n.isRead ? "\u5DF2\u8BFB" : "\u672A\u8BFB"), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_el_tag, null, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(n.type)}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(n.type), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</p><p data-v-44d960cf${_scopeId}>\u65F6\u95F4: ${ssrInterpolate(new Date(n.createdAt).toLocaleString("zh-CN"))}</p>`);
                if (!n.isRead) {
                  _push2(ssrRenderComponent(_component_el_button, {
                    onClick: ($event) => markAsRead(n.id),
                    size: "small"
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(` \u6807\u8BB0\u5DF2\u8BFB `);
                      } else {
                        return [
                          createTextVNode(" \u6807\u8BB0\u5DF2\u8BFB ")
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
              } else {
                return [
                  createVNode("h4", null, toDisplayString(n.title), 1),
                  createVNode("p", null, toDisplayString(n.content), 1),
                  createVNode("p", null, [
                    createVNode(_component_el_tag, {
                      type: n.isRead ? "info" : "danger"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(n.isRead ? "\u5DF2\u8BFB" : "\u672A\u8BFB"), 1)
                      ]),
                      _: 2
                    }, 1032, ["type"]),
                    createVNode(_component_el_tag, null, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(n.type), 1)
                      ]),
                      _: 2
                    }, 1024)
                  ]),
                  createVNode("p", null, "\u65F6\u95F4: " + toDisplayString(new Date(n.createdAt).toLocaleString("zh-CN")), 1),
                  !n.isRead ? (openBlock(), createBlock(_component_el_button, {
                    key: 0,
                    onClick: ($event) => markAsRead(n.id),
                    size: "small"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" \u6807\u8BB0\u5DF2\u8BFB ")
                    ]),
                    _: 2
                  }, 1032, ["onClick"])) : createCommentVNode("", true)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="debug-info" data-v-44d960cf><h3 data-v-44d960cf>\u8C03\u8BD5\u4FE1\u606F</h3><pre data-v-44d960cf>${ssrInterpolate(debugInfo.value)}</pre></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/test-notifications.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const testNotifications = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-44d960cf"]]);

export { testNotifications as default };
//# sourceMappingURL=test-notifications-DX59UTGg.mjs.map
