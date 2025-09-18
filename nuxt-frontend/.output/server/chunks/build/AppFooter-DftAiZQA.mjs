import { _ as _export_sfc, f as useModalStore, d as useUserStore, g as useCartStore, a as __nuxt_component_0$2, h as __nuxt_component_2, b as useRuntimeConfig, u as useNuxtApp, e as useCookie } from './server.mjs';
import { defineComponent, ref, watch, withCtx, createVNode, createTextVNode, unref, createBlock, createCommentVNode, openBlock, toDisplayString, mergeProps, computed, useAttrs, resolveComponent, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderAttr, ssrRenderList, ssrInterpolate, ssrRenderAttrs, ssrRenderStyle, ssrRenderSlot, ssrRenderClass, ssrRenderDynamicModel, ssrIncludeBooleanAttr, ssrLooseContain } from 'vue/server-renderer';
import { K as defu, L as withLeadingSlash, n as hasProtocol, q as joinURL, M as parseURL, N as encodeParam, O as encodePath } from '../nitro/nitro.mjs';
import { u as useHead } from './v3-CddZA8nI.mjs';
import { useRouter } from 'vue-router';
import { _ as _imports_1 } from './virtual_public-rJCVlDvA.mjs';

async function imageMeta(_ctx, url) {
  const meta = await _imageMeta(url).catch((err) => {
    console.error("Failed to get image meta for " + url, err + "");
    return {
      width: 0,
      height: 0,
      ratio: 0
    };
  });
  return meta;
}
async function _imageMeta(url) {
  {
    const imageMeta2 = await import('image-meta').then((r) => r.imageMeta);
    const data = await fetch(url).then((res) => res.buffer());
    const metadata = imageMeta2(data);
    if (!metadata) {
      throw new Error(`No metadata could be extracted from the image \`${url}\`.`);
    }
    const { width, height } = metadata;
    const meta = {
      width,
      height,
      ratio: width && height ? width / height : void 0
    };
    return meta;
  }
}
function createMapper(map) {
  return (key) => {
    return key ? map[key] || key : map.missingValue;
  };
}
function createOperationsGenerator({ formatter, keyMap, joinWith = "/", valueMap } = {}) {
  if (!formatter) {
    formatter = (key, value) => `${key}=${value}`;
  }
  if (keyMap && typeof keyMap !== "function") {
    keyMap = createMapper(keyMap);
  }
  const map = valueMap || {};
  Object.keys(map).forEach((valueKey) => {
    if (typeof map[valueKey] !== "function") {
      map[valueKey] = createMapper(map[valueKey]);
    }
  });
  return (modifiers = {}) => {
    const operations = Object.entries(modifiers).filter(([_, value]) => typeof value !== "undefined").map(([key, value]) => {
      const mapper = map[key];
      if (typeof mapper === "function") {
        value = mapper(modifiers[key]);
      }
      key = typeof keyMap === "function" ? keyMap(key) : key;
      return formatter(key, value);
    });
    return operations.join(joinWith);
  };
}
function parseSize(input = "") {
  if (typeof input === "number") {
    return input;
  }
  if (typeof input === "string") {
    if (input.replace("px", "").match(/^\d+$/g)) {
      return Number.parseInt(input, 10);
    }
  }
}
function parseDensities(input = "") {
  if (input === void 0 || !input.length) {
    return [];
  }
  const densities = /* @__PURE__ */ new Set();
  for (const density of input.split(" ")) {
    const d = Number.parseInt(density.replace("x", ""));
    if (d) {
      densities.add(d);
    }
  }
  return Array.from(densities);
}
function checkDensities(densities) {
  if (densities.length === 0) {
    throw new Error("`densities` must not be empty, configure to `1` to render regular size only (DPR 1.0)");
  }
}
function parseSizes(input) {
  const sizes = {};
  if (typeof input === "string") {
    for (const entry of input.split(/[\s,]+/).filter((e) => e)) {
      const s = entry.split(":");
      if (s.length !== 2) {
        sizes["1px"] = s[0].trim();
      } else {
        sizes[s[0].trim()] = s[1].trim();
      }
    }
  } else {
    Object.assign(sizes, input);
  }
  return sizes;
}
function createImage(globalOptions) {
  const ctx = {
    options: globalOptions
  };
  const getImage2 = (input, options = {}) => {
    const image = resolveImage(ctx, input, options);
    return image;
  };
  const $img = (input, modifiers = {}, options = {}) => {
    return getImage2(input, {
      ...options,
      modifiers: defu(modifiers, options.modifiers || {})
    }).url;
  };
  for (const presetName in globalOptions.presets) {
    $img[presetName] = (source, modifiers, options) => $img(source, modifiers, { ...globalOptions.presets[presetName], ...options });
  }
  $img.options = globalOptions;
  $img.getImage = getImage2;
  $img.getMeta = (input, options) => getMeta(ctx, input, options);
  $img.getSizes = (input, options) => getSizes(ctx, input, options);
  ctx.$img = $img;
  return $img;
}
async function getMeta(ctx, input, options) {
  const image = resolveImage(ctx, input, { ...options });
  if (typeof image.getMeta === "function") {
    return await image.getMeta();
  } else {
    return await imageMeta(ctx, image.url);
  }
}
function resolveImage(ctx, input, options) {
  var _a, _b;
  if (input && typeof input !== "string") {
    throw new TypeError(`input must be a string (received ${typeof input}: ${JSON.stringify(input)})`);
  }
  if (!input || input.startsWith("data:")) {
    return {
      url: input
    };
  }
  const { provider, defaults } = getProvider(ctx, options.provider || ctx.options.provider);
  const preset = getPreset(ctx, options.preset);
  input = hasProtocol(input) ? input : withLeadingSlash(input);
  if (!provider.supportsAlias) {
    for (const base in ctx.options.alias) {
      if (input.startsWith(base)) {
        const alias = ctx.options.alias[base];
        if (alias) {
          input = joinURL(alias, input.slice(base.length));
        }
      }
    }
  }
  if (provider.validateDomains && hasProtocol(input)) {
    const inputHost = parseURL(input).host;
    if (!ctx.options.domains.find((d) => d === inputHost)) {
      return {
        url: input
      };
    }
  }
  const _options = defu(options, preset, defaults);
  _options.modifiers = { ..._options.modifiers };
  const expectedFormat = _options.modifiers.format;
  if ((_a = _options.modifiers) == null ? void 0 : _a.width) {
    _options.modifiers.width = parseSize(_options.modifiers.width);
  }
  if ((_b = _options.modifiers) == null ? void 0 : _b.height) {
    _options.modifiers.height = parseSize(_options.modifiers.height);
  }
  const image = provider.getImage(input, _options, ctx);
  image.format = image.format || expectedFormat || "";
  return image;
}
function getProvider(ctx, name) {
  const provider = ctx.options.providers[name];
  if (!provider) {
    throw new Error("Unknown provider: " + name);
  }
  return provider;
}
function getPreset(ctx, name) {
  if (!name) {
    return {};
  }
  if (!ctx.options.presets[name]) {
    throw new Error("Unknown preset: " + name);
  }
  return ctx.options.presets[name];
}
function getSizes(ctx, input, opts) {
  var _a, _b, _c, _d, _e;
  const width = parseSize((_a = opts.modifiers) == null ? void 0 : _a.width);
  const height = parseSize((_b = opts.modifiers) == null ? void 0 : _b.height);
  const sizes = parseSizes(opts.sizes);
  const densities = ((_c = opts.densities) == null ? void 0 : _c.trim()) ? parseDensities(opts.densities.trim()) : ctx.options.densities;
  checkDensities(densities);
  const hwRatio = width && height ? height / width : 0;
  const sizeVariants = [];
  const srcsetVariants = [];
  if (Object.keys(sizes).length >= 1) {
    for (const key in sizes) {
      const variant = getSizesVariant(key, String(sizes[key]), height, hwRatio, ctx);
      if (variant === void 0) {
        continue;
      }
      sizeVariants.push({
        size: variant.size,
        screenMaxWidth: variant.screenMaxWidth,
        media: `(max-width: ${variant.screenMaxWidth}px)`
      });
      for (const density of densities) {
        srcsetVariants.push({
          width: variant._cWidth * density,
          src: getVariantSrc(ctx, input, opts, variant, density)
        });
      }
    }
    finaliseSizeVariants(sizeVariants);
  } else {
    for (const density of densities) {
      const key = Object.keys(sizes)[0];
      let variant = key ? getSizesVariant(key, String(sizes[key]), height, hwRatio, ctx) : void 0;
      if (variant === void 0) {
        variant = {
          size: "",
          screenMaxWidth: 0,
          _cWidth: (_d = opts.modifiers) == null ? void 0 : _d.width,
          _cHeight: (_e = opts.modifiers) == null ? void 0 : _e.height
        };
      }
      srcsetVariants.push({
        width: density,
        src: getVariantSrc(ctx, input, opts, variant, density)
      });
    }
  }
  finaliseSrcsetVariants(srcsetVariants);
  const defaultVariant = srcsetVariants[srcsetVariants.length - 1];
  const sizesVal = sizeVariants.length ? sizeVariants.map((v) => `${v.media ? v.media + " " : ""}${v.size}`).join(", ") : void 0;
  const suffix = sizesVal ? "w" : "x";
  const srcsetVal = srcsetVariants.map((v) => `${v.src} ${v.width}${suffix}`).join(", ");
  return {
    sizes: sizesVal,
    srcset: srcsetVal,
    src: defaultVariant == null ? void 0 : defaultVariant.src
  };
}
function getSizesVariant(key, size, height, hwRatio, ctx) {
  const screenMaxWidth = ctx.options.screens && ctx.options.screens[key] || Number.parseInt(key);
  const isFluid = size.endsWith("vw");
  if (!isFluid && /^\d+$/.test(size)) {
    size = size + "px";
  }
  if (!isFluid && !size.endsWith("px")) {
    return void 0;
  }
  let _cWidth = Number.parseInt(size);
  if (!screenMaxWidth || !_cWidth) {
    return void 0;
  }
  if (isFluid) {
    _cWidth = Math.round(_cWidth / 100 * screenMaxWidth);
  }
  const _cHeight = hwRatio ? Math.round(_cWidth * hwRatio) : height;
  return {
    size,
    screenMaxWidth,
    _cWidth,
    _cHeight
  };
}
function getVariantSrc(ctx, input, opts, variant, density) {
  return ctx.$img(
    input,
    {
      ...opts.modifiers,
      width: variant._cWidth ? variant._cWidth * density : void 0,
      height: variant._cHeight ? variant._cHeight * density : void 0
    },
    opts
  );
}
function finaliseSizeVariants(sizeVariants) {
  var _a;
  sizeVariants.sort((v1, v2) => v1.screenMaxWidth - v2.screenMaxWidth);
  let previousMedia = null;
  for (let i = sizeVariants.length - 1; i >= 0; i--) {
    const sizeVariant = sizeVariants[i];
    if (sizeVariant.media === previousMedia) {
      sizeVariants.splice(i, 1);
    }
    previousMedia = sizeVariant.media;
  }
  for (let i = 0; i < sizeVariants.length; i++) {
    sizeVariants[i].media = ((_a = sizeVariants[i + 1]) == null ? void 0 : _a.media) || "";
  }
}
function finaliseSrcsetVariants(srcsetVariants) {
  srcsetVariants.sort((v1, v2) => v1.width - v2.width);
  let previousWidth = null;
  for (let i = srcsetVariants.length - 1; i >= 0; i--) {
    const sizeVariant = srcsetVariants[i];
    if (sizeVariant.width === previousWidth) {
      srcsetVariants.splice(i, 1);
    }
    previousWidth = sizeVariant.width;
  }
}
const operationsGenerator = createOperationsGenerator({
  keyMap: {
    format: "f",
    fit: "fit",
    width: "w",
    height: "h",
    resize: "s",
    quality: "q",
    background: "b"
  },
  joinWith: "&",
  formatter: (key, val) => encodeParam(key) + "_" + encodeParam(val)
});
const getImage = (src, { modifiers = {}, baseURL } = {}, ctx) => {
  if (modifiers.width && modifiers.height) {
    modifiers.resize = `${modifiers.width}x${modifiers.height}`;
    delete modifiers.width;
    delete modifiers.height;
  }
  const params = operationsGenerator(modifiers) || "_";
  if (!baseURL) {
    baseURL = joinURL(ctx.options.nuxt.baseURL, "/_ipx");
  }
  return {
    url: joinURL(baseURL, params, encodePath(src))
  };
};
const validateDomains = true;
const supportsAlias = true;
const ipxRuntime$xClELzD5SbPgI5VGl4Q6cxdcfJjmi7YiGq20notNgfU = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getImage,
  operationsGenerator,
  supportsAlias,
  validateDomains
}, Symbol.toStringTag, { value: "Module" }));
const imageOptions = {
  ...{
    "screens": {
      "xs": 320,
      "sm": 640,
      "md": 768,
      "lg": 1024,
      "xl": 1280,
      "xxl": 1536,
      "2xl": 1536
    },
    "presets": {
      "productMain": {
        "modifiers": {
          "format": "webp",
          "quality": 90,
          "width": 600,
          "height": 600
        }
      },
      "productThumb": {
        "modifiers": {
          "format": "webp",
          "quality": 75,
          "width": 100,
          "height": 100
        }
      },
      "avatar": {
        "modifiers": {
          "format": "webp",
          "quality": 80,
          "width": 64,
          "height": 64
        }
      },
      "icon": {
        "modifiers": {
          "format": "webp",
          "quality": 85,
          "width": 48,
          "height": 48
        }
      }
    },
    "provider": "ipx",
    "domains": [
      "fantula.com",
      "via.placeholder.com"
    ],
    "alias": {
      "/fantula": "https://fantula.com"
    },
    "densities": [
      1,
      2
    ],
    "format": [
      "webp",
      "avif",
      "jpeg",
      "webp"
    ],
    "quality": 80
  },
  providers: {
    ["ipx"]: { provider: ipxRuntime$xClELzD5SbPgI5VGl4Q6cxdcfJjmi7YiGq20notNgfU, defaults: {} }
  }
};
const useImage = (event) => {
  var _a;
  const config = useRuntimeConfig();
  const nuxtApp = useNuxtApp();
  return nuxtApp.$img || nuxtApp._img || (nuxtApp._img = createImage({
    ...imageOptions,
    event: (_a = nuxtApp.ssrContext) == null ? void 0 : _a.event,
    nuxt: {
      baseURL: config.app.baseURL
    },
    runtimeConfig: config
  }));
};
const baseImageProps = {
  // input source
  src: { type: String, required: false },
  // modifiers
  format: { type: String, required: false },
  quality: { type: [Number, String], required: false },
  background: { type: String, required: false },
  fit: { type: String, required: false },
  modifiers: { type: Object, required: false },
  // options
  preset: { type: String, required: false },
  provider: { type: String, required: false },
  sizes: { type: [Object, String], required: false },
  densities: { type: String, required: false },
  preload: {
    type: [Boolean, Object],
    required: false
  },
  // <img> attributes
  width: { type: [String, Number], required: false },
  height: { type: [String, Number], required: false },
  alt: { type: String, required: false },
  referrerpolicy: { type: String, required: false },
  usemap: { type: String, required: false },
  longdesc: { type: String, required: false },
  ismap: { type: Boolean, required: false },
  loading: {
    type: String,
    required: false,
    validator: (val) => ["lazy", "eager"].includes(val)
  },
  crossorigin: {
    type: [Boolean, String],
    required: false,
    validator: (val) => ["anonymous", "use-credentials", "", true, false].includes(val)
  },
  decoding: {
    type: String,
    required: false,
    validator: (val) => ["async", "auto", "sync"].includes(val)
  },
  // csp
  nonce: { type: [String], required: false }
};
const useBaseImage = (props) => {
  const options = computed(() => {
    return {
      provider: props.provider,
      preset: props.preset
    };
  });
  const attrs = computed(() => {
    return {
      width: parseSize(props.width),
      height: parseSize(props.height),
      alt: props.alt,
      referrerpolicy: props.referrerpolicy,
      usemap: props.usemap,
      longdesc: props.longdesc,
      ismap: props.ismap,
      crossorigin: props.crossorigin === true ? "anonymous" : props.crossorigin || void 0,
      loading: props.loading,
      decoding: props.decoding,
      nonce: props.nonce
    };
  });
  const $img = useImage();
  const modifiers = computed(() => {
    return {
      ...props.modifiers,
      width: parseSize(props.width),
      height: parseSize(props.height),
      format: props.format,
      quality: props.quality || $img.options.quality,
      background: props.background,
      fit: props.fit
    };
  });
  return {
    options,
    attrs,
    modifiers
  };
};
const imgProps = {
  ...baseImageProps,
  placeholder: { type: [Boolean, String, Number, Array], required: false },
  placeholderClass: { type: String, required: false },
  custom: { type: Boolean, required: false }
};
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "NuxtImg",
  __ssrInlineRender: true,
  props: imgProps,
  emits: ["load", "error"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const attrs = useAttrs();
    const isServer = true;
    const $img = useImage();
    const _base = useBaseImage(props);
    const placeholderLoaded = ref(false);
    const imgEl = ref();
    const sizes = computed(() => $img.getSizes(props.src, {
      ..._base.options.value,
      sizes: props.sizes,
      densities: props.densities,
      modifiers: {
        ..._base.modifiers.value,
        width: parseSize(props.width),
        height: parseSize(props.height)
      }
    }));
    const imgAttrs = computed(() => {
      const attrs2 = { ..._base.attrs.value, "data-nuxt-img": "" };
      if (!props.placeholder || placeholderLoaded.value) {
        attrs2.sizes = sizes.value.sizes;
        attrs2.srcset = sizes.value.srcset;
      }
      return attrs2;
    });
    const placeholder = computed(() => {
      let placeholder2 = props.placeholder;
      if (placeholder2 === "") {
        placeholder2 = true;
      }
      if (!placeholder2 || placeholderLoaded.value) {
        return false;
      }
      if (typeof placeholder2 === "string") {
        return placeholder2;
      }
      const size = Array.isArray(placeholder2) ? placeholder2 : typeof placeholder2 === "number" ? [placeholder2, placeholder2] : [10, 10];
      return $img(props.src, {
        ..._base.modifiers.value,
        width: size[0],
        height: size[1],
        quality: size[2] || 50,
        blur: size[3] || 3
      }, _base.options.value);
    });
    const mainSrc = computed(
      () => props.sizes ? sizes.value.src : $img(props.src, _base.modifiers.value, _base.options.value)
    );
    const src = computed(() => placeholder.value ? placeholder.value : mainSrc.value);
    if (props.preload) {
      const isResponsive = Object.values(sizes.value).every((v) => v);
      useHead({
        link: [{
          rel: "preload",
          as: "image",
          nonce: props.nonce,
          ...!isResponsive ? { href: src.value } : {
            href: sizes.value.src,
            imagesizes: sizes.value.sizes,
            imagesrcset: sizes.value.srcset
          },
          ...typeof props.preload !== "boolean" && props.preload.fetchPriority ? { fetchpriority: props.preload.fetchPriority } : {}
        }]
      });
    }
    const nuxtApp = useNuxtApp();
    nuxtApp.isHydrating;
    return (_ctx, _push, _parent, _attrs) => {
      if (!_ctx.custom) {
        _push(`<img${ssrRenderAttrs(mergeProps({
          ref_key: "imgEl",
          ref: imgEl,
          class: placeholder.value && !placeholderLoaded.value ? _ctx.placeholderClass : void 0
        }, {
          ...unref(isServer) ? { onerror: "this.setAttribute('data-error', 1)" } : {},
          ...imgAttrs.value,
          ...unref(attrs)
        }, { src: src.value }, _attrs))}>`);
      } else {
        ssrRenderSlot(_ctx.$slots, "default", {
          ...unref(isServer) ? { onerror: "this.setAttribute('data-error', 1)" } : {},
          imgAttrs: {
            ...imgAttrs.value,
            ...unref(attrs)
          },
          isLoaded: placeholderLoaded.value,
          src: src.value
        }, null, _push, _parent);
      }
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxt/image/dist/runtime/components/NuxtImg.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "OptimizedImage",
  __ssrInlineRender: true,
  props: {
    src: {},
    alt: {},
    title: {},
    width: {},
    height: {},
    loading: { default: "lazy" },
    preset: {},
    sizes: {},
    format: { default: "webp" },
    quality: { default: 80 },
    fit: { default: "cover" },
    modifiers: {},
    showPlaceholder: { type: Boolean, default: true },
    placeholderSrc: {},
    imageClass: {},
    wrapperClass: {},
    seoKeywords: {},
    productName: {},
    category: {}
  },
  setup(__props) {
    const props = __props;
    const imageLoaded = ref(false);
    const imageError = ref(false);
    const isUploadedImage = computed(() => {
      return props.src && props.src.startsWith("/uploads/");
    });
    const computedSrc = computed(() => {
      if (isUploadedImage.value) {
        const config = useRuntimeConfig();
        return `${config.public.apiBase}${props.src}`;
      }
      return props.src;
    });
    const computedAlt = computed(() => {
      var _a;
      if (props.alt) return props.alt;
      if (props.productName) {
        const altParts = [props.productName];
        if (props.category) altParts.push(props.category);
        if ((_a = props.seoKeywords) == null ? void 0 : _a.length) {
          altParts.push(...props.seoKeywords.slice(0, 2));
        }
        altParts.push("\u9AD8\u6E05\u56FE\u7247");
        return altParts.join(" - ");
      }
      return "\u51E1\u56FE\u62C9\u5E73\u53F0\u56FE\u7247";
    });
    const computedTitle = computed(() => {
      if (props.title) return props.title;
      if (computedAlt.value !== "\u51E1\u56FE\u62C9\u5E73\u53F0\u56FE\u7247") {
        return `\u67E5\u770B${computedAlt.value}`;
      }
      return void 0;
    });
    const computedSizes = computed(() => {
      if (props.sizes) return props.sizes;
      if (props.width && typeof props.width === "number") {
        if (props.width <= 400) {
          return "xs:100vw sm:50vw md:33vw";
        } else if (props.width <= 800) {
          return "xs:100vw sm:75vw md:50vw lg:33vw";
        } else {
          return "xs:100vw sm:100vw md:75vw lg:50vw";
        }
      }
      return "xs:100vw sm:100vw md:100vw";
    });
    const placeholderStyle = computed(() => {
      const style = {};
      if (props.width) {
        style.width = typeof props.width === "number" ? `${props.width}px` : props.width;
      }
      if (props.height) {
        style.height = typeof props.height === "number" ? `${props.height}px` : props.height;
        if (props.width && props.height) {
          const w = typeof props.width === "number" ? props.width : parseInt(props.width);
          const h = typeof props.height === "number" ? props.height : parseInt(props.height);
          style.aspectRatio = `${w} / ${h}`;
        }
      }
      return style;
    });
    const handleImageLoad = () => {
      imageLoaded.value = true;
      imageError.value = false;
    };
    const handleImageError = (event) => {
      imageError.value = true;
      imageLoaded.value = false;
      console.error("\u56FE\u7247\u52A0\u8F7D\u5931\u8D25:", props.src, event);
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtImg = _sfc_main$6;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["optimized-image-wrapper", _ctx.wrapperClass]
      }, _attrs))} data-v-690363e1>`);
      if (!imageLoaded.value && _ctx.showPlaceholder) {
        _push(`<div class="image-placeholder" style="${ssrRenderStyle(placeholderStyle.value)}" data-v-690363e1><div class="placeholder-skeleton" data-v-690363e1></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (isUploadedImage.value) {
        _push(`<img${ssrRenderAttrs(mergeProps(_ctx.$attrs, {
          src: computedSrc.value,
          alt: computedAlt.value,
          title: computedTitle.value,
          loading: _ctx.loading,
          width: _ctx.width,
          height: _ctx.height,
          class: ["optimized-image", _ctx.imageClass, { "image-loading": !imageLoaded.value }]
        }))} data-v-690363e1>`);
      } else {
        _push(ssrRenderComponent(_component_NuxtImg, mergeProps(_ctx.$attrs, {
          src: _ctx.src,
          alt: computedAlt.value,
          title: computedTitle.value,
          loading: _ctx.loading,
          preset: _ctx.preset,
          width: _ctx.width,
          height: _ctx.height,
          sizes: computedSizes.value,
          format: _ctx.format,
          quality: _ctx.quality,
          fit: _ctx.fit,
          modifiers: _ctx.modifiers,
          placeholder: _ctx.placeholderSrc,
          class: ["optimized-image", _ctx.imageClass, { "image-loading": !imageLoaded.value }],
          onLoad: handleImageLoad,
          onError: handleImageError
        }), null, _parent));
      }
      if (imageError.value) {
        _push(`<div class="image-error" data-v-690363e1><svg class="error-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" data-v-690363e1><path d="M4 6h16l-1.58 14.22A2 2 0 0116.432 22H7.568a2 2 0 01-1.988-1.78L4 6z" stroke="currentColor" stroke-width="2" data-v-690363e1></path><path d="M7.345 3.147A2 2 0 019.154 2h5.692a2 2 0 011.81 1.147L18 6H6l1.345-2.853z" stroke="currentColor" stroke-width="2" data-v-690363e1></path><path d="M10 11v5M14 11v5" stroke="currentColor" stroke-width="2" stroke-linecap="round" data-v-690363e1></path></svg><span class="error-text" data-v-690363e1>\u56FE\u7247\u52A0\u8F7D\u5931\u8D25</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/OptimizedImage.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const __nuxt_component_0$1 = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-690363e1"]]);
const weixinIcon1 = "/images/kefuweixin1.png";
const weixinIcon2 = "/images/kefuweixin2.png";
const dingdingIcon1 = "/images/kefudingding1.png";
const dingdingIcon2 = "/images/kefudingding2.png";
const phoneIcon = "/images/kefudianhua.png";
const contactIcon = "/images/kefulianxi.png";
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "ServiceModal",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "service-modal-mask" }, _attrs))} data-v-f5beb309><div class="service-modal" data-v-f5beb309><div class="modal-gradient-top" data-v-f5beb309><div class="modal-header" data-v-f5beb309><span class="modal-title" data-v-f5beb309>\u8054\u7CFB\u5BA2\u670D</span><button class="modal-close" data-v-f5beb309>\xD7</button></div><div class="modal-desc" data-v-f5beb309>\u6211\u4EEC\u63D0\u4F9B\u591A\u79CD\u4FBF\u6377\u7684\u5BA2\u670D\u6E20\u9053\uFF0C7\xD724\u5C0F\u65F6\u4E3A\u60A8\u63D0\u4F9B\u4E13\u4E1A\u670D\u52A1\u3002\u626B\u7801\u6DFB\u52A0\u5BA2\u670D\uFF0C\u83B7\u53D6\u5373\u65F6\u5E2E\u52A9\u3002</div></div><div class="modal-main-white" data-v-f5beb309><div class="modal-row" data-v-f5beb309><div class="modal-card" data-v-f5beb309><div class="card-top-row" data-v-f5beb309><div class="card-avatar wechat" data-v-f5beb309><img${ssrRenderAttr("src", weixinIcon1)} alt="\u5FAE\u4FE1\u5BA2\u670D\u56FE\u6807" data-v-f5beb309></div><div class="card-title" data-v-f5beb309>\u5FAE\u4FE1\u5BA2\u670D</div></div><div class="card-icon-box" data-v-f5beb309><img${ssrRenderAttr("src", weixinIcon2)} class="card-icon-img" alt="\u5FAE\u4FE1\u4E8C\u7EF4\u7801" data-v-f5beb309></div><div class="card-desc" data-v-f5beb309>\u4F7F\u7528\u5FAE\u4FE1\u626B\u63CF\u4E8C\u7EF4\u7801\u6DFB\u52A0\u5BA2\u670D<br data-v-f5beb309>\u6216\u641C\u7D22\u5FAE\u4FE1\u53F7\uFF1A<span class="account-code" data-v-f5beb309>kefu_wechat123</span></div></div><div class="modal-card" data-v-f5beb309><div class="card-top-row" data-v-f5beb309><div class="card-avatar dingtalk" data-v-f5beb309><img${ssrRenderAttr("src", dingdingIcon1)} alt="\u9489\u9489\u5BA2\u670D\u56FE\u6807" data-v-f5beb309></div><div class="card-title" data-v-f5beb309>\u9489\u9489\u5BA2\u670D</div></div><div class="card-icon-box" data-v-f5beb309><img${ssrRenderAttr("src", dingdingIcon2)} class="card-icon-img" alt="\u9489\u9489\u4E8C\u7EF4\u7801" data-v-f5beb309></div><div class="card-desc" data-v-f5beb309>\u4F7F\u7528\u9489\u9489\u626B\u63CF\u4E8C\u7EF4\u7801\u6DFB\u52A0\u5BA2\u670D<br data-v-f5beb309>\u6216\u641C\u7D22ID\uFF1A<span class="account-code" data-v-f5beb309>kefu_dingtalk456</span></div></div></div><div class="modal-row phone-row" data-v-f5beb309><div class="modal-card phone" data-v-f5beb309><div class="phone-header" data-v-f5beb309><div class="modal-card-icon phone" data-v-f5beb309><img${ssrRenderAttr("src", phoneIcon)} alt="\u7535\u8BDD\u5BA2\u670D\u56FE\u6807" data-v-f5beb309></div><div class="modal-card-title phone" data-v-f5beb309>\u7535\u8BDD\u5BA2\u670D</div></div><div class="modal-phone-number" data-v-f5beb309>400-888-9999</div><div class="modal-phone-desc" data-v-f5beb309>\u670D\u52A1\u65F6\u95F4\uFF1A\u5168\u592924\u5C0F\u65F6<br data-v-f5beb309>\u62E8\u6253\u5BA2\u670D\u70ED\u7EBF\u83B7\u53D6\u5373\u65F6\u652F\u6301<br data-v-f5beb309>\u6216\u53D1\u9001\u90AE\u4EF6\u81F3 <span class="email-support" data-v-f5beb309>support@company.com</span></div></div></div><button class="modal-action" data-v-f5beb309><img${ssrRenderAttr("src", contactIcon)} alt="\u8054\u7CFB\u5BA2\u670D\u56FE\u6807" class="action-icon" data-v-f5beb309> \u8054\u7CFB\u5728\u7EBF\u5BA2\u670D </button></div></div></div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ServiceModal.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const ServiceModal = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-f5beb309"]]);
const _sfc_main$3 = {
  __name: "UnifiedLoginModal",
  __ssrInlineRender: true,
  props: {
    visible: Boolean
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    useUserStore();
    useCookie("token");
    const loginType = ref("password");
    const form = ref({
      email: "",
      code: "",
      password: ""
    });
    const loading = ref(false);
    const message = ref("");
    const messageType = ref("error");
    const emailError = ref("");
    const showPassword = ref(false);
    const agree = ref(false);
    const codeTimer = ref(0);
    const submitButtonText = computed(() => {
      if (loading.value) return "\u5904\u7406\u4E2D...";
      return "\u767B\u5F55";
    });
    watch(() => props.visible, (newVal) => {
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = resolveComponent("Icon");
      const _component_NuxtLink = __nuxt_component_0$2;
      if (__props.visible) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "modal-mask" }, _attrs))} data-v-1249397f><div class="login-modal" data-v-1249397f><div class="modal-header" data-v-1249397f><div class="modal-header-inner" data-v-1249397f><div class="modal-title" data-v-1249397f>\u51E1\u56FE\u62C9</div><div class="modal-subtitle" data-v-1249397f>\u6B22\u8FCE\u56DE\u6765\uFF0C\u8BF7\u767B\u5F55\u60A8\u7684\u8D26\u6237</div><button class="modal-close" data-v-1249397f>\xD7</button></div></div><div class="modal-body" data-v-1249397f><div class="modal-form-area" data-v-1249397f><div class="login-type-tabs" data-v-1249397f><button type="button" class="${ssrRenderClass(["login-type-btn", { active: loginType.value === "password" }])}" data-v-1249397f> \u5BC6\u7801\u767B\u5F55 </button><button type="button" class="${ssrRenderClass(["login-type-btn", { active: loginType.value === "code" }])}" data-v-1249397f> \u9A8C\u8BC1\u7801\u767B\u5F55 </button></div><form data-v-1249397f><div class="form-group" data-v-1249397f><label data-v-1249397f>\u90AE\u7BB1\u5730\u5740</label><input${ssrRenderAttr("value", form.value.email)} type="email" placeholder="\u8BF7\u8F93\u5165\u60A8\u7684\u90AE\u7BB1" required class="${ssrRenderClass({ "error": emailError.value })}" data-v-1249397f>`);
        if (emailError.value) {
          _push(`<span class="error-message" data-v-1249397f>${ssrInterpolate(emailError.value)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (loginType.value === "password") {
          _push(`<!--[--><div class="form-group" data-v-1249397f><label data-v-1249397f>\u5BC6\u7801</label><div class="password-input-wrapper" data-v-1249397f><input${ssrRenderDynamicModel(showPassword.value ? "text" : "password", form.value.password, null)}${ssrRenderAttr("type", showPassword.value ? "text" : "password")} placeholder="\u8BF7\u8F93\u5165\u5BC6\u7801" required data-v-1249397f><button type="button" class="password-toggle" data-v-1249397f>`);
          _push(ssrRenderComponent(_component_Icon, {
            name: showPassword.value ? "mdi:eye-off" : "mdi:eye"
          }, null, _parent));
          _push(`</button></div></div><div class="form-links" data-v-1249397f><a data-v-1249397f>\u5FD8\u8BB0\u5BC6\u7801\uFF1F</a></div><!--]-->`);
        } else if (loginType.value === "code") {
          _push(`<!--[--><div class="form-group code-group" data-v-1249397f><label data-v-1249397f>\u9A8C\u8BC1\u7801</label><input${ssrRenderAttr("value", form.value.code)} type="text" placeholder="\u8BF7\u8F93\u5165\u9A8C\u8BC1\u7801" maxlength="6" required data-v-1249397f><button class="code-btn-inside" type="button"${ssrIncludeBooleanAttr(codeTimer.value > 0 || !form.value.email || emailError.value) ? " disabled" : ""} data-v-1249397f>${ssrInterpolate(codeTimer.value > 0 ? codeTimer.value + "s" : "\u83B7\u53D6\u9A8C\u8BC1\u7801")}</button></div><div class="form-tips" data-v-1249397f>`);
          _push(ssrRenderComponent(_component_Icon, { name: "mdi:information-outline" }, null, _parent));
          _push(`<span data-v-1249397f>\u672A\u6CE8\u518C\u7684\u90AE\u7BB1\u9A8C\u8BC1\u540E\u5C06\u81EA\u52A8\u521B\u5EFA\u8D26\u53F7</span></div><!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="form-row" data-v-1249397f><label class="checkbox-label" data-v-1249397f><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(agree.value) ? ssrLooseContain(agree.value, null) : agree.value) ? " checked" : ""} required data-v-1249397f><span data-v-1249397f>\u6211\u5DF2\u9605\u8BFB\u5E76\u540C\u610F `);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/privacy",
          target: "_blank"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`\u300A\u9690\u79C1\u534F\u8BAE\u300B`);
            } else {
              return [
                createTextVNode("\u300A\u9690\u79C1\u534F\u8BAE\u300B")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(` \u548C `);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/policy",
          target: "_blank"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`\u300A\u7528\u6237\u653F\u7B56\u300B`);
            } else {
              return [
                createTextVNode("\u300A\u7528\u6237\u653F\u7B56\u300B")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</span></label></div><button class="submit-btn" type="submit"${ssrIncludeBooleanAttr(loading.value) ? " disabled" : ""} data-v-1249397f>`);
        if (loading.value) {
          _push(`<span class="loading-spinner" data-v-1249397f></span>`);
        } else {
          _push(`<!---->`);
        }
        _push(` ${ssrInterpolate(submitButtonText.value)}</button>`);
        if (message.value) {
          _push(`<div class="${ssrRenderClass(["message", messageType.value])}" data-v-1249397f>${ssrInterpolate(message.value)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</form><div class="other-login" data-v-1249397f><div class="divider" data-v-1249397f><span data-v-1249397f>\u6216\u4F7F\u7528\u5176\u4ED6\u65B9\u5F0F\u767B\u5F55</span></div><div class="social-login" data-v-1249397f><button type="button" class="social-btn" title="Google\u767B\u5F55" data-v-1249397f>`);
        _push(ssrRenderComponent(_component_Icon, { name: "mdi:google" }, null, _parent));
        _push(`</button><button type="button" class="social-btn" title="GitHub\u767B\u5F55" data-v-1249397f>`);
        _push(ssrRenderComponent(_component_Icon, { name: "mdi:github" }, null, _parent));
        _push(`</button><button type="button" class="social-btn" title="Twitter\u767B\u5F55" data-v-1249397f>`);
        _push(ssrRenderComponent(_component_Icon, { name: "mdi:twitter" }, null, _parent));
        _push(`</button></div></div></div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
};
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/UnifiedLoginModal.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const UnifiedLoginModal = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-1249397f"]]);
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "AppHeader",
  __ssrInlineRender: true,
  setup(__props) {
    const modal = useModalStore();
    const userStore = useUserStore();
    const cartStore = useCartStore();
    useRouter();
    const showUserMenu = ref(false);
    const showServiceModal = ref(false);
    const showLoginModal = ref(false);
    const searchKeyword = ref("");
    const searchResults = ref([]);
    const showSearchResults = ref(false);
    const isSearching = ref(false);
    const closeLoginModal = () => {
      showLoginModal.value = false;
    };
    watch(() => userStore.isLoggedIn, (newValue) => {
      if (newValue && showLoginModal.value) {
        showLoginModal.value = false;
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_NuxtLink = __nuxt_component_0$2;
      const _component_OptimizedImage = __nuxt_component_0$1;
      _push(`<!--[--><header class="app-header" data-v-a87d5f49><div class="header-inner" data-v-a87d5f49>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "logo-area"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_OptimizedImage, {
              src: "/images/logo.png",
              alt: "\u51E1\u56FE\u62C9\u5B98\u65B9Logo - \u4F18\u8D28\u6D41\u5A92\u4F53\u670D\u52A1\u5E73\u53F0",
              title: "\u8FD4\u56DE\u51E1\u56FE\u62C9\u9996\u9875",
              width: 40,
              height: 40,
              loading: "eager",
              class: "logo-img",
              preset: "icon"
            }, null, _parent2, _scopeId));
            _push2(`<span class="logo-text" data-v-a87d5f49${_scopeId}>\u51E1\u56FE\u62C9</span>`);
          } else {
            return [
              createVNode(_component_OptimizedImage, {
                src: "/images/logo.png",
                alt: "\u51E1\u56FE\u62C9\u5B98\u65B9Logo - \u4F18\u8D28\u6D41\u5A92\u4F53\u670D\u52A1\u5E73\u53F0",
                title: "\u8FD4\u56DE\u51E1\u56FE\u62C9\u9996\u9875",
                width: 40,
                height: 40,
                loading: "eager",
                class: "logo-img",
                preset: "icon"
              }),
              createVNode("span", { class: "logo-text" }, "\u51E1\u56FE\u62C9")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<nav class="nav-menu" data-v-a87d5f49>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "nav-btn"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u9996\u9875`);
          } else {
            return [
              createTextVNode("\u9996\u9875")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<button class="nav-btn" data-v-a87d5f49>\u8BA2\u5355</button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/community",
        class: "nav-btn"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u793E\u533A\u5E2E\u52A9`);
          } else {
            return [
              createTextVNode("\u793E\u533A\u5E2E\u52A9")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<button class="nav-btn" data-v-a87d5f49>\u5BA2\u670D</button></nav><div class="header-actions" data-v-a87d5f49><div class="search-box" data-v-a87d5f49><input${ssrRenderAttr("value", searchKeyword.value)} class="search-input" type="text" placeholder="\u641C\u7D22\u5546\u54C1..." data-v-a87d5f49><div class="search-icon-bg" data-v-a87d5f49><svg width="22" height="22" viewBox="0 0 22 22" fill="none" data-v-a87d5f49><circle cx="11" cy="11" r="11" fill="#E6F0FA" data-v-a87d5f49></circle><path d="M15.5 15.5L13.1 13.1M14 10C14 12.2091 12.2091 14 10 14C7.79086 14 6 12.2091 6 10C6 7.79086 7.79086 6 10 6C12.2091 6 14 7.79086 14 10Z" stroke="#235CDC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-v-a87d5f49></path></svg></div>`);
      if (showSearchResults.value) {
        _push(`<div class="search-dropdown" data-v-a87d5f49>`);
        if (isSearching.value) {
          _push(`<div class="search-loading" data-v-a87d5f49>\u641C\u7D22\u4E2D...</div>`);
        } else if (searchResults.value.length === 0) {
          _push(`<div class="search-no-results" data-v-a87d5f49>\u672A\u627E\u5230\u76F8\u5173\u5546\u54C1</div>`);
        } else {
          _push(`<div data-v-a87d5f49><!--[-->`);
          ssrRenderList(searchResults.value, (item) => {
            _push(`<div class="search-result-item" data-v-a87d5f49><img${ssrRenderAttr("src", item.image || "/images/netflix.png")}${ssrRenderAttr("alt", item.name)} class="search-result-img" data-v-a87d5f49><div class="search-result-info" data-v-a87d5f49><div class="search-result-name" data-v-a87d5f49>${ssrInterpolate(item.name || item.title)}</div><div class="search-result-price" data-v-a87d5f49>\xA5${ssrInterpolate(item.price)}</div></div></div>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (!unref(userStore).isLoggedIn) {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "#",
          class: "login-btn",
          onClick: ($event) => unref(modal).openLogin()
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` \u767B\u5F55/\u6CE8\u518C `);
            } else {
              return [
                createTextVNode(" \u767B\u5F55/\u6CE8\u518C ")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<div class="user-section" data-v-a87d5f49>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/cart",
          class: "cart-icon",
          title: "\u67E5\u770B\u8D2D\u7269\u8F66",
          onClick: () => {
          }
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="cart-icon-wrapper" data-v-a87d5f49${_scopeId}>`);
              _push2(ssrRenderComponent(_component_OptimizedImage, {
                src: "/images/gouwuche.png",
                alt: "\u8D2D\u7269\u8F66\u56FE\u6807 - \u67E5\u770B\u60A8\u7684\u8D2D\u7269\u8F66",
                title: "\u70B9\u51FB\u67E5\u770B\u8D2D\u7269\u8F66",
                width: 24,
                height: 24,
                loading: "eager",
                class: "cart-img",
                preset: "icon"
              }, null, _parent2, _scopeId));
              if (unref(cartStore).totalCount > 0) {
                _push2(`<span class="cart-badge" data-v-a87d5f49${_scopeId}>${ssrInterpolate(unref(cartStore).totalCount)}</span>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><span class="cart-text" data-v-a87d5f49${_scopeId}>\u8D2D\u7269\u8F66</span>`);
            } else {
              return [
                createVNode("div", { class: "cart-icon-wrapper" }, [
                  createVNode(_component_OptimizedImage, {
                    src: "/images/gouwuche.png",
                    alt: "\u8D2D\u7269\u8F66\u56FE\u6807 - \u67E5\u770B\u60A8\u7684\u8D2D\u7269\u8F66",
                    title: "\u70B9\u51FB\u67E5\u770B\u8D2D\u7269\u8F66",
                    width: 24,
                    height: 24,
                    loading: "eager",
                    class: "cart-img",
                    preset: "icon"
                  }),
                  unref(cartStore).totalCount > 0 ? (openBlock(), createBlock("span", {
                    key: 0,
                    class: "cart-badge"
                  }, toDisplayString(unref(cartStore).totalCount), 1)) : createCommentVNode("", true)
                ]),
                createVNode("span", { class: "cart-text" }, "\u8D2D\u7269\u8F66")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="user-info-container" data-v-a87d5f49><div class="user-info" data-v-a87d5f49>`);
        _push(ssrRenderComponent(_component_OptimizedImage, {
          src: ((_a = unref(userStore).user) == null ? void 0 : _a.avatar) || "/images/head1.png",
          alt: `${((_b = unref(userStore).user) == null ? void 0 : _b.nickname) || "\u7528\u6237"}\u7684\u4E2A\u4EBA\u5934\u50CF`,
          title: `${((_c = unref(userStore).user) == null ? void 0 : _c.nickname) || "\u7528\u6237"}\u7684\u4E2A\u4EBA\u4E2D\u5FC3`,
          width: 32,
          height: 32,
          loading: "eager",
          class: "user-avatar",
          preset: "avatar"
        }, null, _parent));
        _push(`<span class="user-name" data-v-a87d5f49>${ssrInterpolate(((_d = unref(userStore).user) == null ? void 0 : _d.nickname) || "XXX")}</span></div>`);
        if (showUserMenu.value) {
          _push(`<div class="user-dropdown-menu" data-v-a87d5f49><div class="menu-item" data-v-a87d5f49>\u4E2A\u4EBA\u4E2D\u5FC3</div><div class="menu-item" data-v-a87d5f49>\u6211\u7684\u94B1\u5305</div><div class="menu-item" data-v-a87d5f49>\u6211\u7684\u8BA2\u5355</div><div class="menu-item" data-v-a87d5f49>\u5151\u6362\u4E2D\u5FC3</div><div class="menu-item" data-v-a87d5f49>\u63A8\u5E7F\u8FD4\u73B0</div><div class="menu-item" data-v-a87d5f49>\u6211\u7684\u5DE5\u5355</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      }
      _push(`</div></div></header>`);
      if (showServiceModal.value) {
        _push(ssrRenderComponent(ServiceModal, {
          onClose: ($event) => showServiceModal.value = false
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(UnifiedLoginModal, {
        visible: showLoginModal.value,
        onClose: closeLoginModal
      }, null, _parent));
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AppHeader.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-a87d5f49"]]);
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "JoinUsModal",
  __ssrInlineRender: true,
  props: {
    visible: { type: Boolean }
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    return (_ctx, _push, _parent, _attrs) => {
      if (_ctx.visible) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "modal-mask" }, _attrs))} data-v-44263842><div class="join-modal" data-v-44263842><div class="modal-header" data-v-44263842><div class="modal-header-inner" data-v-44263842><div class="modal-title" data-v-44263842>\u52A0\u5165\u6211\u4EEC\u7684\u793E\u7FA4</div><div class="modal-subtitle" data-v-44263842>\u626B\u7801\u6DFB\u52A0\u5BA2\u670D\u5FAE\u4FE1\uFF0C\u83B7\u53D6\u4E13\u5C5E\u670D\u52A1</div><button class="modal-close" data-v-44263842>\xD7</button></div></div><div class="modal-body" data-v-44263842><div class="wechat-content" data-v-44263842><div class="qr-section" data-v-44263842><div class="qr-container" data-v-44263842><img${ssrRenderAttr("src", _imports_1)} alt="\u5FAE\u4FE1\u4E8C\u7EF4\u7801" class="qr-code" data-v-44263842></div></div><div class="wechat-info" data-v-44263842><div class="wechat-id" data-v-44263842><span class="wechat-label" data-v-44263842>\u5BA2\u670D\u5FAE\u4FE1\uFF1A</span><span class="wechat-value" data-v-44263842>Companyservice</span></div><div class="copy-section" data-v-44263842><button class="copy-btn" data-v-44263842>\u{1F4CB} \u590D\u5236\u5FAE\u4FE1\u53F7</button></div></div><div class="steps-section" data-v-44263842><div class="steps-title" data-v-44263842>\u6DFB\u52A0\u5BA2\u670D\u6B65\u9AA4</div><div class="steps-container" data-v-44263842><div class="step-item" data-v-44263842><div class="step-number" data-v-44263842>1</div><div class="step-text" data-v-44263842>\u4E0B\u8F7D\u4E8C\u7EF4\u7801\u56FE\u7247\u5230\u7535\u8111</div></div><div class="step-item" data-v-44263842><div class="step-number" data-v-44263842>2</div><div class="step-text" data-v-44263842>\u6253\u5F00\u624B\u673A\u5FAE\u4FE1\u626B\u4E00\u626B</div></div><div class="step-item" data-v-44263842><div class="step-number" data-v-44263842>3</div><div class="step-text" data-v-44263842>\u70B9\u51FB\u52A0\u5165\u793E\u7FA4</div></div></div></div></div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/JoinUsModal.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1$1 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-44263842"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AppFooter",
  __ssrInlineRender: true,
  setup(__props) {
    const showJoinUs = ref(false);
    const showLoginModal = ref(false);
    const userStore = useUserStore();
    function closeJoinUs() {
      showJoinUs.value = false;
    }
    function closeLoginModal() {
      showLoginModal.value = false;
    }
    watch(() => userStore.isLoggedIn, (newValue) => {
      if (newValue && showLoginModal.value) {
        showLoginModal.value = false;
      }
    });
    const cols = [
      {
        title: "\u529F\u80FD\u5BFC\u822A",
        items: ["\u4E2A\u4EBA\u4E2D\u5FC3", "\u6211\u7684\u8BA2\u5355", "\u9080\u8BF7\u63A8\u5E7F", "\u793E\u533A\u5E2E\u52A9"]
      },
      {
        title: "\u6761\u6B3E\u4E0E\u653F\u7B56",
        items: ["\u9690\u79C1\u653F\u7B56", "\u7528\u6237\u534F\u8BAE", "\u9000\u6B3E\u653F\u7B56", "\u514D\u8D23\u58F0\u660E"]
      },
      {
        title: "\u5173\u4E8E\u6211\u4EEC",
        items: ["\u516C\u53F8\u7B80\u4ECB", "\u6211\u4EEC\u7684\u4F7F\u547D", "\u6211\u4EEC\u7684\u4F18\u52BF", "\u52A0\u5165\u6211\u4EEC"]
      },
      {
        title: "\u5E2E\u52A9\u652F\u6301",
        items: ["\u8054\u7CFB\u6211\u4EEC", "\u5546\u52A1\u5408\u4F5C", "\u53D1\u9001\u90AE\u4EF6"]
      },
      {
        title: "\u5173\u6CE8\u6211\u4EEC",
        extra: "\u83B7\u53D6\u6700\u65B0\u4FC3\u9500\u4FE1\u606F\u548C\u72EC\u5BB6\u4F18\u60E0",
        icons: [
          { label: "\u5FAE\u4FE1", svg: `<img src="/images/link1.png" alt="link1" style="width:24px;height:24px;" />` },
          { label: "\u5FAE\u535A", svg: `<img src="/images/link2.png" alt="link2" style="width:24px;height:24px;" />` },
          { label: "\u8BA2\u9605", svg: `<img src="/images/link3.png" alt="link3" style="width:24px;height:24px;" />` },
          { label: "\u6296\u97F3", svg: `<img src="/images/link4.png" alt="link4" style="width:24px;height:24px;" />` }
        ],
        partner: true
        // 标记此列下方有合作伙伴
      }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$2;
      const _component_JoinUsModal = __nuxt_component_1$1;
      _push(`<footer${ssrRenderAttrs(mergeProps({ class: "app-footer" }, _attrs))} data-v-c9608074><div class="footer-bg" data-v-c9608074><div class="footer-cols" data-v-c9608074><!--[-->`);
      ssrRenderList(cols, (col, idx) => {
        _push(`<div class="footer-col" data-v-c9608074><div class="footer-title" data-v-c9608074>${ssrInterpolate(col.title)}</div><div class="footer-underline" data-v-c9608074></div>`);
        if (col.items && !col.icons) {
          _push(`<div class="footer-items" data-v-c9608074><!--[-->`);
          ssrRenderList(col.items, (item) => {
            _push(`<!--[-->`);
            if (item === "\u4E2A\u4EBA\u4E2D\u5FC3") {
              _push(`<button class="footer-item footer-link footer-button" data-v-c9608074>${ssrInterpolate(item)}</button>`);
            } else if (item === "\u6211\u7684\u8BA2\u5355") {
              _push(`<button class="footer-item footer-link footer-button" data-v-c9608074>${ssrInterpolate(item)}</button>`);
            } else if (item === "\u9080\u8BF7\u63A8\u5E7F") {
              _push(`<button class="footer-item footer-link footer-button" data-v-c9608074>${ssrInterpolate(item)}</button>`);
            } else if (item === "\u793E\u533A\u5E2E\u52A9") {
              _push(ssrRenderComponent(_component_NuxtLink, {
                to: "/community",
                class: "footer-item footer-link"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(item)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(item), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
            } else if (item === "\u9690\u79C1\u653F\u7B56") {
              _push(ssrRenderComponent(_component_NuxtLink, {
                to: "/privacy",
                class: "footer-item footer-link"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(item)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(item), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
            } else if (item === "\u7528\u6237\u534F\u8BAE") {
              _push(ssrRenderComponent(_component_NuxtLink, {
                to: "/policy",
                class: "footer-item footer-link"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(item)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(item), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
            } else if (item === "\u9000\u6B3E\u653F\u7B56") {
              _push(ssrRenderComponent(_component_NuxtLink, {
                to: "/refund",
                class: "footer-item footer-link"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(item)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(item), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
            } else if (item === "\u514D\u8D23\u58F0\u660E") {
              _push(ssrRenderComponent(_component_NuxtLink, {
                to: "/disclaimer",
                class: "footer-item footer-link"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(item)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(item), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
            } else if (item === "\u516C\u53F8\u7B80\u4ECB") {
              _push(ssrRenderComponent(_component_NuxtLink, {
                to: "/company",
                class: "footer-item footer-link"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(item)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(item), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
            } else if (item === "\u6211\u4EEC\u7684\u4F7F\u547D" || item === "\u6211\u4EEC\u7684\u4F18\u52BF") {
              _push(ssrRenderComponent(_component_NuxtLink, {
                to: "/about-us",
                class: "footer-item footer-link"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(item)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(item), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
            } else if (item === "\u52A0\u5165\u6211\u4EEC") {
              _push(`<button class="footer-item footer-link footer-button" data-v-c9608074>${ssrInterpolate(item)}</button>`);
            } else {
              _push(`<div class="footer-item" data-v-c9608074>${ssrInterpolate(item)}</div>`);
            }
            _push(`<!--]-->`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        if (col.icons) {
          _push(`<div class="footer-icons" data-v-c9608074><!--[-->`);
          ssrRenderList(col.icons, (icon) => {
            var _a;
            _push(`<span class="footer-icon" data-v-c9608074>${(_a = icon.svg) != null ? _a : ""}</span>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        if (col.extra && !col.partner) {
          _push(`<div class="footer-extra" data-v-c9608074>${ssrInterpolate(col.extra)}</div>`);
        } else {
          _push(`<!---->`);
        }
        if (col.partner) {
          _push(`<div class="footer-partner-block" data-v-c9608074><div class="footer-title" data-v-c9608074>\u5408\u4F5C\u4F19\u4F34</div><div class="footer-underline" data-v-c9608074></div><div class="footer-partner-list" data-v-c9608074>\u652F\u4ED8\u5B9D | \u987A\u4E30\u901F\u8FD0 | \u4EAC\u4E1C\u7269\u6D41</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]--></div><div class="footer-bottom" data-v-c9608074> \xA9 2019-2025 \u51E1\u56FE\u62C9 | \u4E91\u5357\u51E1\u56FE\u62C9\u79D1\u6280\u6709\u9650\u516C\u53F8 | \u6EC7ICP\u5907 2025060486\u53F7-1 </div></div>`);
      _push(ssrRenderComponent(_component_JoinUsModal, {
        visible: showJoinUs.value,
        onClose: closeJoinUs
      }, null, _parent));
      _push(ssrRenderComponent(__nuxt_component_2, {
        visible: showLoginModal.value,
        onClose: closeLoginModal
      }, null, _parent));
      _push(`</footer>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AppFooter.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c9608074"]]);

export { __nuxt_component_0 as _, __nuxt_component_1 as a, __nuxt_component_0$1 as b };
//# sourceMappingURL=AppFooter-DftAiZQA.mjs.map
