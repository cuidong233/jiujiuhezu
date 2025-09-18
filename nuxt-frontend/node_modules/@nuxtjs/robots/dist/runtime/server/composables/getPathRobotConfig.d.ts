import type { H3Event } from 'h3';
import type { RobotsContext } from '../../types.js';
export declare function getPathRobotConfig(e: H3Event, options?: {
    userAgent?: string;
    skipSiteIndexable?: boolean;
    path?: string;
}): RobotsContext;
