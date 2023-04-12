import { App } from '@vue/devtools-api';
import { BackendContext, CustomInspector } from '@vue-devtools/app-backend-api';
export declare function getInspector(inspectorId: string, app: App, ctx: BackendContext): CustomInspector;
export declare function getInspectorWithAppId(inspectorId: string, appId: string, ctx: BackendContext): Promise<CustomInspector>;
export declare function sendInspectorTree(inspector: CustomInspector, ctx: BackendContext): Promise<void>;
export declare function sendInspectorState(inspector: CustomInspector, ctx: BackendContext): Promise<void>;
export declare function editInspectorState(inspector: CustomInspector, nodeId: string, dotPath: string, type: string, state: any, ctx: BackendContext): Promise<void>;
export declare function sendCustomInspectors(ctx: BackendContext): Promise<void>;
export declare function selectInspectorNode(inspector: CustomInspector, nodeId: string, ctx: BackendContext): Promise<void>;
