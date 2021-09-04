"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevtoolsPluginApiInstance = exports.DevtoolsApi = void 0;
const shared_utils_1 = require("@vue-devtools/shared-utils");
const hooks_1 = require("./hooks");
let backendOn;
const pluginOn = [];
class DevtoolsApi {
    constructor(bridge, ctx) {
        this.bridge = bridge;
        this.ctx = ctx;
        if (!backendOn) {
            backendOn = new hooks_1.DevtoolsHookable(ctx);
        }
    }
    get on() {
        return backendOn;
    }
    async callHook(eventType, payload, ctx = this.ctx) {
        payload = await backendOn.callHandlers(eventType, payload, ctx);
        for (const on of pluginOn) {
            payload = await on.callHandlers(eventType, payload, ctx);
        }
        return payload;
    }
    async transformCall(callName, ...args) {
        const payload = await this.callHook("transformCall" /* TRANSFORM_CALL */, {
            callName,
            inArgs: args,
            outArgs: args.slice()
        });
        return payload.outArgs;
    }
    async getAppRecordName(app, id) {
        const payload = await this.callHook("getAppRecordName" /* GET_APP_RECORD_NAME */, {
            app,
            name: null
        });
        if (payload.name) {
            return payload.name;
        }
        else {
            return `App ${id + 1}`;
        }
    }
    async getAppRootInstance(app) {
        const payload = await this.callHook("getAppRootInstance" /* GET_APP_ROOT_INSTANCE */, {
            app,
            root: null
        });
        return payload.root;
    }
    async registerApplication(app) {
        await this.callHook("registerApplication" /* REGISTER_APPLICATION */, {
            app
        });
    }
    async walkComponentTree(instance, maxDepth = -1, filter = null) {
        const payload = await this.callHook("walkComponentTree" /* WALK_COMPONENT_TREE */, {
            componentInstance: instance,
            componentTreeData: null,
            maxDepth,
            filter
        });
        return payload.componentTreeData;
    }
    async visitComponentTree(instance, treeNode, filter = null, app) {
        const payload = await this.callHook("visitComponentTree" /* VISIT_COMPONENT_TREE */, {
            app,
            componentInstance: instance,
            treeNode,
            filter
        });
        return payload.treeNode;
    }
    async walkComponentParents(instance) {
        const payload = await this.callHook("walkComponentParents" /* WALK_COMPONENT_PARENTS */, {
            componentInstance: instance,
            parentInstances: []
        });
        return payload.parentInstances;
    }
    async inspectComponent(instance, app) {
        const payload = await this.callHook("inspectComponent" /* INSPECT_COMPONENT */, {
            app,
            componentInstance: instance,
            instanceData: null
        });
        return payload.instanceData;
    }
    async getComponentBounds(instance) {
        const payload = await this.callHook("getComponentBounds" /* GET_COMPONENT_BOUNDS */, {
            componentInstance: instance,
            bounds: null
        });
        return payload.bounds;
    }
    async getComponentName(instance) {
        const payload = await this.callHook("getComponentName" /* GET_COMPONENT_NAME */, {
            componentInstance: instance,
            name: null
        });
        return payload.name;
    }
    async getComponentInstances(app) {
        const payload = await this.callHook("getComponentInstances" /* GET_COMPONENT_INSTANCES */, {
            app,
            componentInstances: []
        });
        return payload.componentInstances;
    }
    async getElementComponent(element) {
        const payload = await this.callHook("getElementComponent" /* GET_ELEMENT_COMPONENT */, {
            element,
            componentInstance: null
        });
        return payload.componentInstance;
    }
    async getComponentRootElements(instance) {
        const payload = await this.callHook("getComponentRootElements" /* GET_COMPONENT_ROOT_ELEMENTS */, {
            componentInstance: instance,
            rootElements: []
        });
        return payload.rootElements;
    }
    async editComponentState(instance, dotPath, type, state, app) {
        const arrayPath = dotPath.split('.');
        const payload = await this.callHook("editComponentState" /* EDIT_COMPONENT_STATE */, {
            app,
            componentInstance: instance,
            path: arrayPath,
            type,
            state,
            set: (object, path = arrayPath, value = state.value, cb) => shared_utils_1.set(object, path, value, cb || createDefaultSetCallback(state))
        });
        return payload.componentInstance;
    }
    async getComponentDevtoolsOptions(instance) {
        const payload = await this.callHook("getAppDevtoolsOptions" /* GET_COMPONENT_DEVTOOLS_OPTIONS */, {
            componentInstance: instance,
            options: null
        });
        return payload.options || {};
    }
    async getComponentRenderCode(instance) {
        const payload = await this.callHook("getComponentRenderCode" /* GET_COMPONENT_RENDER_CODE */, {
            componentInstance: instance,
            code: null
        });
        return {
            code: payload.code
        };
    }
    async inspectTimelineEvent(eventData, app) {
        const payload = await this.callHook("inspectTimelineEvent" /* INSPECT_TIMELINE_EVENT */, {
            event: eventData.event,
            layerId: eventData.layerId,
            app,
            data: eventData.event.data,
            all: eventData.all
        });
        return payload.data;
    }
    async clearTimeline() {
        await this.callHook("timelineCleared" /* TIMELINE_CLEARED */, {});
    }
    async getInspectorTree(inspectorId, app, filter) {
        const payload = await this.callHook("getInspectorTree" /* GET_INSPECTOR_TREE */, {
            inspectorId,
            app,
            filter,
            rootNodes: []
        });
        return payload.rootNodes;
    }
    async getInspectorState(inspectorId, app, nodeId) {
        const payload = await this.callHook("getInspectorState" /* GET_INSPECTOR_STATE */, {
            inspectorId,
            app,
            nodeId,
            state: null
        });
        return payload.state;
    }
    async editInspectorState(inspectorId, app, nodeId, dotPath, type, state) {
        const arrayPath = dotPath.split('.');
        await this.callHook("editInspectorState" /* EDIT_INSPECTOR_STATE */, {
            inspectorId,
            app,
            nodeId,
            path: arrayPath,
            type,
            state,
            set: (object, path = arrayPath, value = state.value, cb) => shared_utils_1.set(object, path, value, cb || createDefaultSetCallback(state))
        });
    }
}
exports.DevtoolsApi = DevtoolsApi;
function createDefaultSetCallback(state) {
    return (obj, field, value) => {
        if (state.remove || state.newKey) {
            if (Array.isArray(obj)) {
                obj.splice(field, 1);
            }
            else {
                delete obj[field];
            }
        }
        if (!state.remove) {
            obj[state.newKey || field] = value;
        }
    };
}
class DevtoolsPluginApiInstance {
    constructor(plugin, ctx) {
        this.bridge = ctx.bridge;
        this.ctx = ctx;
        this.plugin = plugin;
        this.on = new hooks_1.DevtoolsHookable(ctx, plugin);
        pluginOn.push(this.on);
    }
    // Plugin API
    async notifyComponentUpdate(instance = null) {
        if (!this.enabled || !this.hasPermission(shared_utils_1.PluginPermission.COMPONENTS))
            return;
        if (instance) {
            this.ctx.hook.emit(shared_utils_1.HookEvents.COMPONENT_UPDATED, ...await this.ctx.api.transformCall(shared_utils_1.HookEvents.COMPONENT_UPDATED, instance));
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
        return this.ctx.api.getComponentBounds(instance);
    }
    getComponentName(instance) {
        return this.ctx.api.getComponentName(instance);
    }
    getComponentInstances(app) {
        return this.ctx.api.getComponentInstances(app);
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
    get enabled() {
        return shared_utils_1.hasPluginPermission(this.plugin.descriptor.id, shared_utils_1.PluginPermission.ENABLED);
    }
    hasPermission(permission) {
        return shared_utils_1.hasPluginPermission(this.plugin.descriptor.id, permission);
    }
}
exports.DevtoolsPluginApiInstance = DevtoolsPluginApiInstance;
//# sourceMappingURL=api.js.map