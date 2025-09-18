import { defineNuxtPlugin } from "nuxt/app";
import { useBotDetection } from "../composables/useBotDetection.js";
export default defineNuxtPlugin({
  setup() {
    useBotDetection();
  }
});
