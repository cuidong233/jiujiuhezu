import { defineComponent, ref, reactive, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { _ as _export_sfc } from './server.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ReceiptModal",
  __ssrInlineRender: true,
  props: {
    orderNo: {
      type: String,
      required: true
    },
    productName: {
      type: String,
      default: ""
    },
    isViewing: {
      type: Boolean,
      default: false
    },
    receiptId: {
      type: String,
      default: ""
    }
  },
  emits: ["close", "success"],
  setup(__props, { emit: __emit }) {
    const loading = ref(false);
    const formData = reactive({});
    const receiptFields = ref([]);
    const existingReceipt = ref(null);
    const isModification = ref(false);
    const modificationReason = ref("");
    const passwordVisible = reactive({});
    const canModify = computed(() => {
      if (!existingReceipt.value) return false;
      return existingReceipt.value.receiptData && Object.keys(existingReceipt.value.receiptData).length > 0 && (!existingReceipt.value.modificationRequest || existingReceipt.value.modificationRequest.status === "rejected");
    });
    const getStatusClass = (status) => {
      const map = {
        "pending": "status-pending",
        "completed": "status-completed",
        "processing": "status-processing"
      };
      return map[status] || "status-default";
    };
    const getStatusText = (status) => {
      const map = {
        "pending": "\u5F85\u586B\u5199",
        "completed": "\u5DF2\u586B\u5199",
        "processing": "\u5904\u7406\u4E2D"
      };
      return map[status] || status;
    };
    const getModStatusClass = (status) => {
      const map = {
        "pending": "mod-pending",
        "approved": "mod-approved",
        "rejected": "mod-rejected"
      };
      return map[status] || "mod-default";
    };
    const getModStatusText = (status) => {
      const map = {
        "pending": "\u5BA1\u6838\u4E2D",
        "approved": "\u5DF2\u901A\u8FC7",
        "rejected": "\u5DF2\u62D2\u7EDD"
      };
      return map[status] || status;
    };
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "modal-mask" }, _attrs))} data-v-7b39a669><div class="receipt-modal" data-v-7b39a669><div class="modal-header" data-v-7b39a669><h3 data-v-7b39a669>${ssrInterpolate(isModification.value ? "\u7533\u8BF7\u4FEE\u6539\u56DE\u6267\u5355" : ((_a = existingReceipt.value) == null ? void 0 : _a.receiptData) ? "\u67E5\u770B\u56DE\u6267\u5355" : "\u586B\u5199\u56DE\u6267\u5355\u4FE1\u606F")}</h3><span class="close-btn" data-v-7b39a669>\xD7</span></div><div class="modal-body" data-v-7b39a669><div class="order-info" data-v-7b39a669><div class="info-item" data-v-7b39a669><span class="label" data-v-7b39a669>\u8BA2\u5355\u7F16\u53F7\uFF1A</span><span class="value" data-v-7b39a669>${ssrInterpolate(__props.orderNo)}</span></div><div class="info-item" data-v-7b39a669><span class="label" data-v-7b39a669>\u5546\u54C1\u540D\u79F0\uFF1A</span><span class="value" data-v-7b39a669>${ssrInterpolate(__props.productName)}</span></div></div><div class="receipt-form" data-v-7b39a669><!--[-->`);
      ssrRenderList(receiptFields.value, (field, index) => {
        var _a2, _b2, _c, _d, _e;
        _push(`<div class="form-item" data-v-7b39a669><label class="${ssrRenderClass({ "required": field.required })}" data-v-7b39a669>${ssrInterpolate(field.label)}</label>`);
        if (field.type === "password") {
          _push(`<div class="password-input-wrapper" data-v-7b39a669><input${ssrRenderAttr("type", passwordVisible[field.key] ? "text" : "password")}${ssrRenderAttr("value", formData[field.key] || "")}${ssrRenderAttr("placeholder", field.placeholder)}${ssrIncludeBooleanAttr(field.required) ? " required" : ""}${ssrIncludeBooleanAttr(__props.isViewing && ((_a2 = existingReceipt.value) == null ? void 0 : _a2.receiptData) && !isModification.value) ? " disabled" : ""} class="password-input" data-v-7b39a669><button type="button" class="password-toggle"${ssrIncludeBooleanAttr(__props.isViewing && ((_b2 = existingReceipt.value) == null ? void 0 : _b2.receiptData) && !isModification.value) ? " disabled" : ""} data-v-7b39a669>${ssrInterpolate(passwordVisible[field.key] ? "\u{1F648}" : "\u{1F441}\uFE0F")}</button></div>`);
        } else if (field.type === "text" || field.type === "email") {
          _push(`<input${ssrRenderAttr("type", field.type)}${ssrRenderAttr("value", formData[field.key] || "")}${ssrRenderAttr("placeholder", field.placeholder)}${ssrIncludeBooleanAttr(field.required) ? " required" : ""}${ssrIncludeBooleanAttr(__props.isViewing && ((_c = existingReceipt.value) == null ? void 0 : _c.receiptData) && !isModification.value) ? " disabled" : ""} data-v-7b39a669>`);
        } else if (field.type === "textarea") {
          _push(`<textarea${ssrRenderAttr("placeholder", field.placeholder)}${ssrIncludeBooleanAttr(field.required) ? " required" : ""}${ssrIncludeBooleanAttr(__props.isViewing && ((_d = existingReceipt.value) == null ? void 0 : _d.receiptData) && !isModification.value) ? " disabled" : ""} rows="3" data-v-7b39a669>${ssrInterpolate(formData[field.key] || "")}</textarea>`);
        } else if (field.type === "select") {
          _push(`<select${ssrRenderAttr("value", formData[field.key] || "")}${ssrIncludeBooleanAttr(field.required) ? " required" : ""}${ssrIncludeBooleanAttr(__props.isViewing && ((_e = existingReceipt.value) == null ? void 0 : _e.receiptData) && !isModification.value) ? " disabled" : ""} data-v-7b39a669><option value="" data-v-7b39a669>\u8BF7\u9009\u62E9</option><!--[-->`);
          ssrRenderList(field.options, (option) => {
            _push(`<option${ssrRenderAttr("value", option.value)} data-v-7b39a669>${ssrInterpolate(option.label)}</option>`);
          });
          _push(`<!--]--></select>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]-->`);
      if (isModification.value) {
        _push(`<div class="form-item" data-v-7b39a669><label class="required" data-v-7b39a669>\u4FEE\u6539\u539F\u56E0</label><textarea placeholder="\u8BF7\u8BF4\u660E\u4FEE\u6539\u539F\u56E0" required rows="3" data-v-7b39a669>${ssrInterpolate(modificationReason.value)}</textarea></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (existingReceipt.value && !isModification.value) {
        _push(`<div class="receipt-status" data-v-7b39a669><div class="status-info" data-v-7b39a669><span class="status-label" data-v-7b39a669>\u56DE\u6267\u72B6\u6001\uFF1A</span><span class="${ssrRenderClass(["status-value", getStatusClass(existingReceipt.value.status)])}" data-v-7b39a669>${ssrInterpolate(getStatusText(existingReceipt.value.status))}</span></div>`);
        if (existingReceipt.value.modificationRequest) {
          _push(`<div class="modification-info" data-v-7b39a669><span class="mod-label" data-v-7b39a669>\u4FEE\u6539\u7533\u8BF7\uFF1A</span><span class="${ssrRenderClass(["mod-status", getModStatusClass(existingReceipt.value.modificationRequest.status)])}" data-v-7b39a669>${ssrInterpolate(getModStatusText(existingReceipt.value.modificationRequest.status))}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="modal-footer" data-v-7b39a669>`);
      if (!__props.isViewing || !((_b = existingReceipt.value) == null ? void 0 : _b.receiptData) || isModification.value) {
        _push(`<button class="submit-btn"${ssrIncludeBooleanAttr(loading.value) ? " disabled" : ""} data-v-7b39a669>${ssrInterpolate(loading.value ? "\u63D0\u4EA4\u4E2D..." : isModification.value ? "\u63D0\u4EA4\u4FEE\u6539\u7533\u8BF7" : "\u63D0\u4EA4\u56DE\u6267\u5355")}</button>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.isViewing && canModify.value && !isModification.value) {
        _push(`<button class="modify-btn" data-v-7b39a669> \u7533\u8BF7\u4FEE\u6539 </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="cancel-btn" data-v-7b39a669>${ssrInterpolate(__props.isViewing && !isModification.value ? "\u5173\u95ED" : "\u53D6\u6D88")}</button></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ReceiptModal.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ReceiptModal = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-7b39a669"]]);

export { ReceiptModal as R };
//# sourceMappingURL=ReceiptModal-ppj2k2En.mjs.map
