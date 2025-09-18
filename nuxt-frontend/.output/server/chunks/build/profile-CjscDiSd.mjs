import { _ as __nuxt_component_0, a as __nuxt_component_1 } from './AppFooter-DftAiZQA.mjs';
import { _ as _export_sfc, d as useUserStore, i as useRouter, j as useRoute, a as __nuxt_component_0$1, k as __nuxt_component_2$1, n as navigateTo } from './server.mjs';
import { defineComponent, ref, computed, mergeProps, unref, withCtx, createBlock, createCommentVNode, createVNode, openBlock, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr } from 'vue/server-renderer';
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

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ChangeAvatarModal",
  __ssrInlineRender: true,
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    var _a, _b;
    const userStore = useUserStore();
    const selectedAvatar = ref(((_a = userStore.user) == null ? void 0 : _a.avatar) || "/images/head1.png");
    const previewUrl = ref(((_b = userStore.user) == null ? void 0 : _b.avatar) || "/images/head1.png");
    const loading = ref(false);
    ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      var _a2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "modal-overlay" }, _attrs))} data-v-65d37024><div class="modal-container" data-v-65d37024><div class="modal-header" data-v-65d37024><h3 class="modal-title" data-v-65d37024>\u66F4\u6539\u5934\u50CF</h3><button class="modal-close" data-v-65d37024>\xD7</button></div><div class="modal-body" data-v-65d37024><div class="avatar-preview" data-v-65d37024><img${ssrRenderAttr("src", previewUrl.value || ((_a2 = unref(userStore).user) == null ? void 0 : _a2.avatar) || "/images/head1.png")} alt="\u5934\u50CF\u9884\u89C8" data-v-65d37024></div><div class="avatar-options" data-v-65d37024><h4 data-v-65d37024>\u9009\u62E9\u9ED8\u8BA4\u5934\u50CF</h4><div class="default-avatars" data-v-65d37024><!--[-->`);
      ssrRenderList(3, (i) => {
        _push(`<div class="${ssrRenderClass([{ active: selectedAvatar.value === `/images/head${i}.png` }, "avatar-option"])}" data-v-65d37024><img${ssrRenderAttr("src", `/images/head${i}.png`)}${ssrRenderAttr("alt", `\u5934\u50CF${i}`)} data-v-65d37024></div>`);
      });
      _push(`<!--]--></div></div><div class="upload-section" data-v-65d37024><h4 data-v-65d37024>\u6216\u4E0A\u4F20\u81EA\u5B9A\u4E49\u5934\u50CF</h4><label class="upload-btn" data-v-65d37024><input type="file" accept="image/*" hidden data-v-65d37024><span data-v-65d37024>\u9009\u62E9\u56FE\u7247</span></label><p class="upload-hint" data-v-65d37024>\u652F\u6301 JPG\u3001PNG \u683C\u5F0F\uFF0C\u6587\u4EF6\u5927\u5C0F\u4E0D\u8D85\u8FC7 2MB</p></div></div><div class="modal-footer" data-v-65d37024><button class="btn-cancel" data-v-65d37024>\u53D6\u6D88</button><button class="btn-confirm"${ssrIncludeBooleanAttr(!selectedAvatar.value || loading.value) ? " disabled" : ""} data-v-65d37024>${ssrInterpolate(loading.value ? "\u4FDD\u5B58\u4E2D..." : "\u786E\u5B9A")}</button></div></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ChangeAvatarModal.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const ChangeAvatarModal = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-65d37024"]]);
const useNavigation = () => {
  const router = useRouter();
  const route = useRoute();
  const safeNavigate = async (to, options) => {
    console.log("[Navigation] \u5C1D\u8BD5\u5BFC\u822A\u5230:", to);
    if (!to) {
      console.warn("[Navigation] \u76EE\u6807\u8DEF\u5F84\u4E3A\u7A7A");
      return false;
    }
    if (route.path === to) {
      console.log("[Navigation] \u5DF2\u5728\u76EE\u6807\u9875\u9762");
      return true;
    }
    try {
      await navigateTo(to, options);
      console.log("[Navigation] \u5BFC\u822A\u6210\u529F (navigateTo):", to);
      return true;
    } catch (error) {
      console.warn("[Navigation] navigateTo \u5931\u8D25:", error);
      try {
        await router.push(to);
        console.log("[Navigation] \u5BFC\u822A\u6210\u529F (router.push):", to);
        return true;
      } catch (routerError) {
        console.error("[Navigation] router.push \u4E5F\u5931\u8D25\u4E86:", routerError);
        return false;
      }
    }
  };
  const isActive = (path) => {
    return route.path === path || route.path.startsWith(path + "/");
  };
  const refreshPage = () => {
  };
  return {
    safeNavigate,
    isActive,
    refreshPage,
    currentPath: computed(() => route.path),
    currentRoute: computed(() => route)
  };
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "profile",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "\u4E2A\u4EBA\u4E2D\u5FC3 - \u51E1\u56FE\u62C9",
      meta: [
        { name: "description", content: "\u51E1\u56FE\u62C9\u4E2A\u4EBA\u4E2D\u5FC3\uFF0C\u7BA1\u7406\u60A8\u7684\u8D26\u6237\u4FE1\u606F\u3001\u8BA2\u5355\u3001\u4F59\u989D\u548C\u4F18\u60E0\u5238" },
        { name: "keywords", content: "\u4E2A\u4EBA\u4E2D\u5FC3,\u8D26\u6237\u7BA1\u7406,\u8BA2\u5355\u67E5\u8BE2,\u51E1\u56FE\u62C9" }
      ]
    });
    const userStore = useUserStore();
    useRouter();
    const route = useRoute();
    const showChangeAvatarModal = ref(false);
    const unreadCount = ref(0);
    const menuItems = computed(() => [
      { key: "profile", label: "\u4E2A\u4EBA\u4E2D\u5FC3", icon: "info1.png", to: "/profile" },
      { key: "wallet", label: "\u6211\u7684\u94B1\u5305", icon: "info2.png", to: "/profile/wallet" },
      { key: "orders", label: "\u6211\u7684\u8BA2\u5355", icon: "info3.png", to: "/profile/orders" },
      { key: "exchange", label: "\u5151\u6362\u4E2D\u5FC3", icon: "info4.png", to: "/profile/exchange" },
      { key: "referral", label: "\u8FD4\u73B0\u63A8\u5E7F", icon: "info5.png", to: "/profile/referral" },
      { key: "tickets", label: "\u6211\u7684\u5DE5\u5355", icon: "info6.png", to: "/profile/tickets" },
      { key: "favorites", label: "\u6211\u7684\u6536\u85CF", icon: "info7.png", to: "/profile/favorites" },
      { key: "messages", label: "\u6211\u7684\u6D88\u606F", icon: "info8.png", to: "/profile/messages", badge: unreadCount.value > 0 ? unreadCount.value : void 0 }
    ]);
    const isActive = (to) => {
      return route.path === to;
    };
    useNavigation();
    const handleAvatarModalClose = () => {
      showChangeAvatarModal.value = false;
      userStore.fetchUserInfo();
    };
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_AppHeader = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_NuxtPage = __nuxt_component_2$1;
      const _component_AppFooter = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "profile-page" }, _attrs))} data-v-b1630864>`);
      _push(ssrRenderComponent(_component_AppHeader, null, null, _parent));
      _push(`<div class="profile-container" data-v-b1630864><div class="profile-content" data-v-b1630864><div class="profile-sidebar" data-v-b1630864><div class="user-card" data-v-b1630864><div class="user-avatar-section" data-v-b1630864><img${ssrRenderAttr("src", ((_a = unref(userStore).user) == null ? void 0 : _a.avatar) || "/images/head1.png")}${ssrRenderAttr("alt", ((_b = unref(userStore).user) == null ? void 0 : _b.nickname) || "\u7528\u6237\u5934\u50CF")} class="user-avatar-large" data-v-b1630864><div class="user-basic-info" data-v-b1630864><h3 class="user-nickname" data-v-b1630864>${ssrInterpolate(((_c = unref(userStore).user) == null ? void 0 : _c.nickname) || "\u5F20\u5C0F\u660E")}</h3><p class="user-uid" data-v-b1630864>UID: ${ssrInterpolate(((_d = unref(userStore).user) == null ? void 0 : _d.id) || "87654321")}</p></div></div><button class="change-avatar-btn" data-v-b1630864>\u66F4\u6539\u5934\u50CF</button></div><nav class="sidebar-menu" data-v-b1630864><!--[-->`);
      ssrRenderList(menuItems.value, (item) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: item.key,
          to: item.to,
          class: ["menu-item", { active: isActive(item.to) }]
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (item == null ? void 0 : item.icon) {
                _push2(`<img${ssrRenderAttr("src", `/images/${item.icon}`)}${ssrRenderAttr("alt", (item == null ? void 0 : item.label) || "\u83DC\u5355\u9879")} class="menu-icon" data-v-b1630864${_scopeId}>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<span class="menu-text" data-v-b1630864${_scopeId}>${ssrInterpolate((item == null ? void 0 : item.label) || "\u672A\u77E5\u83DC\u5355")}</span>`);
              if (item == null ? void 0 : item.badge) {
                _push2(`<span class="menu-badge" data-v-b1630864${_scopeId}>${ssrInterpolate(item.badge)}</span>`);
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                (item == null ? void 0 : item.icon) ? (openBlock(), createBlock("img", {
                  key: 0,
                  src: `/images/${item.icon}`,
                  alt: (item == null ? void 0 : item.label) || "\u83DC\u5355\u9879",
                  class: "menu-icon"
                }, null, 8, ["src", "alt"])) : createCommentVNode("", true),
                createVNode("span", { class: "menu-text" }, toDisplayString((item == null ? void 0 : item.label) || "\u672A\u77E5\u83DC\u5355"), 1),
                (item == null ? void 0 : item.badge) ? (openBlock(), createBlock("span", {
                  key: 1,
                  class: "menu-badge"
                }, toDisplayString(item.badge), 1)) : createCommentVNode("", true)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></nav><button class="logout-btn" data-v-b1630864><i class="logout-icon" data-v-b1630864></i> \u9000\u51FA\u767B\u5F55 </button></div><div class="profile-main" data-v-b1630864>`);
      _push(ssrRenderComponent(_component_NuxtPage, null, null, _parent));
      _push(`</div></div></div>`);
      _push(ssrRenderComponent(_component_AppFooter, null, null, _parent));
      if (showChangeAvatarModal.value) {
        _push(ssrRenderComponent(ChangeAvatarModal, { onClose: handleAvatarModalClose }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/profile.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const profile = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-b1630864"]]);

export { profile as default };
//# sourceMappingURL=profile-CjscDiSd.mjs.map
