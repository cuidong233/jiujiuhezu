import { defineNuxtPlugin, useNuxtApp, useRequestEvent } from "#app";
import { i18nPluginDeps } from "#build/nuxt-site-config/i18n-plugin-deps.mjs";
import { parseURL } from "ufo";
import { computed, toValue, watch } from "vue";
export default defineNuxtPlugin({
  name: "nuxt-site-config:i18n",
  dependsOn: i18nPluginDeps,
  setup(nuxtApp) {
    const i18n = nuxtApp.$i18n;
    if (!i18n)
      return;
    const stack = import.meta.server ? useRequestEvent()?.context.siteConfig : useNuxtApp().$nuxtSiteConfig;
    const i18nBaseUrl = toValue(i18n.baseUrl);
    if (i18nBaseUrl) {
      const siteConfig = stack.get({ resolveRefs: true });
      const currentUrl = siteConfig.url;
      if (currentUrl && !currentUrl.includes("localhost")) {
        const i18nURL = parseURL(i18nBaseUrl, "https://");
        const siteConfigURL = parseURL(currentUrl, "https://");
        if (i18nURL.host !== siteConfigURL.host) {
          if (siteConfig.env === "production") {
            console.error(`[Nuxt Site Config] Your I18n baseUrl \`${i18nURL.host}\` doesn't match your site url ${siteConfigURL.host}. This will cause production SEO issues. Either provide a matching baseUrl or remove the site url config.`);
          }
        }
      }
    }
    let siteConfigEntry;
    watch(i18n.locale, () => {
      if (siteConfigEntry) {
        siteConfigEntry();
      }
      const defaultLocale = computed(() => {
        const locale = toValue(i18n.locales).find((l) => l.code === i18n.defaultLocale);
        return locale?.language || locale?.iso || i18n.defaultLocale;
      });
      siteConfigEntry = stack.push({
        _priority: import.meta.server ? -2 : -1,
        _context: "@nuxtjs/i18n",
        url: computed(() => {
          const url = toValue(i18n.baseUrl);
          return url || void 0;
        }),
        defaultLocale,
        currentLocale: computed(() => {
          const properties = toValue(i18n.localeProperties);
          if (properties.language) {
            return properties.language;
          }
          return defaultLocale.value;
        }),
        // @ts-expect-error untyped
        description: computed(() => i18n.te("nuxtSiteConfig.description") ? i18n.t("nuxtSiteConfig.description") : void 0),
        // @ts-expect-error untyped
        name: computed(() => i18n.te("nuxtSiteConfig.name") ? i18n.t("nuxtSiteConfig.name") : void 0)
      });
    }, {
      immediate: true
    });
  }
});
