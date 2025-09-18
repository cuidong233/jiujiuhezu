<script setup>
import { computed, resolveComponent, toRefs } from "vue";
import { createSitePathResolver } from "../composables/utils";
const props = defineProps({
  canonical: { type: Boolean, required: false },
  absolute: { type: Boolean, required: false },
  withBase: { type: Boolean, required: false },
  to: { type: String, required: false },
  href: { type: String, required: false },
  external: { type: Boolean, required: false },
  target: { type: [String, null], required: false },
  rel: { type: [String, null], required: false },
  noRel: { type: Boolean, required: false },
  prefetchedClass: { type: String, required: false },
  prefetch: { type: Boolean, required: false },
  noPrefetch: { type: Boolean, required: false }
});
const propRefs = toRefs(props);
const linkResolver = createSitePathResolver(propRefs);
const NuxtLink = resolveComponent("NuxtLink");
const to = computed(() => {
  const _to = props.to;
  if (!_to)
    return void 0;
  return linkResolver(_to);
});
</script>

<template>
  <NuxtLink v-bind="$props" :to="to">
    <slot />
  </NuxtLink>
</template>
