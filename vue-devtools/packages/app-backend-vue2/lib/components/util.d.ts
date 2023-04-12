import { AppRecord } from '@vue-devtools/app-backend-api';
export declare function isBeingDestroyed(instance: any): any;
/**
 * Get the appropriate display name for an instance.
 */
export declare function getInstanceName(instance: any): any;
export declare function getRenderKey(value: any): string;
/**
 * Returns a devtools unique id for instance.
 */
export declare function getUniqueId(instance: any, appRecord?: AppRecord): string;
