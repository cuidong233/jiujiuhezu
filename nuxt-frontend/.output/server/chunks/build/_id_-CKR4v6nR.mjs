import { _ as __nuxt_component_0, b as __nuxt_component_0$1, a as __nuxt_component_1 } from './AppFooter-DftAiZQA.mjs';
import { defineComponent, computed, ref, watch, nextTick, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderStyle, ssrRenderAttr } from 'vue/server-renderer';
import { _ as _export_sfc, g as useCartStore, f as useModalStore, d as useUserStore, b as useRuntimeConfig, h as __nuxt_component_2 } from './server.mjs';
import { O as OrderPayModal } from './OrderPayModal-Bq5WvYUW.mjs';
import { P as PaySuccessModal } from './PaySuccessModal-CTEodsrH.mjs';
import { useRouter, useRoute } from 'vue-router';
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
import './virtual_public-DvjXfd9G.mjs';
import 'qrcode';
import './ReceiptModal-ppj2k2En.mjs';

const payCountdown = 900;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    useCartStore();
    const modal = useModalStore();
    useRouter();
    const route = useRoute();
    const userStore = useUserStore();
    const goodsId = computed(() => Number(route.params.id) || 1);
    const goodsData = ref({ success: false, data: null, msg: "" });
    const goodsError = ref(null);
    const goodsPending = ref(true);
    const fetchGoodsDetail = async () => {
      goodsPending.value = true;
      goodsError.value = null;
      console.log("\u{1F504} \u5F00\u59CB\u8BF7\u6C42\u5546\u54C1\u8BE6\u60C5, \u5546\u54C1ID:", goodsId.value);
      const timeout = setTimeout(() => {
        console.log("\u8BF7\u6C42\u8D85\u65F6\uFF0C\u4F7F\u7528\u9ED8\u8BA4\u6570\u636E");
        goodsData.value = {
          success: true,
          data: {
            id: goodsId.value,
            title: "Netflix \u9AD8\u7EA7\u4F1A\u5458",
            price: 99,
            description: "\u5168\u7403\u6700\u5927\u7684\u6D41\u5A92\u4F53\u5E73\u53F0"
          },
          msg: "timeout"
        };
        goodsPending.value = false;
      }, 5e3);
      try {
        const apiUrl = `/api/product/${goodsId.value}`;
        console.log("\u8BF7\u6C42URL:", apiUrl);
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        clearTimeout(timeout);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("\u2705 \u5546\u54C1\u8BE6\u60C5\u8BF7\u6C42\u6210\u529F:", data);
        goodsData.value = data;
      } catch (error) {
        clearTimeout(timeout);
        console.error("\u274C \u5546\u54C1\u8BE6\u60C5\u8BF7\u6C42\u5931\u8D25:", error);
        goodsData.value = {
          success: true,
          data: {
            id: goodsId.value,
            title: "\u5546\u54C1\u52A0\u8F7D\u4E2D",
            price: 88,
            description: "\u5546\u54C1\u4FE1\u606F"
          },
          msg: "error"
        };
      } finally {
        goodsPending.value = false;
      }
    };
    watch(goodsId, async (newId, oldId) => {
      console.log("\u{1F504} \u8DEF\u7531\u53D8\u5316 - \u5546\u54C1ID\u4ECE", oldId, "\u53D8\u4E3A", newId);
      if (newId && newId !== oldId) {
        productSkus.value = { specifications: null, skus: [] };
        selectedSku.value = null;
        selectedSpecs.value = {};
        await fetchGoodsDetail();
        await fetchProductSkus();
        await fetchRecommendGoods();
      }
    }, { immediate: false });
    const goodsInfo = computed(() => {
      if (goodsData.value && goodsData.value.success && goodsData.value.data) {
        const data = goodsData.value.data;
        let imageUrl = data.image || data.coverImage || "/images/xiangqingzhutu1.png";
        if (imageUrl && !imageUrl.startsWith("http") && !imageUrl.startsWith("/")) {
          imageUrl = "/" + imageUrl;
        }
        if (imageUrl === "/images/netflix.png") {
          imageUrl = "/images/xiangqingzhutu1.png";
        }
        return {
          id: data.id,
          goods_code: data.goods_code,
          // 添加商品编码字段
          name: data.title || data.name,
          image: imageUrl,
          desc: data.description || "\u5546\u54C1\u63CF\u8FF0",
          region: "\u7F8E\u56FD/\u9999\u6E2F/\u53F0\u6E7E",
          // 这些字段可能需要从后端获取
          quality: "4K \u8D85\u9AD8\u6E05",
          devices: "4\u53F0\u540C\u65F6\u5728\u7EBF",
          download: "\u662F",
          prices: [
            { label: "\u6708\u4ED8", value: `\xA5${data.price || 35}` },
            { label: "\u5B63\u4ED8", value: `\xA5${(parseFloat(data.price) || 35) * 3}` },
            { label: "\u5E74\u4ED8", value: `\xA5${(parseFloat(data.price) || 35) * 12}` }
          ],
          hot: data.status === 1,
          price: parseFloat(data.price) || 35,
          sales: data.sales || 0,
          // 新增销售量
          skus: data.skus ? typeof data.skus === "string" ? JSON.parse(data.skus) : data.skus : null,
          // 添加SKU数据
          deliveryRequiresReceipt: data.deliveryRequiresReceipt || false
          // 是否为代充商品
        };
      }
      return {
        id: goodsId.value,
        name: "\u5546\u54C1\u52A0\u8F7D\u4E2D...",
        image: "/images/xiangqingzhutu1.png",
        desc: "\u6B63\u5728\u52A0\u8F7D\u5546\u54C1\u4FE1\u606F\uFF0C\u8BF7\u7A0D\u5019...",
        region: "\u5168\u7403",
        quality: "\u9AD8\u54C1\u8D28",
        devices: "\u591A\u8BBE\u5907",
        download: "\u652F\u6301",
        prices: [
          { label: "\u5957\u9910", value: "\xA5--" }
        ],
        hot: false,
        price: 0,
        sales: 0
      };
    });
    const images = computed(() => {
      if (goodsData.value && goodsData.value.success && goodsData.value.data) {
        const data = goodsData.value.data;
        let imgs = [];
        if (Array.isArray(data.images)) {
          imgs = data.images.filter((img) => !!img);
        } else if (Array.isArray(data.imageList)) {
          imgs = data.imageList.filter((img) => !!img);
        } else if (data.coverImage || data.image) {
          imgs = [data.coverImage || data.image];
        }
        if (!imgs.length) imgs = ["/images/xiangqingzhutu1.png"];
        return imgs;
      }
      return ["/images/xiangqingzhutu1.png"];
    });
    const selectedImage = ref("");
    watch(images, (val) => {
      selectedImage.value = val && val.length > 0 ? val[0] : "/images/xiangqingzhutu1.png";
    }, { immediate: true });
    const qty = ref(1);
    const selectedSku = ref(null);
    const selectedSpecs = ref({});
    const productSkus = ref({ specifications: null, skus: [] });
    watch(productSkus, (newVal) => {
      console.log("\u{1F4CA} productSkus\u53D8\u5316\u4E86:", newVal);
      console.log("\u{1F4CA} SKU\u6570\u91CF:", newVal.skus ? newVal.skus.length : 0);
    }, { deep: true, immediate: true });
    const availableSkus = computed(() => {
      if (!productSkus.value.skus || productSkus.value.skus.length === 0) {
        return [];
      }
      return productSkus.value.skus.filter((sku) => sku.status === 1 && sku.stock > 0).sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    });
    const displayPrice = computed(() => {
      var _a, _b, _c, _d;
      if (selectedSku.value) {
        return selectedSku.value.price;
      }
      if (((_b = (_a = goodsData.value) == null ? void 0 : _a.data) == null ? void 0 : _b.min_sku_price) !== void 0 && ((_d = (_c = goodsData.value) == null ? void 0 : _c.data) == null ? void 0 : _d.min_sku_price) !== null) {
        return goodsData.value.data.min_sku_price;
      }
      if (availableSkus.value.length > 0) {
        return availableSkus.value[0].price;
      }
      return goodsInfo.value.price || "0.00";
    });
    const getSkuBadge = (sku) => {
      if (sku.sku_name.includes("\u5E74")) return "\u6700\u5212\u7B97";
      if (sku.sku_name.includes("3\u4E2A\u6708")) return "\u5B63\u5EA6\u4F18\u60E0";
      return "";
    };
    const recommends = ref([]);
    const recommendsLoading = ref(false);
    const fetchRecommendGoods = async () => {
      recommendsLoading.value = true;
      try {
        const config = useRuntimeConfig();
        const response = await fetch(`${config.public.apiBase}/product/goods?page=1&limit=10&isRecommend=true`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.code === 0 && result.data) {
          const allGoods = result.data.list || result.data.records || result.data || [];
          const currentId = Number(goodsId.value);
          console.log("\u5F53\u524D\u5546\u54C1ID:", currentId);
          console.log("\u6240\u6709\u5546\u54C1:", allGoods.map((item) => ({ id: item.goodsId || item.id, name: item.name || item.title })));
          const filteredGoods = allGoods.filter((item) => {
            const itemId = Number(item.goodsId || item.id);
            return itemId !== currentId && !isNaN(itemId);
          }).slice(0, 4).map((item) => ({
            id: item.goodsId || item.id,
            name: item.name || item.title || "\u5546\u54C1",
            price: item.price ? `\uFFE5${item.price}${item.duration ? "/" + item.duration : ""}` : "\uFFE50",
            image: item.image || item.coverImage || "/images/netflix.png"
          }));
          console.log("\u8FC7\u6EE4\u540E\u7684\u63A8\u8350\u5546\u54C1:", filteredGoods);
          recommends.value = filteredGoods.length > 0 ? filteredGoods : [
            // 如果没有获取到数据，使用默认推荐（确保ID不与当前商品冲突）
            { id: currentId === 101 ? 102 : 101, name: "Netflix", price: "\uFFE535/\u6708", image: "/images/netflix.png" },
            { id: currentId === 102 ? 103 : 102, name: "Disney+", price: "\uFFE5199/\u5E74", image: "/images/netflix.png" },
            { id: currentId === 103 ? 104 : 103, name: "YouTube Premium", price: "\uFFE5240/\u5E74", image: "/images/netflix.png" },
            { id: currentId === 104 ? 105 : 104, name: "HBO Max", price: "\uFFE5189/\u5E74", image: "/images/netflix.png" }
          ].filter((item) => item.id !== currentId);
        } else {
          const currentId = Number(goodsId.value);
          recommends.value = [
            { id: currentId === 101 ? 102 : 101, name: "Netflix", price: "\uFFE535/\u6708", image: "/images/netflix.png" },
            { id: currentId === 102 ? 103 : 102, name: "Disney+", price: "\uFFE5199/\u5E74", image: "/images/netflix.png" },
            { id: currentId === 103 ? 104 : 103, name: "YouTube Premium", price: "\uFFE5240/\u5E74", image: "/images/netflix.png" },
            { id: currentId === 104 ? 105 : 104, name: "HBO Max", price: "\uFFE5189/\u5E74", image: "/images/netflix.png" }
          ].filter((item) => item.id !== currentId);
        }
      } catch (error) {
        console.error("\u83B7\u53D6\u63A8\u8350\u5546\u54C1\u5931\u8D25:", error);
        const currentId = Number(goodsId.value);
        recommends.value = [
          { id: currentId === 101 ? 102 : 101, name: "Netflix", price: "\uFFE535/\u6708", image: "/images/netflix.png" },
          { id: currentId === 102 ? 103 : 102, name: "Disney+", price: "\uFFE5199/\u5E74", image: "/images/netflix.png" },
          { id: currentId === 103 ? 104 : 103, name: "YouTube Premium", price: "\uFFE5240/\u5E74", image: "/images/netflix.png" },
          { id: currentId === 104 ? 105 : 104, name: "HBO Max", price: "\uFFE5189/\u5E74", image: "/images/netflix.png" }
        ].filter((item) => item.id !== currentId);
      } finally {
        recommendsLoading.value = false;
      }
    };
    const showPayModal = ref(false);
    const payGoods = ref({});
    const showPaySuccessModal = ref(false);
    const paySuccessOrder = ref({
      orderId: "",
      amount: 0,
      payType: "alipay",
      productName: "",
      productType: ""
    });
    function handlePayClose() {
      showPayModal.value = false;
    }
    function handlePaySuccessClose() {
      showPaySuccessModal.value = false;
    }
    function handlePayTimeout() {
      showPayModal.value = false;
    }
    function handlePaySuccess(paymentInfo) {
      var _a, _b;
      console.log("\u{1F4B0} \u5546\u54C1\u8BE6\u60C5\u9875\u652F\u4ED8\u6210\u529F\uFF01", paymentInfo);
      showPayModal.value = false;
      const isRecharge = goodsInfo.value.deliveryRequiresReceipt || goodsInfo.value.isProxyRecharge || ((_a = goodsInfo.value.name) == null ? void 0 : _a.includes("\u4EE3\u5145")) || ((_b = goodsInfo.value.name) == null ? void 0 : _b.includes("\u5145\u503C"));
      paySuccessOrder.value = {
        orderId: paymentInfo.orderId || payGoods.value.orderId,
        amount: paymentInfo.amount || displayPrice.value,
        payType: paymentInfo.payType || "alipay",
        productName: goodsInfo.value.name,
        // 关键：根据 deliveryRequiresReceipt 判断是否为代充商品
        productType: isRecharge ? "recharge" : "normal"
      };
      console.log("\u{1F4E6} \u652F\u4ED8\u6210\u529F\u8BA2\u5355\u4FE1\u606F:", paySuccessOrder.value);
      console.log("\u{1F3AF} \u662F\u5426\u4E3A\u4EE3\u5145\u5546\u54C1:", isRecharge);
      showPaySuccessModal.value = true;
    }
    const fetchProductSkus = async () => {
      try {
        const currentId = goodsId.value;
        console.log("\u{1F50D} \u5F00\u59CB\u83B7\u53D6\u5546\u54C1SKU - \u5546\u54C1ID:", currentId);
        productSkus.value = { specifications: null, skus: [] };
        selectedSku.value = null;
        const apiUrl = `/api/product/goods/${currentId}/skus`;
        console.log("\u{1F50D} \u8BF7\u6C42SKU URL:", apiUrl);
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("\u2705 SKU\u6570\u636E\u8BF7\u6C42\u6210\u529F:", data);
        if (data && (data.success || data.code === 0)) {
          const skuInfo = data.data || {};
          const skuList = skuInfo.skus || [];
          console.log("\u{1F4E6} \u539F\u59CBSKU\u6570\u91CF:", skuList.length);
          productSkus.value = {
            specifications: skuInfo.specifications || null,
            skus: skuList
          };
          await nextTick();
          console.log("\u{1F3AF} \u8BBE\u7F6E\u540E\u7684SKU\u6570\u636E:", {
            specifications: productSkus.value.specifications,
            skuCount: productSkus.value.skus.length,
            skus: productSkus.value.skus
          });
          const validSkus = productSkus.value.skus.filter(
            (sku) => sku.status === 1
          );
          if (validSkus.length > 0) {
            validSkus.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            selectedSku.value = validSkus[0];
            console.log("\u2705 \u81EA\u52A8\u9009\u4E2DSKU:", selectedSku.value.sku_name);
          } else {
            console.log("\u26A0\uFE0F \u6CA1\u6709\u53EF\u7528\u7684SKU\uFF08\u5E93\u5B58\u4E0D\u8DB3\u6216\u5DF2\u4E0B\u67B6\uFF09");
          }
        } else {
          console.warn("\u26A0\uFE0F SKU\u6570\u636E\u8FD4\u56DE\u683C\u5F0F\u5F02\u5E38:", data);
          productSkus.value = { specifications: null, skus: [] };
        }
      } catch (error) {
        console.error("\u274C \u83B7\u53D6SKU\u4FE1\u606F\u5931\u8D25:", error);
        productSkus.value = { specifications: null, skus: [] };
        selectedSku.value = null;
      }
    };
    const isFavorited = computed(() => userStore.checkIsFavorite(goodsId.value));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_OptimizedImage = __nuxt_component_0$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "goods-detail-page" }, _attrs))} data-v-e2d3fcb8>`);
      _push(ssrRenderComponent(__nuxt_component_0, null, null, _parent));
      if (goodsPending.value) {
        _push(`<div class="loading-container" data-v-e2d3fcb8><div class="loading-spinner" data-v-e2d3fcb8>\u52A0\u8F7D\u4E2D...</div></div>`);
      } else if (goodsError.value) {
        _push(`<div class="error-container" data-v-e2d3fcb8><div class="error-message" data-v-e2d3fcb8><h3 data-v-e2d3fcb8>\u52A0\u8F7D\u5931\u8D25</h3><p data-v-e2d3fcb8>${ssrInterpolate(goodsError.value.message || "\u5546\u54C1\u4FE1\u606F\u52A0\u8F7D\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5")}</p><button class="retry-btn" data-v-e2d3fcb8>\u91CD\u65B0\u52A0\u8F7D</button></div></div>`);
      } else {
        _push(`<div class="goods-content" data-v-e2d3fcb8><div class="back-btn-row" data-v-e2d3fcb8><button class="back-btn" data-v-e2d3fcb8><span class="back-btn-icon" data-v-e2d3fcb8><svg width="32" height="32" viewBox="0 0 32 32" fill="none" data-v-e2d3fcb8><circle cx="16" cy="16" r="15" stroke="#2563EB" stroke-width="2" fill="#fff" data-v-e2d3fcb8></circle><path d="M18.5 10L13 16L18.5 22" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-e2d3fcb8></path></svg></span><span class="back-btn-text" data-v-e2d3fcb8>\u8FD4\u56DE</span></button></div>`);
        if (goodsError.value) {
          _push(`<div class="api-error-notice" data-v-e2d3fcb8><div class="error-notice-content" data-v-e2d3fcb8><span class="error-icon" data-v-e2d3fcb8>\u26A0\uFE0F</span><span class="error-text" data-v-e2d3fcb8>API\u8FDE\u63A5\u5931\u8D25\uFF0C\u663E\u793A\u9ED8\u8BA4\u5546\u54C1\u4FE1\u606F</span><button class="retry-small-btn" data-v-e2d3fcb8>\u91CD\u8BD5</button></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="goods-detail-content" data-v-e2d3fcb8><div class="goods-main-section" data-v-e2d3fcb8><div class="goods-left-panel" data-v-e2d3fcb8><div class="features-bar" data-v-e2d3fcb8><div class="features-list" data-v-e2d3fcb8><div class="feature-item" data-v-e2d3fcb8><span class="feature-icon" data-v-e2d3fcb8>`);
        _push(ssrRenderComponent(_component_OptimizedImage, {
          src: "/images/xiangqing1.png",
          alt: "\u51E1\u56FE\u62C9\u4E13\u4E1A\u6280\u672F\u56E2\u961F - 7x24\u5C0F\u65F6\u6280\u672F\u652F\u6301\u4FDD\u969C",
          title: "\u4E13\u4E1A\u6280\u672F\u56E2\u961F\u652F\u6301",
          width: 48,
          height: 48,
          preset: "icon"
        }, null, _parent));
        _push(`</span><span class="feature-label" data-v-e2d3fcb8>\u5927\u56E2\u961F\u5F00\u53D1</span></div><div class="feature-item" data-v-e2d3fcb8><span class="feature-icon" data-v-e2d3fcb8>`);
        _push(ssrRenderComponent(_component_OptimizedImage, {
          src: "/images/xiangqing2.png",
          alt: "\u51E1\u56FE\u62C9\u4EBA\u5DE5\u5BA2\u670D - \u4E00\u5BF9\u4E00\u4E13\u4E1A\u670D\u52A1\u652F\u6301",
          title: "\u4EBA\u5DE5\u5BA2\u670D\u5728\u7EBF\u652F\u6301",
          width: 48,
          height: 48,
          preset: "icon"
        }, null, _parent));
        _push(`</span><span class="feature-label" data-v-e2d3fcb8>\u4EBA\u5DE5\u5BA2\u670D\u670D\u52A1</span></div><div class="feature-item" data-v-e2d3fcb8><span class="feature-icon" data-v-e2d3fcb8>`);
        _push(ssrRenderComponent(_component_OptimizedImage, {
          src: "/images/xiangqing3.png",
          alt: "\u51E1\u56FE\u62C9\u5B89\u5168\u4FDD\u969C - \u6B63\u54C1\u4FDD\u8BC1\u53EF\u4FE1\u8D56\u5E73\u53F0",
          title: "\u5B89\u5168\u53EF\u4FE1\u8D56\u7684\u5927\u5E73\u53F0",
          width: 48,
          height: 48,
          preset: "icon"
        }, null, _parent));
        _push(`</span><span class="feature-label" data-v-e2d3fcb8>\u5927\u5E73\u53F0\u66F4\u653E\u5FC3</span></div><div class="feature-item" data-v-e2d3fcb8><span class="feature-icon" data-v-e2d3fcb8>`);
        _push(ssrRenderComponent(_component_OptimizedImage, {
          src: "/images/xiangqing4.png",
          alt: "\u51E1\u56FE\u62C9\u5168\u7F51\u8986\u76D6 - \u6781\u901F\u53D1\u8D27\u5168\u7403\u670D\u52A1",
          title: "\u5168\u7F51\u77E9\u9635\u670D\u52A1",
          width: 48,
          height: 48,
          preset: "icon"
        }, null, _parent));
        _push(`</span><span class="feature-label" data-v-e2d3fcb8>\u5168\u7F51\u77E9\u9635</span></div></div></div><div class="main-image-wrapper" data-v-e2d3fcb8><div class="main-image" data-v-e2d3fcb8>`);
        _push(ssrRenderComponent(_component_OptimizedImage, {
          src: selectedImage.value || "/images/xiangqingzhutu1.png",
          alt: `${goodsInfo.value.name || "\u5546\u54C1"} - \u9AD8\u6E05\u4EA7\u54C1\u5C55\u793A\u56FE - \u51E1\u56FE\u62C9\u6B63\u54C1`,
          title: `\u67E5\u770B${goodsInfo.value.name || "\u5546\u54C1"}\u5927\u56FE`,
          "product-name": goodsInfo.value.name,
          category: goodsInfo.value.category,
          "seo-keywords": ["Netflix", "\u6D41\u5A92\u4F53", "4K\u9AD8\u6E05", "\u6B63\u54C1\u4FDD\u8BC1"],
          width: 600,
          height: 600,
          loading: "eager",
          preset: "productMain",
          class: "main-product-image"
        }, null, _parent));
        _push(`</div><div class="thumb-list" data-v-e2d3fcb8><!--[-->`);
        ssrRenderList(images.value, (img, idx) => {
          _push(`<div class="${ssrRenderClass(["thumb", { active: selectedImage.value === img }])}" data-v-e2d3fcb8>`);
          if (img) {
            _push(ssrRenderComponent(_component_OptimizedImage, {
              src: img,
              alt: `${goodsInfo.value.name || "\u5546\u54C1"}\u7F29\u7565\u56FE ${idx + 1}`,
              title: `\u70B9\u51FB\u67E5\u770B\u56FE\u7247 ${idx + 1}`,
              width: 100,
              height: 100,
              preset: "productThumb",
              class: "thumb-img"
            }, null, _parent));
          } else {
            _push(`<div class="thumb-placeholder" data-v-e2d3fcb8></div>`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div></div><div class="service-bar" data-v-e2d3fcb8><div class="service-list" data-v-e2d3fcb8><span class="service-item" data-v-e2d3fcb8>\u5B98\u65B9\u91C7\u8D2D\u30FB\u6B63\u54C1\u4FDD\u969C</span><span class="service-item" data-v-e2d3fcb8>\u5168\u7A0B\u8D28\u4FDD\u30FB\u65E0\u5FE7\u552E\u540E</span><span class="service-item" data-v-e2d3fcb8>\u5927\u5E73\u53F0\u66F4\u653E\u5FC3</span><span class="service-item" data-v-e2d3fcb8>\u5168\u7F51\u77E9\u9635\u30FB\u6781\u901F\u53D1\u8D27</span><span class="service-item" data-v-e2d3fcb8>7\u5929\u65E0\u7406\u7531\u9000\u6362</span><span class="service-item" data-v-e2d3fcb8>\u5047\u4E00\u8D54\u5341</span></div></div></div><div class="goods-info-panel" data-v-e2d3fcb8><div class="goods-title-row" data-v-e2d3fcb8><span class="goods-title" data-v-e2d3fcb8>${ssrInterpolate(goodsInfo.value.name)}</span><span class="goods-sold" data-v-e2d3fcb8>\u5DF2\u552E${ssrInterpolate(goodsInfo.value.sales || "150354")}</span></div><div class="market-bar" data-v-e2d3fcb8>\u4E70\u4E86\u8F66\u7968\u6CA1\u8D26\u53F7\u7684\uFF1F</div><div class="goods-meta-row" data-v-e2d3fcb8><span class="goods-rating" data-v-e2d3fcb8>4.9 <span class="meta-light" data-v-e2d3fcb8>(1280\u6761\u8BC4\u4EF7)</span></span><span class="meta-light" data-v-e2d3fcb8>\u5168\u7403\u89E3\u9501</span><span class="meta-light" data-v-e2d3fcb8>4K\u9AD8\u6E05</span></div><div class="goods-final-price-row" data-v-e2d3fcb8><div class="row-label-bar" data-v-e2d3fcb8><span class="blue-bar" data-v-e2d3fcb8></span><span class="goods-price-label" data-v-e2d3fcb8>\u4EF7\u683C</span></div><span class="goods-final-price" data-v-e2d3fcb8>\uFFE5${ssrInterpolate(displayPrice.value)}</span>`);
        if (selectedSku.value && selectedSku.value.expire_days) {
          _push(`<span class="price-period" data-v-e2d3fcb8>/ ${ssrInterpolate(selectedSku.value.expire_days)}\u5929</span>`);
        } else {
          _push(`<!---->`);
        }
        if (goodsInfo.value.deliveryRequiresReceipt) {
          _push(`<span class="recharge-badge" data-v-e2d3fcb8>\u4EE3\u5145\u5546\u54C1</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        {
          _push(`<!---->`);
        }
        if (!goodsInfo.value.deliveryRequiresReceipt && productSkus.value.skus && productSkus.value.skus.length > 0) {
          _push(`<div class="goods-sku-row" data-v-e2d3fcb8><div class="row-label-bar" data-v-e2d3fcb8><span class="blue-bar" data-v-e2d3fcb8></span><span class="goods-sku-label" data-v-e2d3fcb8>\u9009\u62E9\u5957\u9910</span></div><div class="sku-direct-list" data-v-e2d3fcb8><!--[-->`);
          ssrRenderList(productSkus.value.skus.filter((s) => s.status === 1), (sku) => {
            var _a;
            _push(`<div class="${ssrRenderClass([{
              active: ((_a = selectedSku.value) == null ? void 0 : _a.sku_id) === sku.sku_id,
              "out-of-stock": sku.stock <= 0
            }, "sku-option-card"])}" data-v-e2d3fcb8><div class="sku-option-header" data-v-e2d3fcb8><span class="sku-option-name" data-v-e2d3fcb8>${ssrInterpolate(sku.sku_name)}</span>`);
            if (sku.stock <= 0) {
              _push(`<span class="sku-option-badge" data-v-e2d3fcb8>\u7F3A\u8D27</span>`);
            } else if (getSkuBadge(sku)) {
              _push(`<span class="sku-option-badge" data-v-e2d3fcb8>${ssrInterpolate(getSkuBadge(sku))}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="sku-option-price" data-v-e2d3fcb8>\uFFE5${ssrInterpolate(sku.price)}</div>`);
            if (sku.sku_description) {
              _push(`<div class="sku-option-desc" data-v-e2d3fcb8>${ssrInterpolate(sku.sku_description)}</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<div class="sku-option-footer" data-v-e2d3fcb8><span class="${ssrRenderClass([{ "no-stock": sku.stock <= 0 }, "sku-stock"])}" data-v-e2d3fcb8> \u5E93\u5B58: ${ssrInterpolate(sku.stock > 0 ? sku.stock + "\u4EF6" : "\u7F3A\u8D27")}</span>`);
            if (sku.sales > 0) {
              _push(`<span class="sku-sales" data-v-e2d3fcb8>\u5DF2\u552E: ${ssrInterpolate(sku.sales)}\u4EF6</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div>`);
          });
          _push(`<!--]--></div>`);
          if (selectedSku.value) {
            _push(`<div class="selected-sku-detail" data-v-e2d3fcb8><div class="sku-detail-title" data-v-e2d3fcb8>\u5F53\u524D\u9009\u62E9</div><div class="sku-detail-content" data-v-e2d3fcb8><div class="sku-detail-item" data-v-e2d3fcb8><span class="detail-label" data-v-e2d3fcb8>\u5957\u9910\u540D\u79F0\uFF1A</span><span class="detail-value" data-v-e2d3fcb8>${ssrInterpolate(selectedSku.value.sku_name)}</span></div><div class="sku-detail-item" data-v-e2d3fcb8><span class="detail-label" data-v-e2d3fcb8>\u5957\u9910\u4EF7\u683C\uFF1A</span><span class="detail-value price" data-v-e2d3fcb8>\uFFE5${ssrInterpolate(selectedSku.value.price)}</span></div>`);
            if (selectedSku.value.expire_days) {
              _push(`<div class="sku-detail-item" data-v-e2d3fcb8><span class="detail-label" data-v-e2d3fcb8>\u6709\u6548\u671F\u9650\uFF1A</span><span class="detail-value" data-v-e2d3fcb8>${ssrInterpolate(selectedSku.value.expire_days)}\u5929</span></div>`);
            } else {
              _push(`<!---->`);
            }
            if (selectedSku.value.license_count && selectedSku.value.license_count > 1) {
              _push(`<div class="sku-detail-item" data-v-e2d3fcb8><span class="detail-label" data-v-e2d3fcb8>\u8BBE\u5907\u6570\u91CF\uFF1A</span><span class="detail-value" data-v-e2d3fcb8>${ssrInterpolate(selectedSku.value.license_count)}\u53F0\u8BBE\u5907</span></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="goods-qty-row" data-v-e2d3fcb8><div class="row-label-bar" data-v-e2d3fcb8><span class="blue-bar" data-v-e2d3fcb8></span><span class="goods-qty-label" data-v-e2d3fcb8>\u8D2D\u4E70\u6570\u91CF</span></div><button class="qty-btn" data-v-e2d3fcb8>-</button><span class="qty-value" data-v-e2d3fcb8>${ssrInterpolate(qty.value)}</span><button class="qty-btn" data-v-e2d3fcb8>+</button></div><div class="goods-action-row" data-v-e2d3fcb8><button class="buy-btn" data-v-e2d3fcb8>\u7ACB\u5373\u8D2D\u4E70</button><button class="cart-btn" data-v-e2d3fcb8>\u52A0\u5165\u8D2D\u7269\u8F66</button><button class="${ssrRenderClass([{ active: isFavorited.value }, "fav-btn"])}" data-v-e2d3fcb8><span class="fav-icon" data-v-e2d3fcb8>${ssrInterpolate(isFavorited.value ? "\u2665" : "\u2661")}</span> ${ssrInterpolate(isFavorited.value ? "\u5DF2\u6536\u85CF" : "\u6536\u85CF")}</button></div><div class="goods-disclaimer" data-v-e2d3fcb8> \u672C\u7AD9\u6240\u5C55\u793A\u7684\u6240\u6709\u5FBD\u6807\uFF64\u5546\u6807\u53CA\u76F8\u5173\u8BC6\u522B\u6807\u5FD7\u5747\u5F52\u5404\u2F83\u6743\u5229\u2F08\u6240\u6709\uFF0C\u7248\u6743\u5F52\u539F\u516C\u53F8\u53CA\u5176\u9644\u5C5E\u673A\u6784\u6240\u6709 </div><div class="goods-bottom-section" data-v-e2d3fcb8><div class="recommend-section" data-v-e2d3fcb8><div class="row-label-bar" data-v-e2d3fcb8><span class="blue-bar" data-v-e2d3fcb8></span><span class="recommend-title" data-v-e2d3fcb8>\u63A8\u8350\u642D\u914D</span></div><div class="recommend-list" data-v-e2d3fcb8>`);
        if (recommendsLoading.value) {
          _push(`<div class="recommend-loading" data-v-e2d3fcb8><span data-v-e2d3fcb8>\u52A0\u8F7D\u63A8\u8350\u5546\u54C1\u4E2D...</span></div>`);
        } else if (recommends.value.length === 0) {
          _push(`<div class="recommend-empty" data-v-e2d3fcb8><span data-v-e2d3fcb8>\u6682\u65E0\u63A8\u8350\u5546\u54C1</span></div>`);
        } else {
          _push(`<!--[-->`);
          ssrRenderList(recommends.value, (item) => {
            _push(`<div class="recommend-item" style="${ssrRenderStyle({ "cursor": "pointer" })}" data-v-e2d3fcb8><div class="recommend-thumb" data-v-e2d3fcb8>`);
            if (item.image) {
              _push(`<img${ssrRenderAttr("src", item.image)}${ssrRenderAttr("alt", item.name)} style="${ssrRenderStyle({ "width": "100%", "height": "100%", "object-fit": "cover", "border-radius": "8px" })}" data-v-e2d3fcb8>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="recommend-name" data-v-e2d3fcb8>${ssrInterpolate(item.name)}</div><div class="recommend-price" data-v-e2d3fcb8>${ssrInterpolate(item.price)}</div></div>`);
          });
          _push(`<!--]-->`);
        }
        _push(`</div></div></div></div></div></div><div class="super-detail-image" data-v-e2d3fcb8><div class="super-detail-content" data-v-e2d3fcb8>\u5546\u54C1\u8BE6\u60C5</div></div>`);
        _push(ssrRenderComponent(__nuxt_component_1, null, null, _parent));
        _push(ssrRenderComponent(__nuxt_component_2, {
          visible: unref(modal).showLogin,
          onClose: ($event) => unref(modal).closeLogin()
        }, null, _parent));
        if (showPayModal.value) {
          _push(ssrRenderComponent(OrderPayModal, {
            shopLogo: payGoods.value.shopLogo,
            shopName: payGoods.value.shopName,
            shopDesc: payGoods.value.shopDesc,
            orderId: payGoods.value.orderId,
            price: payGoods.value.price,
            countdown: payCountdown,
            onClose: handlePayClose,
            onTimeout: handlePayTimeout,
            onPaySuccess: handlePaySuccess
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        if (showPaySuccessModal.value) {
          _push(ssrRenderComponent(PaySuccessModal, {
            orderId: paySuccessOrder.value.orderId,
            amount: paySuccessOrder.value.amount,
            payType: paySuccessOrder.value.payType,
            productName: paySuccessOrder.value.productName,
            productType: paySuccessOrder.value.productType,
            onClose: handlePaySuccessClose
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/goods/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _id_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-e2d3fcb8"]]);

export { _id_ as default };
//# sourceMappingURL=_id_-CKR4v6nR.mjs.map
