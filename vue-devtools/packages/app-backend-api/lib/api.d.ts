import { Bridge } from '@vue-devtools/shared-utils';
import { Hooks, HookPayloads, App, DevtoolsPluginApi, ComponentInstance, TimelineLayerOptions, TimelineEventOptions, CustomInspectorOptions, EditStatePayload, WithId, ComponentTreeNode, ComponentDevtoolsOptions } from '@vue/devtools-api';
import { DevtoolsHookable } from './hooks';
import { BackendContext } from './backend-context';
import { Plugin } from './plugin';
export declare class DevtoolsApi {
    bridge: Bridge;
    ctx: BackendContext;
    constructor(bridge: Bridge, ctx: BackendContext);
    get on(): DevtoolsHookable;
    callHook<T extends Hooks>(eventType: T, payload: HookPayloads[T], ctx?: BackendContext): Promise<HookPayloads[T]>;
    transformCall(callName: string, ...args: any[]): Promise<any[]>;
    getAppRecordName(app: App, id: number): Promise<string>;
    getAppRootInstance(app: App): Promise<any>;
    registerApplication(app: App): Promise<void>;
    walkComponentTree(instance: ComponentInstance, maxDepth?: number, filter?: string): Promise<ComponentTreeNode[]>;
    visitComponentTree(instance: ComponentInstance, treeNode: ComponentTreeNode, filter: string, app: App): Promise<ComponentTreeNode>;
    walkComponentParents(instance: ComponentInstance): Promise<any[]>;
    inspectComponent(instance: ComponentInstance, app: App): Promise<import("@vue/devtools-api").InspectedComponentData>;
    getComponentBounds(instance: ComponentInstance): Promise<import("@vue/devtools-api").ComponentBounds>;
    getComponentName(instance: ComponentInstance): Promise<string>;
    getComponentInstances(app: App): Promise<any[]>;
    getElementComponent(element: HTMLElement | any): Promise<any>;
    getComponentRootElements(instance: ComponentInstance): Promise<any[]>;
    editComponentState(instance: ComponentInstance, dotPath: string, type: string, state: EditStatePayload, app: App): Promise<any>;
    getComponentDevtoolsOptions(instance: ComponentInstance): Promise<ComponentDevtoolsOptions>;
    getComponentRenderCode(instance: ComponentInstance): Promise<{
        code: string;
    }>;
    inspectTimelineEvent(eventData: TimelineEventOptions & WithId, app: App): Promise<any>;
    clearTimeline(): Promise<void>;
    getInspectorTree(inspectorId: string, app: App, filter: string): Promise<import("@vue/devtools-api").CustomInspectorNode[]>;
    getInspectorState(inspectorId: string, app: App, nodeId: string): Promise<import("@vue/devtools-api").CustomInspectorState>;
    editInspectorState(inspectorId: string, app: App, nodeId: string, dotPath: string, type: string, state: EditStatePayload): Promise<void>;
}
export declare class DevtoolsPluginApiInstance implements DevtoolsPluginApi {
    bridge: Bridge;
    ctx: BackendContext;
    plugin: Plugin;
    on: DevtoolsHookable;
    constructor(plugin: Plugin, ctx: BackendContext);
    notifyComponentUpdate(instance?: ComponentInstance): Promise<void>;
    addTimelineLayer(options: TimelineLayerOptions): boolean;
    addTimelineEvent(options: TimelineEventOptions): boolean;
    addInspector(options: CustomInspectorOptions): boolean;
    sendInspectorTree(inspectorId: string): boolean;
    sendInspectorState(inspectorId: string): boolean;
    selectInspectorNode(inspectorId: string, nodeId: string): boolean;
    getComponentBounds(instance: ComponentInstance): Promise<import("@vue/devtools-api").ComponentBounds>;
    getComponentName(instance: ComponentInstance): Promise<string>;
    getComponentInstances(app: App): Promise<any[]>;
    highlightElement(instance: ComponentInstance): boolean;
    unhighlightElement(): boolean;
    private get enabled();
    private hasPermission;
}
