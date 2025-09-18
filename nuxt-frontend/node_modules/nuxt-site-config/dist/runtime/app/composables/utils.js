import { useRuntimeConfig } from "#app";
import { fixSlashes, resolveSitePath } from "site-config-stack/urls";
import { computed, unref } from "vue";
import { useNitroOrigin } from "./useNitroOrigin.js";
import { useSiteConfig } from "./useSiteConfig.js";
export function createSitePathResolver(options = {}) {
  const siteConfig = useSiteConfig();
  const nitroOrigin = useNitroOrigin();
  const nuxtBase = useRuntimeConfig().app.baseURL || "/";
  return (path) => {
    return computed(() => resolveSitePath(unref(path), {
      absolute: unref(options.absolute),
      withBase: unref(options.withBase),
      siteUrl: unref(options.canonical) !== false || import.meta.prerender ? siteConfig.url : nitroOrigin,
      trailingSlash: siteConfig.trailingSlash,
      base: nuxtBase
    }));
  };
}
export function withSiteTrailingSlash(path) {
  const siteConfig = useSiteConfig();
  return computed(() => fixSlashes(siteConfig.trailingSlash, unref(path)));
}
export function withSiteUrl(path, options = {}) {
  const siteConfig = useSiteConfig();
  const nitroOrigin = useNitroOrigin();
  const base = useRuntimeConfig().app.baseURL || "/";
  return computed(() => {
    return resolveSitePath(unref(path), {
      absolute: true,
      siteUrl: unref(options.canonical) !== false || import.meta.prerender ? siteConfig.url : nitroOrigin,
      trailingSlash: siteConfig.trailingSlash,
      base,
      withBase: unref(options.withBase)
    });
  });
}
