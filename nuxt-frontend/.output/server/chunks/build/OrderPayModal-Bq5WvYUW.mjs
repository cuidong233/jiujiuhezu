import { defineComponent, ref, computed, mergeProps, watch, nextTick, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderComponent } from 'vue/server-renderer';
import { _ as _imports_1 } from './virtual_public-rJCVlDvA.mjs';
import { _ as _imports_0 } from './virtual_public-DvjXfd9G.mjs';
import { p as publicAssetsURL } from '../nitro/nitro.mjs';
import { P as PaySuccessModal } from './PaySuccessModal-CTEodsrH.mjs';
import QRCode from 'qrcode';
import { _ as _export_sfc, d as useUserStore } from './server.mjs';

const intervalError = "[nuxt] `setInterval` should not be used on the server. Consider wrapping it with an `onNuxtReady`, `onBeforeMount` or `onMounted` lifecycle hook, or ensure you only call it in the browser by checking `false`.";
const setInterval = () => {
  console.error(intervalError);
};
const _imports_2 = publicAssetsURL("/images/zhifu3.png");
const _sfc_main$2 = {
  __name: "WechatQRPayModal",
  __ssrInlineRender: true,
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    codeUrl: {
      type: String,
      default: ""
    },
    amount: {
      type: [String, Number],
      default: 0
    },
    orderId: {
      type: String,
      default: ""
    }
  },
  emits: ["close", "success"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const qrCanvas = ref(null);
    const loading = ref(false);
    const checking = ref(false);
    const generateQR = async (url) => {
      if (!url || !qrCanvas.value) return;
      loading.value = true;
      try {
        await QRCode.toCanvas(qrCanvas.value, url, {
          width: 200,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF"
          }
        });
      } catch (err) {
        console.error("\u751F\u6210\u4E8C\u7EF4\u7801\u5931\u8D25:", err);
      } finally {
        loading.value = false;
      }
    };
    watch(() => props.codeUrl, async (newUrl) => {
      if (newUrl && props.visible) {
        await nextTick();
        generateQR(newUrl);
      }
    });
    watch(() => props.visible, async (newVal) => {
      if (newVal && props.codeUrl) {
        await nextTick();
        generateQR(props.codeUrl);
      }
    });
    let checkTimer = null;
    const startCheckStatus = () => {
      if (checkTimer) return;
      console.log("\u{1F504} \u5F00\u59CB\u8F6E\u8BE2\u5FAE\u4FE1\u652F\u4ED8\u72B6\u6001\uFF0C\u8BA2\u5355\u53F7:", props.orderId);
      checkTimer = setInterval();
    };
    const stopCheckStatus = () => {
      if (checkTimer) {
        clearInterval(checkTimer);
        checkTimer = null;
      }
    };
    watch(() => props.visible, (newVal) => {
      if (newVal) {
        startCheckStatus();
      } else {
        stopCheckStatus();
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.visible) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "qr-pay-modal" }, _attrs))} data-v-0a66776b><div class="modal-overlay" data-v-0a66776b></div><div class="modal-content" data-v-0a66776b><div class="modal-header" data-v-0a66776b><h3 data-v-0a66776b>\u5FAE\u4FE1\u626B\u7801\u652F\u4ED8</h3><button class="close-btn" data-v-0a66776b>\xD7</button></div><div class="modal-body" data-v-0a66776b><div class="qr-container" data-v-0a66776b><canvas data-v-0a66776b></canvas>`);
        if (loading.value) {
          _push(`<div class="loading" data-v-0a66776b>\u751F\u6210\u4E8C\u7EF4\u7801\u4E2D...</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="pay-info" data-v-0a66776b><p class="amount" data-v-0a66776b>\u652F\u4ED8\u91D1\u989D\uFF1A<span data-v-0a66776b>\uFFE5${ssrInterpolate(__props.amount)}</span></p><p class="tips" data-v-0a66776b>\u8BF7\u4F7F\u7528\u5FAE\u4FE1\u626B\u63CF\u4E8C\u7EF4\u7801\u5B8C\u6210\u652F\u4ED8</p>`);
        if (checking.value) {
          _push(`<div class="status-checking" data-v-0a66776b><span class="checking-icon" data-v-0a66776b>\u23F3</span><span data-v-0a66776b>\u6B63\u5728\u68C0\u67E5\u652F\u4ED8\u72B6\u6001...</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="pay-steps" data-v-0a66776b><div class="step" data-v-0a66776b><span class="step-num" data-v-0a66776b>1</span><span data-v-0a66776b>\u6253\u5F00\u5FAE\u4FE1</span></div><div class="step" data-v-0a66776b><span class="step-num" data-v-0a66776b>2</span><span data-v-0a66776b>\u626B\u63CF\u4E8C\u7EF4\u7801</span></div><div class="step" data-v-0a66776b><span class="step-num" data-v-0a66776b>3</span><span data-v-0a66776b>\u786E\u8BA4\u652F\u4ED8</span></div></div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/WechatQRPayModal.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const WechatQRPayModal = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-0a66776b"]]);
const _sfc_main$1 = {
  __name: "AlipayQRPayModal",
  __ssrInlineRender: true,
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    payUrl: {
      type: String,
      default: ""
    },
    amount: {
      type: [String, Number],
      default: 0
    },
    orderId: {
      type: String,
      default: ""
    }
  },
  emits: ["close", "success"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const qrCanvas = ref(null);
    const loading = ref(false);
    const generateQR = async (url) => {
      if (!url || !qrCanvas.value) return;
      loading.value = true;
      try {
        let qrData = url;
        if (url.startsWith("data:image")) {
          console.error("\u6536\u5230\u56FE\u7247\u6570\u636E\u800C\u975E\u652F\u4ED8\u94FE\u63A5\uFF0C\u65E0\u6CD5\u751F\u6210\u4E8C\u7EF4\u7801");
          throw new Error("\u6570\u636E\u683C\u5F0F\u9519\u8BEF");
        }
        console.log("\u751F\u6210\u652F\u4ED8\u5B9D\u4E8C\u7EF4\u7801\uFF0C\u5185\u5BB9:", qrData);
        await QRCode.toCanvas(qrCanvas.value, qrData, {
          width: 220,
          margin: 2,
          color: {
            dark: "#1677ff",
            light: "#FFFFFF"
          },
          errorCorrectionLevel: "M"
        });
        console.log("\u2705 \u652F\u4ED8\u5B9D\u4E8C\u7EF4\u7801\u751F\u6210\u6210\u529F");
      } catch (err) {
        console.error("\u751F\u6210\u652F\u4ED8\u5B9D\u4E8C\u7EF4\u7801\u5931\u8D25:", err);
        if (qrCanvas.value) {
          const ctx = qrCanvas.value.getContext("2d");
          ctx.clearRect(0, 0, qrCanvas.value.width, qrCanvas.value.height);
          qrCanvas.value.width = 220;
          qrCanvas.value.height = 220;
          ctx.fillStyle = "#f5f5f5";
          ctx.fillRect(0, 0, 220, 220);
          ctx.fillStyle = "#999";
          ctx.font = "14px Arial";
          ctx.textAlign = "center";
          ctx.fillText("\u4E8C\u7EF4\u7801\u751F\u6210\u5931\u8D25", 110, 100);
          ctx.fillText("\u8BF7\u5237\u65B0\u91CD\u8BD5", 110, 120);
        }
      } finally {
        loading.value = false;
      }
    };
    watch(() => props.payUrl, async (newUrl) => {
      if (newUrl && props.visible) {
        await nextTick();
        generateQR(newUrl);
      }
    });
    watch(() => props.visible, async (newVal) => {
      if (newVal && props.payUrl) {
        await nextTick();
        generateQR(props.payUrl);
      }
    });
    let checkTimer = null;
    const startCheckStatus = () => {
      if (checkTimer) return;
      checkTimer = setInterval();
    };
    const stopCheckStatus = () => {
      if (checkTimer) {
        clearInterval(checkTimer);
        checkTimer = null;
      }
    };
    watch(() => props.visible, (newVal) => {
      if (newVal) {
        startCheckStatus();
      } else {
        stopCheckStatus();
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.visible) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "qr-pay-modal" }, _attrs))} data-v-83bfae48><div class="modal-overlay" data-v-83bfae48></div><div class="modal-content" data-v-83bfae48><div class="modal-header" data-v-83bfae48><div class="header-title" data-v-83bfae48><div class="alipay-logo" data-v-83bfae48><svg width="24" height="24" viewBox="0 0 24 24" fill="none" data-v-83bfae48><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#1677ff" data-v-83bfae48></path></svg></div><h3 data-v-83bfae48>\u652F\u4ED8\u5B9D\u626B\u7801\u652F\u4ED8</h3></div><button class="close-btn" data-v-83bfae48>\xD7</button></div><div class="modal-body" data-v-83bfae48><div class="qr-container" data-v-83bfae48><div class="qr-wrapper" data-v-83bfae48><canvas data-v-83bfae48></canvas>`);
        if (loading.value) {
          _push(`<div class="loading" data-v-83bfae48><div class="loading-spinner" data-v-83bfae48></div><span data-v-83bfae48>\u751F\u6210\u4E8C\u7EF4\u7801\u4E2D...</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="pay-info" data-v-83bfae48><p class="amount" data-v-83bfae48>\u652F\u4ED8\u91D1\u989D\uFF1A<span data-v-83bfae48>\uFFE5${ssrInterpolate(__props.amount)}</span></p><p class="order-info" data-v-83bfae48>\u8BA2\u5355\u53F7\uFF1A${ssrInterpolate(__props.orderId)}</p><p class="tips" data-v-83bfae48>\u8BF7\u4F7F\u7528\u652F\u4ED8\u5B9D\u626B\u63CF\u4E8C\u7EF4\u7801\u5B8C\u6210\u652F\u4ED8</p></div><div class="pay-steps" data-v-83bfae48><div class="step" data-v-83bfae48><span class="step-num" data-v-83bfae48>1</span><span data-v-83bfae48>\u6253\u5F00\u652F\u4ED8\u5B9D</span></div><div class="step" data-v-83bfae48><span class="step-num" data-v-83bfae48>2</span><span data-v-83bfae48>\u626B\u63CF\u4E8C\u7EF4\u7801</span></div><div class="step" data-v-83bfae48><span class="step-num" data-v-83bfae48>3</span><span data-v-83bfae48>\u786E\u8BA4\u652F\u4ED8</span></div></div><div class="security-tip" data-v-83bfae48><svg width="16" height="16" viewBox="0 0 16 16" fill="#1677ff" data-v-83bfae48><path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8S12.4 0 8 0zm1 12H7V7h2v5zm0-6H7V4h2v2z" data-v-83bfae48></path></svg><span data-v-83bfae48>\u652F\u4ED8\u5B9D\u5B89\u5168\u4FDD\u969C\uFF0C\u8BF7\u653E\u5FC3\u652F\u4ED8</span></div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AlipayQRPayModal.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const AlipayQRPayModal = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-83bfae48"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "OrderPayModal",
  __ssrInlineRender: true,
  props: {
    shopLogo: { type: String, default: "/images/shop-logo.png" },
    shopName: { type: String, default: "\u67D0\u65D7\u8230\u5E97" },
    shopDesc: { type: String, default: "" },
    orderId: { type: String, default: "" },
    price: { type: [String, Number], default: "" },
    countdown: { type: Number, default: 900 }
    // 秒
  },
  emits: ["close", "timeout", "paySuccess"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    useUserStore();
    const payType = ref("wechat");
    const remain = ref(props.countdown);
    const showSuccessModal = ref(false);
    const paying = ref(false);
    const showQRModal = ref(false);
    const wechatCodeUrl = ref("");
    const showAlipayQRModal = ref(false);
    const alipayCodeUrl = ref("");
    const countdownText = computed(() => {
      const m = String(Math.floor(remain.value / 60)).padStart(2, "0");
      const s = String(remain.value % 60).padStart(2, "0");
      return `${m}:${s}`;
    });
    function handleSuccessClose() {
      showSuccessModal.value = false;
      emits("close");
    }
    function handleWechatPaySuccess() {
      showQRModal.value = false;
      showSuccessModal.value = true;
      emits("paySuccess", {
        orderId: props.orderId,
        payType: "wechat",
        amount: props.price
      });
    }
    function handleAlipayPaySuccess() {
      showAlipayQRModal.value = false;
      showSuccessModal.value = true;
      emits("paySuccess", {
        orderId: props.orderId,
        payType: "alipay",
        amount: props.price
      });
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "modal-mask" }, _attrs))} data-v-7c6ae04d><div class="order-pay-modal" data-v-7c6ae04d><div class="modal-header" data-v-7c6ae04d><div class="modal-title" data-v-7c6ae04d>\u8BA2\u5355\u652F\u4ED8</div><div class="modal-subtitle" data-v-7c6ae04d>\u8BF7\u9009\u62E9\u652F\u4ED8\u65B9\u5F0F\u5B8C\u6210\u4ED8\u6B3E</div><button class="modal-close" data-v-7c6ae04d>\xD7</button></div><div class="modal-content" data-v-7c6ae04d><div class="order-info-bar" data-v-7c6ae04d><img class="shop-logo"${ssrRenderAttr("src", __props.shopLogo)} alt="logo" data-v-7c6ae04d><div class="shop-info" data-v-7c6ae04d><div class="shop-name" data-v-7c6ae04d>${ssrInterpolate(__props.shopName)}</div><div class="shop-desc" data-v-7c6ae04d>${ssrInterpolate(__props.shopDesc)}</div><div class="order-id" data-v-7c6ae04d>\u8BA2\u5355\u53F7\uFF1A#${ssrInterpolate(__props.orderId)}</div></div><div class="order-amount" data-v-7c6ae04d>\uFFE5${ssrInterpolate(__props.price)}</div></div><div class="pay-section" data-v-7c6ae04d><div class="pay-title" data-v-7c6ae04d>\u9009\u62E9\u652F\u4ED8\u65B9\u5F0F</div><div class="pay-methods" data-v-7c6ae04d><div class="${ssrRenderClass(["pay-method", payType.value === "wechat" ? "active" : ""])}" data-v-7c6ae04d><img class="pay-icon"${ssrRenderAttr("src", _imports_1)} alt="\u5FAE\u4FE1\u652F\u4ED8" data-v-7c6ae04d><div class="pay-label" data-v-7c6ae04d>\u5FAE\u4FE1\u652F\u4ED8</div><div class="pay-desc" data-v-7c6ae04d>\u63A8\u8350\u5FAE\u4FE1\u7528\u6237\u4F7F\u7528</div>`);
      if (payType.value === "wechat") {
        _push(`<div class="pay-checked" data-v-7c6ae04d></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="${ssrRenderClass(["pay-method", payType.value === "alipay" ? "active" : ""])}" data-v-7c6ae04d><img class="pay-icon"${ssrRenderAttr("src", _imports_0)} alt="\u652F\u4ED8\u5B9D" data-v-7c6ae04d><div class="pay-label" data-v-7c6ae04d>\u652F\u4ED8\u5B9D\u652F\u4ED8</div><div class="pay-desc" data-v-7c6ae04d>\u63A8\u8350\u5DF2\u5B89\u88C5\u652F\u4ED8\u5B9D\u7684\u7528\u6237\u4F7F\u7528</div>`);
      if (payType.value === "alipay") {
        _push(`<div class="pay-checked" data-v-7c6ae04d></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="${ssrRenderClass(["pay-method", payType.value === "binance" ? "active" : ""])}" data-v-7c6ae04d><img class="pay-icon"${ssrRenderAttr("src", _imports_2)} alt="\u5E01\u5B89\u652F\u4ED8" data-v-7c6ae04d><div class="pay-label" data-v-7c6ae04d>\u5E01\u5B89\u652F\u4ED8</div><div class="pay-desc" data-v-7c6ae04d>\u652F\u6301USDT\u7B49\u52A0\u5BC6\u8D27\u5E01\u652F\u4ED8</div>`);
      if (payType.value === "binance") {
        _push(`<div class="pay-checked" data-v-7c6ae04d></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div><div class="pay-bottom" data-v-7c6ae04d><button class="btn-pay"${ssrIncludeBooleanAttr(paying.value) ? " disabled" : ""} data-v-7c6ae04d>`);
      if (!paying.value) {
        _push(`<span data-v-7c6ae04d>\u786E\u8BA4\u652F\u4ED8\uFFE5${ssrInterpolate(__props.price)}</span>`);
      } else {
        _push(`<span data-v-7c6ae04d>\u652F\u4ED8\u4E2D...</span>`);
      }
      _push(`</button><div class="pay-countdown" data-v-7c6ae04d> \u652F\u4ED8\u5269\u4F59\u65F6\u95F4\uFF1A<span class="countdown" data-v-7c6ae04d>${ssrInterpolate(countdownText.value)}</span></div><div class="pay-tip" data-v-7c6ae04d> \u70B9\u51FB\u652F\u4ED8\u5373\u8868\u793A\u60A8\u5DF2\u540C\u610F <a href="#" class="pay-link" data-v-7c6ae04d>\u300A\u652F\u4ED8\u670D\u52A1\u534F\u8BAE\u300B</a></div></div></div></div>`);
      if (showSuccessModal.value) {
        _push(ssrRenderComponent(PaySuccessModal, {
          orderId: props.orderId || "DEFAULT_ORDER",
          payType: payType.value,
          amount: props.price || 0,
          onClose: handleSuccessClose
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(WechatQRPayModal, {
        visible: showQRModal.value,
        codeUrl: wechatCodeUrl.value,
        amount: props.price,
        orderId: props.orderId,
        onClose: ($event) => showQRModal.value = false,
        onSuccess: handleWechatPaySuccess
      }, null, _parent));
      _push(ssrRenderComponent(AlipayQRPayModal, {
        visible: showAlipayQRModal.value,
        payUrl: alipayCodeUrl.value,
        amount: props.price,
        orderId: props.orderId,
        onClose: ($event) => showAlipayQRModal.value = false,
        onSuccess: handleAlipayPaySuccess
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/OrderPayModal.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const OrderPayModal = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-7c6ae04d"]]);

export { OrderPayModal as O, setInterval as s };
//# sourceMappingURL=OrderPayModal-Bq5WvYUW.mjs.map
