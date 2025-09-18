import { useRuntimeConfig } from "nitropack/runtime";
export function useRuntimeConfigNuxtRobots(event) {
  return useRuntimeConfig(event)["nuxt-robots"];
}
