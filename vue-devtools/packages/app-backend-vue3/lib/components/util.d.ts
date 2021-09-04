import { ComponentInstance, App } from '@vue/devtools-api';
import { BackendContext } from '@vue-devtools/app-backend-api';
export declare function isBeingDestroyed(instance: any): any;
export declare function getAppRecord(instance: any): any;
export declare function isFragment(instance: any): boolean;
/**
 * Get the appropriate display name for an instance.
 *
 * @param {Vue} instance
 * @return {String}
 */
export declare function getInstanceName(instance: any): any;
/**
 * Returns a devtools unique id for instance.
 * @param {Vue} instance
 */
export declare function getUniqueComponentId(instance: any, ctx: BackendContext): string;
export declare function getRenderKey(value: any): string;
export declare function getComponentInstances(app: App): ComponentInstance[];
