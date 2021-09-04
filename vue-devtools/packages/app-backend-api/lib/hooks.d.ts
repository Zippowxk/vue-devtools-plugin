import { Hooks, HookPayloads, Hookable, HookHandler } from '@vue/devtools-api';
import { BackendContext } from './backend-context';
import { Plugin } from './plugin';
declare type Handler<TPayload> = HookHandler<TPayload, BackendContext>;
export interface HookHandlerData<THandlerPayload> {
    handler: Handler<THandlerPayload>;
    plugin: Plugin;
}
export declare class DevtoolsHookable implements Hookable<BackendContext> {
    private handlers;
    private ctx;
    private plugin;
    constructor(ctx: BackendContext, plugin?: Plugin);
    private hook;
    callHandlers<T extends Hooks>(eventType: T, payload: HookPayloads[T], ctx: BackendContext): Promise<HookPayloads[T]>;
    transformCall(handler: Handler<HookPayloads[Hooks.TRANSFORM_CALL]>): void;
    getAppRecordName(handler: Handler<HookPayloads[Hooks.GET_APP_RECORD_NAME]>): void;
    getAppRootInstance(handler: Handler<HookPayloads[Hooks.GET_APP_ROOT_INSTANCE]>): void;
    registerApplication(handler: Handler<HookPayloads[Hooks.REGISTER_APPLICATION]>): void;
    walkComponentTree(handler: Handler<HookPayloads[Hooks.WALK_COMPONENT_TREE]>): void;
    visitComponentTree(handler: Handler<HookPayloads[Hooks.VISIT_COMPONENT_TREE]>): void;
    walkComponentParents(handler: Handler<HookPayloads[Hooks.WALK_COMPONENT_PARENTS]>): void;
    inspectComponent(handler: Handler<HookPayloads[Hooks.INSPECT_COMPONENT]>): void;
    getComponentBounds(handler: Handler<HookPayloads[Hooks.GET_COMPONENT_BOUNDS]>): void;
    getComponentName(handler: Handler<HookPayloads[Hooks.GET_COMPONENT_NAME]>): void;
    getComponentInstances(handler: Handler<HookPayloads[Hooks.GET_COMPONENT_INSTANCES]>): void;
    getElementComponent(handler: Handler<HookPayloads[Hooks.GET_ELEMENT_COMPONENT]>): void;
    getComponentRootElements(handler: Handler<HookPayloads[Hooks.GET_COMPONENT_ROOT_ELEMENTS]>): void;
    editComponentState(handler: Handler<HookPayloads[Hooks.EDIT_COMPONENT_STATE]>): void;
    getComponentDevtoolsOptions(handler: Handler<HookPayloads[Hooks.GET_COMPONENT_DEVTOOLS_OPTIONS]>): void;
    getComponentRenderCode(handler: Handler<HookPayloads[Hooks.GET_COMPONENT_RENDER_CODE]>): void;
    inspectTimelineEvent(handler: Handler<HookPayloads[Hooks.INSPECT_TIMELINE_EVENT]>): void;
    timelineCleared(handler: Handler<HookPayloads[Hooks.TIMELINE_CLEARED]>): void;
    getInspectorTree(handler: Handler<HookPayloads[Hooks.GET_INSPECTOR_TREE]>): void;
    getInspectorState(handler: Handler<HookPayloads[Hooks.GET_INSPECTOR_STATE]>): void;
    editInspectorState(handler: Handler<HookPayloads[Hooks.EDIT_INSPECTOR_STATE]>): void;
}
export {};
