"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevtoolsPluginApiInstance = exports.DevtoolsApi = void 0;
const shared_utils_1 = require("@vue-devtools/shared-utils");
const devtools_api_1 = require("@vue/devtools-api");
const hooks_1 = require("./hooks");
const pluginOn = [];
class DevtoolsApi {
    constructor(backend, ctx) {
        this.stateEditor = new shared_utils_1.StateEditor();
        this.backend = backend;
        this.ctx = ctx;
        this.bridge = ctx.bridge;
        this.on = new hooks_1.DevtoolsHookable(ctx);
    }
    async callHook(eventType, payload, ctx = this.ctx) {
        payload = await this.on.callHandlers(eventType, payload, ctx);
        for (const on of pluginOn) {
            payload = await on.callHandlers(eventType, payload, ctx);
        }
        return payload;
    }
    async transformCall(callName, ...args) {
        const payload = await this.callHook("transformCall" /* Hooks.TRANSFORM_CALL */, {
            callName,
            inArgs: args,
            outArgs: args.slice(),
        });
        return payload.outArgs;
    }
    async getAppRecordName(app, defaultName) {
        const payload = await this.callHook("getAppRecordName" /* Hooks.GET_APP_RECORD_NAME */, {
            app,
            name: null,
        });
        if (payload.name) {
            return payload.name;
        }
        else {
            return `App ${defaultName}`;
        }
    }
    async getAppRootInstance(app) {
        const payload = await this.callHook("getAppRootInstance" /* Hooks.GET_APP_ROOT_INSTANCE */, {
            app,
            root: null,
        });
        return payload.root;
    }
    async registerApplication(app) {
        await this.callHook("registerApplication" /* Hooks.REGISTER_APPLICATION */, {
            app,
        });
    }
    async walkComponentTree(instance, maxDepth = -1, filter = null, recursively = false) {
        const payload = await this.callHook("walkComponentTree" /* Hooks.WALK_COMPONENT_TREE */, {
            componentInstance: instance,
            componentTreeData: null,
            maxDepth,
            filter,
            recursively,
        });
        return payload.componentTreeData;
    }
    async visitComponentTree(instance, treeNode, filter = null, app) {
        const payload = await this.callHook("visitComponentTree" /* Hooks.VISIT_COMPONENT_TREE */, {
            app,
            componentInstance: instance,
            treeNode,
            filter,
        });
        return payload.treeNode;
    }
    async walkComponentParents(instance) {
        const payload = await this.callHook("walkComponentParents" /* Hooks.WALK_COMPONENT_PARENTS */, {
            componentInstance: instance,
            parentInstances: [],
        });
        return payload.parentInstances;
    }
    async inspectComponent(instance, app) {
        const payload = await this.callHook("inspectComponent" /* Hooks.INSPECT_COMPONENT */, {
            app,
            componentInstance: instance,
            instanceData: null,
        });
        return payload.instanceData;
    }
    async getComponentBounds(instance) {
        const payload = await this.callHook("getComponentBounds" /* Hooks.GET_COMPONENT_BOUNDS */, {
            componentInstance: instance,
            bounds: null,
        });
        return payload.bounds;
    }
    async getComponentName(instance) {
        const payload = await this.callHook("getComponentName" /* Hooks.GET_COMPONENT_NAME */, {
            componentInstance: instance,
            name: null,
        });
        return payload.name;
    }
    async getComponentInstances(app) {
        const payload = await this.callHook("getComponentInstances" /* Hooks.GET_COMPONENT_INSTANCES */, {
            app,
            componentInstances: [],
        });
        return payload.componentInstances;
    }
    async getElementComponent(element) {
        const payload = await this.callHook("getElementComponent" /* Hooks.GET_ELEMENT_COMPONENT */, {
            element,
            componentInstance: null,
        });
        return payload.componentInstance;
    }
    async getComponentRootElements(instance) {
        const payload = await this.callHook("getComponentRootElements" /* Hooks.GET_COMPONENT_ROOT_ELEMENTS */, {
            componentInstance: instance,
            rootElements: [],
        });
        return payload.rootElements;
    }
    async editComponentState(instance, dotPath, type, state, app) {
        const arrayPath = dotPath.split('.');
        const payload = await this.callHook("editComponentState" /* Hooks.EDIT_COMPONENT_STATE */, {
            app,
            componentInstance: instance,
            path: arrayPath,
            type,
            state,
            set: (object, path = arrayPath, value = state.value, cb) => this.stateEditor.set(object, path, value, cb || this.stateEditor.createDefaultSetCallback(state)),
        });
        return payload.componentInstance;
    }
    async getComponentDevtoolsOptions(instance) {
        const payload = await this.callHook("getAppDevtoolsOptions" /* Hooks.GET_COMPONENT_DEVTOOLS_OPTIONS */, {
            componentInstance: instance,
            options: null,
        });
        return payload.options || {};
    }
    async getComponentRenderCode(instance) {
        const payload = await this.callHook("getComponentRenderCode" /* Hooks.GET_COMPONENT_RENDER_CODE */, {
            componentInstance: instance,
            code: null,
        });
        return {
            code: payload.code,
        };
    }
    async inspectTimelineEvent(eventData, app) {
        const payload = await this.callHook("inspectTimelineEvent" /* Hooks.INSPECT_TIMELINE_EVENT */, {
            event: eventData.event,
            layerId: eventData.layerId,
            app,
            data: eventData.event.data,
            all: eventData.all,
        });
        return payload.data;
    }
    async clearTimeline() {
        await this.callHook("timelineCleared" /* Hooks.TIMELINE_CLEARED */, {});
    }
    async getInspectorTree(inspectorId, app, filter) {
        const payload = await this.callHook("getInspectorTree" /* Hooks.GET_INSPECTOR_TREE */, {
            inspectorId,
            app,
            filter,
            rootNodes: [],
        });
        return payload.rootNodes;
    }
    async getInspectorState(inspectorId, app, nodeId) {
        const payload = await this.callHook("getInspectorState" /* Hooks.GET_INSPECTOR_STATE */, {
            inspectorId,
            app,
            nodeId,
            state: null,
        });
        return payload.state;
    }
    async editInspectorState(inspectorId, app, nodeId, dotPath, type, state) {
        const arrayPath = dotPath.split('.');
        await this.callHook("editInspectorState" /* Hooks.EDIT_INSPECTOR_STATE */, {
            inspectorId,
            app,
            nodeId,
            path: arrayPath,
            type,
            state,
            set: (object, path = arrayPath, value = state.value, cb) => this.stateEditor.set(object, path, value, cb || this.stateEditor.createDefaultSetCallback(state)),
        });
    }
    now() {
        return (0, devtools_api_1.now)();
    }
}
exports.DevtoolsApi = DevtoolsApi;
class DevtoolsPluginApiInstance {
    constructor(plugin, appRecord, ctx) {
        this.bridge = ctx.bridge;
        this.ctx = ctx;
        this.plugin = plugin;
        this.appRecord = appRecord;
        this.backendApi = appRecord.backend.api;
        this.defaultSettings = (0, shared_utils_1.getPluginDefaultSettings)(plugin.descriptor.settings);
        this.on = new hooks_1.DevtoolsHookable(ctx, plugin);
        pluginOn.push(this.on);
    }
    // Plugin API
    async notifyComponentUpdate(instance = null) {
        if (!this.enabled || !this.hasPermission(shared_utils_1.PluginPermission.COMPONENTS))
            return;
        if (instance) {
            this.ctx.hook.emit(shared_utils_1.HookEvents.COMPONENT_UPDATED, ...await this.backendApi.transformCall(shared_utils_1.HookEvents.COMPONENT_UPDATED, instance));
        }
        else {
            this.ctx.hook.emit(shared_utils_1.HookEvents.COMPONENT_UPDATED);
        }
    }
    addTimelineLayer(options) {
        if (!this.enabled || !this.hasPermission(shared_utils_1.PluginPermission.TIMELINE))
            return false;
        this.ctx.hook.emit(shared_utils_1.HookEvents.TIMELINE_LAYER_ADDED, options, this.plugin);
        return true;
    }
    addTimelineEvent(options) {
        if (!this.enabled || !this.hasPermission(shared_utils_1.PluginPermission.TIMELINE))
            return false;
        this.ctx.hook.emit(shared_utils_1.HookEvents.TIMELINE_EVENT_ADDED, options, this.plugin);
        return true;
    }
    addInspector(options) {
        if (!this.enabled || !this.hasPermission(shared_utils_1.PluginPermission.CUSTOM_INSPECTOR))
            return false;
        this.ctx.hook.emit(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_ADD, options, this.plugin);
        return true;
    }
    sendInspectorTree(inspectorId) {
        if (!this.enabled || !this.hasPermission(shared_utils_1.PluginPermission.CUSTOM_INSPECTOR))
            return false;
        this.ctx.hook.emit(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_SEND_TREE, inspectorId, this.plugin);
        return true;
    }
    sendInspectorState(inspectorId) {
        if (!this.enabled || !this.hasPermission(shared_utils_1.PluginPermission.CUSTOM_INSPECTOR))
            return false;
        this.ctx.hook.emit(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_SEND_STATE, inspectorId, this.plugin);
        return true;
    }
    selectInspectorNode(inspectorId, nodeId) {
        if (!this.enabled || !this.hasPermission(shared_utils_1.PluginPermission.CUSTOM_INSPECTOR))
            return false;
        this.ctx.hook.emit(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_SELECT_NODE, inspectorId, nodeId, this.plugin);
        return true;
    }
    getComponentBounds(instance) {
        return this.backendApi.getComponentBounds(instance);
    }
    getComponentName(instance) {
        return this.backendApi.getComponentName(instance);
    }
    getComponentInstances(app) {
        return this.backendApi.getComponentInstances(app);
    }
    highlightElement(instance) {
        if (!this.enabled || !this.hasPermission(shared_utils_1.PluginPermission.COMPONENTS))
            return false;
        this.ctx.hook.emit(shared_utils_1.HookEvents.COMPONENT_HIGHLIGHT, instance.__VUE_DEVTOOLS_UID__, this.plugin);
        return true;
    }
    unhighlightElement() {
        if (!this.enabled || !this.hasPermission(shared_utils_1.PluginPermission.COMPONENTS))
            return false;
        this.ctx.hook.emit(shared_utils_1.HookEvents.COMPONENT_UNHIGHLIGHT, this.plugin);
        return true;
    }
    getSettings(pluginId) {
        return (0, shared_utils_1.getPluginSettings)(pluginId !== null && pluginId !== void 0 ? pluginId : this.plugin.descriptor.id, this.defaultSettings);
    }
    setSettings(value, pluginId) {
        (0, shared_utils_1.setPluginSettings)(pluginId !== null && pluginId !== void 0 ? pluginId : this.plugin.descriptor.id, value);
    }
    now() {
        return (0, devtools_api_1.now)();
    }
    get enabled() {
        return (0, shared_utils_1.hasPluginPermission)(this.plugin.descriptor.id, shared_utils_1.PluginPermission.ENABLED);
    }
    hasPermission(permission) {
        return (0, shared_utils_1.hasPluginPermission)(this.plugin.descriptor.id, permission);
    }
}
exports.DevtoolsPluginApiInstance = DevtoolsPluginApiInstance;
//# sourceMappingURL=api.js.map