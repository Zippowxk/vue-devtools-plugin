"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevtoolsHookable = void 0;
const shared_utils_1 = require("@vue-devtools/shared-utils");
class DevtoolsHookable {
    constructor(ctx, plugin = null) {
        this.handlers = {};
        this.ctx = ctx;
        this.plugin = plugin;
    }
    hook(eventType, handler, pluginPermision = null) {
        const handlers = (this.handlers[eventType] = this.handlers[eventType] || []);
        if (this.plugin) {
            const originalHandler = handler;
            handler = (...args) => {
                var _a;
                // Plugin permission
                if (!(0, shared_utils_1.hasPluginPermission)(this.plugin.descriptor.id, shared_utils_1.PluginPermission.ENABLED) ||
                    (pluginPermision && !(0, shared_utils_1.hasPluginPermission)(this.plugin.descriptor.id, pluginPermision)))
                    return;
                // App scope
                if (!this.plugin.descriptor.disableAppScope &&
                    ((_a = this.ctx.currentAppRecord) === null || _a === void 0 ? void 0 : _a.options.app) !== this.plugin.descriptor.app)
                    return;
                // Plugin scope
                if (!this.plugin.descriptor.disablePluginScope &&
                    args[0].pluginId != null && args[0].pluginId !== this.plugin.descriptor.id)
                    return;
                return originalHandler(...args);
            };
        }
        handlers.push({
            handler,
            plugin: this.ctx.currentPlugin,
        });
    }
    async callHandlers(eventType, payload, ctx) {
        if (this.handlers[eventType]) {
            const handlers = this.handlers[eventType];
            for (let i = 0; i < handlers.length; i++) {
                const { handler, plugin } = handlers[i];
                try {
                    await handler(payload, ctx);
                }
                catch (e) {
                    console.error(`An error occurred in hook '${eventType}'${plugin ? ` registered by plugin '${plugin.descriptor.id}'` : ''} with payload:`, payload);
                    console.error(e);
                }
            }
        }
        return payload;
    }
    transformCall(handler) {
        this.hook("transformCall" /* Hooks.TRANSFORM_CALL */, handler);
    }
    getAppRecordName(handler) {
        this.hook("getAppRecordName" /* Hooks.GET_APP_RECORD_NAME */, handler);
    }
    getAppRootInstance(handler) {
        this.hook("getAppRootInstance" /* Hooks.GET_APP_ROOT_INSTANCE */, handler);
    }
    registerApplication(handler) {
        this.hook("registerApplication" /* Hooks.REGISTER_APPLICATION */, handler);
    }
    walkComponentTree(handler) {
        this.hook("walkComponentTree" /* Hooks.WALK_COMPONENT_TREE */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    visitComponentTree(handler) {
        this.hook("visitComponentTree" /* Hooks.VISIT_COMPONENT_TREE */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    walkComponentParents(handler) {
        this.hook("walkComponentParents" /* Hooks.WALK_COMPONENT_PARENTS */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    inspectComponent(handler) {
        this.hook("inspectComponent" /* Hooks.INSPECT_COMPONENT */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    getComponentBounds(handler) {
        this.hook("getComponentBounds" /* Hooks.GET_COMPONENT_BOUNDS */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    getComponentName(handler) {
        this.hook("getComponentName" /* Hooks.GET_COMPONENT_NAME */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    getComponentInstances(handler) {
        this.hook("getComponentInstances" /* Hooks.GET_COMPONENT_INSTANCES */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    getElementComponent(handler) {
        this.hook("getElementComponent" /* Hooks.GET_ELEMENT_COMPONENT */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    getComponentRootElements(handler) {
        this.hook("getComponentRootElements" /* Hooks.GET_COMPONENT_ROOT_ELEMENTS */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    editComponentState(handler) {
        this.hook("editComponentState" /* Hooks.EDIT_COMPONENT_STATE */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    getComponentDevtoolsOptions(handler) {
        this.hook("getAppDevtoolsOptions" /* Hooks.GET_COMPONENT_DEVTOOLS_OPTIONS */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    getComponentRenderCode(handler) {
        this.hook("getComponentRenderCode" /* Hooks.GET_COMPONENT_RENDER_CODE */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    inspectTimelineEvent(handler) {
        this.hook("inspectTimelineEvent" /* Hooks.INSPECT_TIMELINE_EVENT */, handler, shared_utils_1.PluginPermission.TIMELINE);
    }
    timelineCleared(handler) {
        this.hook("timelineCleared" /* Hooks.TIMELINE_CLEARED */, handler, shared_utils_1.PluginPermission.TIMELINE);
    }
    getInspectorTree(handler) {
        this.hook("getInspectorTree" /* Hooks.GET_INSPECTOR_TREE */, handler, shared_utils_1.PluginPermission.CUSTOM_INSPECTOR);
    }
    getInspectorState(handler) {
        this.hook("getInspectorState" /* Hooks.GET_INSPECTOR_STATE */, handler, shared_utils_1.PluginPermission.CUSTOM_INSPECTOR);
    }
    editInspectorState(handler) {
        this.hook("editInspectorState" /* Hooks.EDIT_INSPECTOR_STATE */, handler, shared_utils_1.PluginPermission.CUSTOM_INSPECTOR);
    }
    setPluginSettings(handler) {
        this.hook("setPluginSettings" /* Hooks.SET_PLUGIN_SETTINGS */, handler);
    }
}
exports.DevtoolsHookable = DevtoolsHookable;
//# sourceMappingURL=hooks.js.map