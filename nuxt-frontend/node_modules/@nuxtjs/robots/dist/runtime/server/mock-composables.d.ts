import type { H3Event } from 'h3';
import type { BotDetectionContext } from '../types.js';
export declare function getPathRobotConfig(e: H3Event, options?: {
    skipSiteIndexable?: boolean;
    path?: string;
}): {
    indexable: boolean;
    rule: string;
};
export declare function getSiteRobotConfig(e: H3Event): {
    indexable: boolean;
    hints: string[];
};
export declare function getBotDetection(e: H3Event): BotDetectionContext;
export declare function isBot(e: H3Event): boolean;
export declare function getBotInfo(e: H3Event): null;
