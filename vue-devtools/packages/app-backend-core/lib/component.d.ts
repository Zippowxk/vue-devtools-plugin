import { AppRecord, BackendContext } from '@vue-devtools/app-backend-api';
import { App, EditStatePayload } from '@vue/devtools-api';
export declare function sendComponentTreeData(appRecord: AppRecord, instanceId: string, filter: string, maxDepth: number, ctx: BackendContext): Promise<void>;
export declare function sendSelectedComponentData(appRecord: AppRecord, instanceId: string, ctx: BackendContext): Promise<void>;
export declare function markSelectedInstance(instanceId: string, ctx: BackendContext): void;
export declare function sendEmptyComponentData(instanceId: string, ctx: BackendContext): void;
export declare function editComponentState(instanceId: string, dotPath: string, type: string, state: EditStatePayload, ctx: BackendContext): Promise<void>;
export declare function getComponentId(app: App, uid: number, ctx: BackendContext): Promise<string>;
export declare function getComponentInstance(appRecord: AppRecord, instanceId: string, ctx: BackendContext): any;
