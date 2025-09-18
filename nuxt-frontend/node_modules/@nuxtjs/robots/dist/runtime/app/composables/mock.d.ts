import type { MaybeRef } from 'vue';
import type { UseBotDetectionOptions, UseBotDetectionReturn } from '../../types.js';
export declare function useRobotsRule(rule?: MaybeRef<boolean | string>): import("vue").Ref<string, string>;
export declare function useBotDetection(_options?: UseBotDetectionOptions): UseBotDetectionReturn;
