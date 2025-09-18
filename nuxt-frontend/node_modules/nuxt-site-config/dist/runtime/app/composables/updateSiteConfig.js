import { useNuxtApp, useRequestEvent } from "#app";
export function updateSiteConfig(input = {}) {
  const stack = import.meta.server ? useRequestEvent()?.context.siteConfig : useNuxtApp().$nuxtSiteConfig;
  return stack.push(input);
}
