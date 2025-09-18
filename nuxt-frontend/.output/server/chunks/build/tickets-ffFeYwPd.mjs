import { defineComponent, ref, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderComponent, ssrRenderAttrs, ssrRenderAttr } from 'vue/server-renderer';
import { p as publicAssetsURL } from '../nitro/nitro.mjs';
import { _ as _export_sfc } from './server.mjs';
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

const _imports_0 = publicAssetsURL("/images/shenqing1.png");
const _imports_1 = publicAssetsURL("/images/shenqing2.png");
const _imports_2 = publicAssetsURL("/images/netflix.png");
const _imports_3 = publicAssetsURL("/images/shenqing3.png");
const _imports_4 = publicAssetsURL("/images/shenqing4.png");
const _imports_5 = publicAssetsURL("/images/shenqing5.png");
const _imports_6 = publicAssetsURL("/images/shenqing6.png");
const _imports_7 = publicAssetsURL("/images/shenqing7.png");
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "TicketApplyModal",
  __ssrInlineRender: true,
  setup(__props) {
    const issueType = ref("");
    const issuePriority = ref("\u4E2D");
    const issueDesc = ref("");
    const priorityLevels = [
      { label: "\u4F4E", value: "\u4F4E" },
      { label: "\u4E2D", value: "\u4E2D" },
      { label: "\u9AD8", value: "\u9AD8" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "modal-mask" }, _attrs))} data-v-4a395f83><div class="ticket-apply-modal" data-v-4a395f83><div class="modal-header" data-v-4a395f83><div class="modal-title" data-v-4a395f83>\u7533\u8BF7\u5DE5\u5355</div><div class="modal-subtitle" data-v-4a395f83>\u8BF7\u586B\u5199\u5DE5\u5355\u7533\u8BF7\u4FE1\u606F\uFF0C\u6211\u4EEC\u5C06\u5C3D\u5FEB\u4E3A\u60A8\u5904\u7406</div><button class="modal-close" data-v-4a395f83>\xD7</button></div><div class="modal-content" data-v-4a395f83><div class="modal-left" data-v-4a395f83><div class="order-info-title with-icon" data-v-4a395f83><img class="section-icon"${ssrRenderAttr("src", _imports_0)} alt="\u5173\u8054\u7CFB\u7EDF\u4FE1\u606F" data-v-4a395f83> \u5173\u8054\u7CFB\u7EDF\u4FE1\u606F </div><div class="order-info-row" data-v-4a395f83><span class="order-label" data-v-4a395f83>\u8BA2\u5355\u7F16\u53F7\uFF1A</span><span class="order-link" data-v-4a395f83>#O202306201234</span></div><div class="order-info-row" data-v-4a395f83><span class="order-label" data-v-4a395f83>\u4E0B\u5355\u65F6\u95F4\uFF1A</span><span class="order-value" data-v-4a395f83>2023-06-20 14:30</span></div><div class="order-info-row" data-v-4a395f83><span class="order-label" data-v-4a395f83>\u8BA2\u5355\u72B6\u6001\uFF1A</span><span class="order-status" data-v-4a395f83>\u5DF2\u53D1\u8D27</span></div><div class="order-info-row" data-v-4a395f83><span class="order-label" data-v-4a395f83>\u652F\u4ED8\u91D1\u989D\uFF1A</span><span class="order-amount" data-v-4a395f83>\uFFE5899.00</span></div><div class="order-info-title with-icon" data-v-4a395f83><img class="section-icon"${ssrRenderAttr("src", _imports_1)} alt="\u5173\u8054\u5546\u54C1" data-v-4a395f83> \u5173\u8054\u5546\u54C1 </div><div class="product-card" data-v-4a395f83><img class="product-img"${ssrRenderAttr("src", _imports_2)} alt="Netflix" data-v-4a395f83><div class="product-info" data-v-4a395f83><div class="product-name" data-v-4a395f83>Netflix\u6708\u4ED8\u7248</div><div class="product-price" data-v-4a395f83>\uFFE5899.00</div></div></div></div><div class="modal-right" data-v-4a395f83><div class="form-group" data-v-4a395f83><label class="form-label with-icon" data-v-4a395f83><img class="section-icon"${ssrRenderAttr("src", _imports_3)} alt="\u95EE\u9898\u7C7B\u578B" data-v-4a395f83> \u95EE\u9898\u7C7B\u578B<span class="required" data-v-4a395f83>*</span></label><input class="form-input"${ssrRenderAttr("value", issueType.value)} placeholder="" data-v-4a395f83></div><div class="form-group" data-v-4a395f83><label class="form-label with-icon" data-v-4a395f83><img class="section-icon"${ssrRenderAttr("src", _imports_4)} alt="\u95EE\u9898\u4F18\u5148\u7EA7" data-v-4a395f83> \u95EE\u9898\u4F18\u5148\u7EA7<span class="required" data-v-4a395f83>*</span></label><div class="priority-group" data-v-4a395f83><!--[-->`);
      ssrRenderList(priorityLevels, (level) => {
        _push(`<button class="${ssrRenderClass([{ active: issuePriority.value === level.value }, "priority-btn"])}" type="button" data-v-4a395f83>${ssrInterpolate(level.label)}</button>`);
      });
      _push(`<!--]--></div></div><div class="form-group" data-v-4a395f83><label class="form-label with-icon" data-v-4a395f83><img class="section-icon"${ssrRenderAttr("src", _imports_5)} alt="\u95EE\u9898\u63CF\u8FF0" data-v-4a395f83> \u95EE\u9898\u63CF\u8FF0<span class="required" data-v-4a395f83>*</span></label><textarea class="form-textarea" rows="4" placeholder="\u8BF7\u8BE6\u7EC6\u63CF\u8FF0\u60A8\u9047\u5230\u7684\u95EE\u9898\uFF0C\u5305\u62EC\u9519\u8BEF\u4FE1\u606F\u3001\u64CD\u4F5C\u6B65\u9AA4\u7B49\u2026\u2026" data-v-4a395f83>${ssrInterpolate(issueDesc.value)}</textarea></div><div class="form-group" data-v-4a395f83><label class="form-label with-icon" data-v-4a395f83><img class="section-icon"${ssrRenderAttr("src", _imports_6)} alt="\u6DFB\u52A0\u9644\u4EF6" data-v-4a395f83> \u6DFB\u52A0\u9644\u4EF6 </label><div class="upload-box" data-v-4a395f83><img class="upload-arrow"${ssrRenderAttr("src", _imports_7)} alt="\u4E0A\u4F20" data-v-4a395f83><div class="upload-tip" data-v-4a395f83>\u70B9\u51FB\u6216\u62D6\u62FD\u6587\u4EF6\u5230\u6B64\u5904\u4E0A\u4F20</div><div class="upload-desc" data-v-4a395f83>\u652F\u6301 JPG, PNG, GIF \u683C\u5F0F\uFF0C\u5355\u4E2A\u6587\u4EF6\u4E0D\u8D85\u8FC75MB</div></div></div></div></div><div class="modal-actions" data-v-4a395f83><button class="btn-cancel" data-v-4a395f83><svg class="btn-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" data-v-4a395f83><circle cx="10" cy="10" r="10" fill="#D9D9D9" data-v-4a395f83></circle><path d="M7.5 7.5L12.5 12.5M12.5 7.5L7.5 12.5" stroke="#888" stroke-width="1.5" stroke-linecap="round" data-v-4a395f83></path></svg> \u53D6\u6D88 </button><button class="btn-confirm" data-v-4a395f83><svg class="btn-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" data-v-4a395f83><path d="M3 10L17 3L10 17L9 11L3 10Z" fill="#fff" data-v-4a395f83></path><path d="M3 10L17 3L10 17L9 11L3 10Z" stroke="#fff" stroke-width="1.5" stroke-linejoin="round" data-v-4a395f83></path></svg> \u63D0\u4EA4\u5DE5\u5355 </button></div></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/TicketApplyModal.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const TicketApplyModal = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-4a395f83"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "tickets",
  __ssrInlineRender: true,
  setup(__props) {
    const tabs = [
      { key: "all", label: "\u5168\u90E8\u5DE5\u5355" },
      { key: "processing", label: "\u8FDB\u884C\u4E2D" },
      { key: "resolved", label: "\u5DF2\u89E3\u51B3" }
    ];
    const activeTab = ref("all");
    const tickets2 = ref([]);
    const filteredTickets = computed(() => {
      if (activeTab.value === "all") return tickets2.value;
      return tickets2.value.filter((ticket) => ticket.status === activeTab.value);
    });
    const showTicketApplyModal = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[--><div class="tickets-section" data-v-ac0f5066><div class="section-header" data-v-ac0f5066><h2 class="section-title" data-v-ac0f5066>\u6211\u7684\u5DE5\u5355</h2><button class="apply-btn" data-v-ac0f5066>+ \u7533\u8BF7\u5DE5\u5355</button></div><div class="tickets-tabs" data-v-ac0f5066><!--[-->`);
      ssrRenderList(tabs, (tab) => {
        _push(`<div class="${ssrRenderClass(["tab-item", { active: activeTab.value === tab.key }])}" data-v-ac0f5066>${ssrInterpolate(tab.label)}</div>`);
      });
      _push(`<!--]--></div><div class="tickets-list" data-v-ac0f5066><!--[-->`);
      ssrRenderList(filteredTickets.value, (ticket) => {
        _push(`<div class="${ssrRenderClass([ticket.statusClass, "ticket-card"])}" data-v-ac0f5066><div class="ticket-header-section" data-v-ac0f5066><span class="ticket-id" data-v-ac0f5066>\u5DE5\u5355 #${ssrInterpolate(ticket.id)}</span><div class="${ssrRenderClass([ticket.statusClass, "ticket-status-circle"])}" data-v-ac0f5066>${ssrInterpolate(ticket.statusText)}</div></div><div class="ticket-content-section" data-v-ac0f5066><div class="ticket-main-content" data-v-ac0f5066><div class="ticket-content" data-v-ac0f5066>${ssrInterpolate(ticket.content)}</div><div class="ticket-meta" data-v-ac0f5066><div class="meta-item" data-v-ac0f5066>\u63D0\u4EA4\u65F6\u95F4\uFF1A${ssrInterpolate(ticket.time)}</div><div class="meta-item" data-v-ac0f5066>\u5173\u8054\u8BA2\u5355\uFF1A<span class="order-link" data-v-ac0f5066>#${ssrInterpolate(ticket.orderId)}</span></div></div></div><div class="ticket-actions-right" data-v-ac0f5066><button class="action-btn-small view-detail" data-v-ac0f5066><i class="icon-view" data-v-ac0f5066></i> \u67E5\u770B\u8BE6\u60C5 </button>`);
        if (ticket.status === "processing") {
          _push(`<button class="action-btn-small add-reply" data-v-ac0f5066><i class="icon-reply" data-v-ac0f5066></i> \u6DFB\u52A0\u56DE\u590D </button>`);
        } else {
          _push(`<!---->`);
        }
        if (ticket.status === "resolved") {
          _push(`<button class="action-btn-small add-reply" data-v-ac0f5066><i class="icon-reply" data-v-ac0f5066></i> \u6DFB\u52A0\u56DE\u590D </button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div>`);
      });
      _push(`<!--]--></div></div>`);
      if (showTicketApplyModal.value) {
        _push(ssrRenderComponent(TicketApplyModal, {
          onClose: ($event) => showTicketApplyModal.value = false
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/profile/tickets.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const tickets = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ac0f5066"]]);

export { tickets as default };
//# sourceMappingURL=tickets-ffFeYwPd.mjs.map
