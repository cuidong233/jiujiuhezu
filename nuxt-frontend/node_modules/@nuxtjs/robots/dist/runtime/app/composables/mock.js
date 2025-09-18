import { computed, ref } from "vue";
export function useRobotsRule(rule) {
  return ref("");
}
export function useBotDetection(_options) {
  return {
    isBot: computed(() => false),
    botName: computed(() => void 0),
    botCategory: computed(() => void 0),
    trusted: computed(() => void 0),
    reset: () => {
    }
  };
}
