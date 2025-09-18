import { defineComponent, ref, resolveComponent, mergeProps, computed, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderClass, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { _ as _export_sfc, d as useUserStore, l as http } from './server.mjs';
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

const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "ChangePasswordModal",
  __ssrInlineRender: true,
  setup(__props) {
    const currentPassword = ref("");
    const newPassword = ref("");
    const confirmPassword = ref("");
    const strength = ref(0);
    const strengthText = computed(() => {
      const arr = ["\u5F31", "\u5F31", "\u4E2D", "\u5F3A", "\u5F88\u5F3A"];
      return arr[strength.value >= 0 && strength.value < arr.length ? strength.value : 0];
    });
    const strengthClass = computed(() => {
      const arr = ["weak", "weak", "medium", "strong", "very-strong"];
      return arr[strength.value >= 0 && strength.value < arr.length ? strength.value : 0];
    });
    const canSubmit = computed(() => {
      return currentPassword.value && newPassword.value.length >= 8 && /\d/.test(newPassword.value) && /[a-zA-Z]/.test(newPassword.value) && confirmPassword.value === newPassword.value;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "modal-mask" }, _attrs))} data-v-987f6635><div class="change-password-modal" data-v-987f6635><div class="modal-header-center" data-v-987f6635><span class="modal-title" data-v-987f6635>\u8D26\u6237\u5B89\u5168\u4E2D\u5FC3</span><div class="modal-title-underline" data-v-987f6635></div><div class="modal-subtitle" data-v-987f6635>\u7BA1\u7406\u60A8\u7684\u8D26\u6237\u5B89\u5168\u8BBE\u7F6E</div><button class="modal-close" data-v-987f6635>\xD7</button></div><form class="modal-form" data-v-987f6635><div class="form-group" data-v-987f6635><label class="form-label" data-v-987f6635>\u5F53\u524D\u5BC6\u7801</label><input type="password"${ssrRenderAttr("value", currentPassword.value)} class="form-input" placeholder="\u8BF7\u8F93\u5165\u5F53\u524D\u5BC6\u7801" data-v-987f6635></div><div class="form-group" data-v-987f6635><label class="form-label" data-v-987f6635>\u65B0\u5BC6\u7801</label><input type="password"${ssrRenderAttr("value", newPassword.value)} class="form-input" placeholder="\u8BF7\u8F93\u5165\u65B0\u5BC6\u7801" data-v-987f6635></div><div class="password-strength" data-v-987f6635> \u5BC6\u7801\u5F3A\u5EA6\uFF1A<span class="${ssrRenderClass(strengthClass.value)}" data-v-987f6635>${ssrInterpolate(strengthText.value)}</span></div><ul class="password-rules" data-v-987f6635><li class="${ssrRenderClass({ passed: newPassword.value.length >= 8 })}" data-v-987f6635>\u81F3\u5C118\u4E2A\u5B57\u7B26</li><li class="${ssrRenderClass({ passed: /\d/.test(newPassword.value) })}" data-v-987f6635>\u5305\u542B\u6570\u5B57</li><li class="${ssrRenderClass({ passed: /[a-zA-Z]/.test(newPassword.value) })}" data-v-987f6635>\u5305\u542B\u5B57\u6BCD</li><li class="${ssrRenderClass({ passed: /[^a-zA-Z0-9]/.test(newPassword.value) })}" data-v-987f6635>\u5305\u542B\u7279\u6B8A\u5B57\u7B26\uFF08\u53EF\u9009\uFF09</li></ul><div class="form-group" data-v-987f6635><label class="form-label" data-v-987f6635>\u786E\u8BA4\u65B0\u5BC6\u7801</label><input type="password"${ssrRenderAttr("value", confirmPassword.value)} class="form-input" placeholder="\u8BF7\u518D\u6B21\u8F93\u5165\u65B0\u5BC6\u7801" data-v-987f6635></div><div class="modal-actions" data-v-987f6635><button type="button" class="btn-cancel" data-v-987f6635>\u53D6\u6D88</button><button type="submit" class="btn-confirm"${ssrIncludeBooleanAttr(!canSubmit.value) ? " disabled" : ""} data-v-987f6635>\u66F4\u6539\u5BC6\u7801</button></div></form></div></div>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ChangePasswordModal.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const ChangePasswordModal = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-987f6635"]]);
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "BindEmailModal",
  __ssrInlineRender: true,
  setup(__props) {
    const code = ref("");
    const countdown = ref(0);
    ref(null);
    const timeLeft = ref("05:00");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "modal-mask" }, _attrs))} data-v-a492a0bc><div class="bind-email-modal" data-v-a492a0bc><div class="modal-header" data-v-a492a0bc><div class="modal-title" data-v-a492a0bc>\u7ED1\u5B9A\u90AE\u7BB1</div><div class="modal-subtitle" data-v-a492a0bc>\u9A8C\u8BC1\u90AE\u7BB1\u5730\u5740\u4EE5\u5B8C\u6210\u7ED1\u5B9A</div><button class="modal-close" data-v-a492a0bc>\xD7</button></div><div class="modal-content" data-v-a492a0bc><div class="email-box" data-v-a492a0bc><div class="email-label" data-v-a492a0bc>\u5F53\u524D\u7ED1\u5B9A\u90AE\u7BB1</div><div class="email-value" data-v-a492a0bc>user@example.com</div><button class="btn-send"${ssrIncludeBooleanAttr(countdown.value > 0) ? " disabled" : ""} data-v-a492a0bc>${ssrInterpolate(countdown.value > 0 ? `${countdown.value}s\u540E\u53EF\u91CD\u53D1` : "\u53D1\u9001\u9A8C\u8BC1\u7801")}</button></div><div class="form-group" data-v-a492a0bc><label class="form-label" data-v-a492a0bc>\u8BF7\u8F93\u5165\u9A8C\u8BC1\u7801</label><input class="form-input"${ssrRenderAttr("value", code.value)} maxlength="6" placeholder="6\u4F4D\u9A8C\u8BC1\u7801" data-v-a492a0bc><div class="code-tip" data-v-a492a0bc> \u9A8C\u8BC1\u7801\u5DF2\u53D1\u9001\u81F3\u90AE\u7BB1\uFF0C\u6709\u6548\u65F6\u95F4\uFF1A<span class="code-time" data-v-a492a0bc>${ssrInterpolate(timeLeft.value)}</span></div></div><div class="modal-actions" data-v-a492a0bc><button class="btn-cancel" data-v-a492a0bc>\u53D6\u6D88</button><button class="btn-confirm"${ssrIncludeBooleanAttr(!code.value || code.value.length !== 6) ? " disabled" : ""} data-v-a492a0bc>\u786E\u8BA4\u7ED1\u5B9A</button></div><div class="modal-footer-tip" data-v-a492a0bc> \u672A\u6536\u5230\u9A8C\u8BC1\u7801\uFF1F\u8BF7\u68C0\u67E5\u5783\u573E\u90AE\u4EF6\u6216 <span class="resend-link" data-v-a492a0bc>\u91CD\u65B0\u53D1\u9001</span><br data-v-a492a0bc> \u7ED1\u5B9A\u90AE\u7BB1\u53EF\u7528\u4E8E\u627E\u56DE\u5BC6\u7801\u548C\u63A5\u6536\u91CD\u8981\u901A\u77E5 </div></div></div></div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/BindEmailModal.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const BindEmailModal = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-a492a0bc"]]);
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ChangeNicknameModal",
  __ssrInlineRender: true,
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    var _a;
    const userStore = useUserStore();
    const nickname = ref(((_a = userStore.user) == null ? void 0 : _a.nickname) || "");
    const loading = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "modal-overlay" }, _attrs))} data-v-8ba279ac><div class="modal-container" data-v-8ba279ac><div class="modal-header" data-v-8ba279ac><h3 class="modal-title" data-v-8ba279ac>\u66F4\u6539\u6635\u79F0</h3><button class="modal-close" data-v-8ba279ac>\xD7</button></div><div class="modal-body" data-v-8ba279ac><div class="form-group" data-v-8ba279ac><label class="form-label" data-v-8ba279ac>\u65B0\u6635\u79F0</label><input${ssrRenderAttr("value", nickname.value)} type="text" class="form-input" placeholder="\u8BF7\u8F93\u5165\u65B0\u6635\u79F0" maxlength="20" data-v-8ba279ac><p class="form-hint" data-v-8ba279ac>\u6635\u79F0\u957F\u5EA6\u4E0D\u8D85\u8FC720\u4E2A\u5B57\u7B26</p></div></div><div class="modal-footer" data-v-8ba279ac><button class="btn-cancel" data-v-8ba279ac>\u53D6\u6D88</button><button class="btn-confirm"${ssrIncludeBooleanAttr(!nickname.value || loading.value) ? " disabled" : ""} data-v-8ba279ac>${ssrInterpolate(loading.value ? "\u4FDD\u5B58\u4E2D..." : "\u786E\u5B9A")}</button></div></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ChangeNicknameModal.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const ChangeNicknameModal = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-8ba279ac"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const userInfo = ref({});
    const showChangePassword = ref(false);
    const showBindEmailModal = ref(false);
    const showChangeNicknameModal = ref(false);
    const fetchUserInfo = async () => {
      const res = await http.get("/user/info");
      if (res && res.data) userInfo.value = res.data;
    };
    const handleNicknameModalClose = () => {
      showChangeNicknameModal.value = false;
      fetchUserInfo();
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NotificationBell = resolveComponent("NotificationBell");
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "info-section" }, _attrs))} data-v-19bec5da><div class="section-header" data-v-19bec5da><h2 class="section-title" data-v-19bec5da>\u4E2A\u4EBA\u4FE1\u606F</h2><div class="header-actions" data-v-19bec5da>`);
      _push(ssrRenderComponent(_component_NotificationBell, null, null, _parent));
      _push(`<button class="change-password-btn" data-v-19bec5da>\u66F4\u6539\u5BC6\u7801</button></div></div><div class="info-content" data-v-19bec5da><div class="info-field" data-v-19bec5da><label class="field-label" data-v-19bec5da>\u5934\u50CF</label><div class="avatar-info" data-v-19bec5da><img${ssrRenderAttr("src", userInfo.value.avatar || "/images/head1.png")} alt="\u5934\u50CF" class="info-avatar" data-v-19bec5da><span class="avatar-name" data-v-19bec5da>${ssrInterpolate(userInfo.value.nickname || "\u5F20\u5C0F\u660E")}</span><button class="change-nickname-btn" data-v-19bec5da>\u66F4\u6539\u6635\u79F0</button></div></div><div class="info-field" data-v-19bec5da><label class="field-label" data-v-19bec5da>UID</label><div class="input-container" data-v-19bec5da><input type="text" class="info-input"${ssrRenderAttr("value", userInfo.value.id || "87654321")} readonly data-v-19bec5da></div></div><div class="info-field" data-v-19bec5da><label class="field-label" data-v-19bec5da>\u7ED1\u5B9A\u90AE\u7BB1</label><div class="input-container" data-v-19bec5da><input type="email" class="info-input"${ssrRenderAttr("value", userInfo.value.email || "user@example.com")} readonly data-v-19bec5da><button class="bind-email-btn" data-v-19bec5da>\u7ED1\u5B9A\u90AE\u7BB1</button></div></div><div class="info-field" data-v-19bec5da><label class="field-label" data-v-19bec5da>\u7ED1\u5B9A\u793E\u4EA4\u5A92\u4F53</label><div class="input-container" data-v-19bec5da><div class="social-items" data-v-19bec5da><span class="social-tag" data-v-19bec5da>\u5DF2\u7ED1\u5B9A\u5FAE\u4FE1\uFF1AXXXX</span><span class="social-tag" data-v-19bec5da>\u5DF2\u7ED1\u5B9A\u5FAE\u4FE1\uFF1AXXXX</span><span class="social-tag" data-v-19bec5da>\u5DF2\u7ED1\u5B9A\u5FAE\u4FE1\uFF1AXXXX</span></div><button class="change-binding-btn" data-v-19bec5da>\u66F4\u6539\u7ED1\u5B9A</button></div></div><div class="danger-section" data-v-19bec5da><div class="danger-content" data-v-19bec5da><button class="delete-account-btn" data-v-19bec5da>\u6CE8\u9500\u8D26\u53F7</button><p class="warning-text" data-v-19bec5da><i class="warning-icon" data-v-19bec5da>\u26A0</i> \u4E00\u65E6\u6CE8\u9500\u65E0\u6CD5\u6062\u590D </p></div></div></div>`);
      if (showChangePassword.value) {
        _push(ssrRenderComponent(ChangePasswordModal, {
          onClose: ($event) => showChangePassword.value = false
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (showBindEmailModal.value) {
        _push(ssrRenderComponent(BindEmailModal, {
          onClose: ($event) => showBindEmailModal.value = false
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (showChangeNicknameModal.value) {
        _push(ssrRenderComponent(ChangeNicknameModal, { onClose: handleNicknameModalClose }, null, _parent));
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/profile/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-19bec5da"]]);

export { index as default };
//# sourceMappingURL=index-rTf-SWPz.mjs.map
