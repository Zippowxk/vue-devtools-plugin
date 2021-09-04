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
                // Plugin permission
                if (!shared_utils_1.hasPluginPermission(this.plugin.descriptor.id, shared_utils_1.PluginPermission.ENABLED) ||
                    (pluginPermision && !shared_utils_1.hasPluginPermission(this.plugin.descriptor.id, pluginPermision)))
                    return;
                // App scope
                if (!this.plugin.descriptor.disableAppScope &&
                    this.ctx.currentAppRecord.options.app !== this.plugin.descriptor.app)
                    return;
                return originalHandler(...args);
            };
        }
        handlers.push({
            handler,
            plugin: this.ctx.currentPlugin
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
                    console.error(`An error occured in hook ${eventType}${plugin ? ` registered by plugin ${plugin.descriptor.id}` : ''}`);
                    console.error(e);
                }
            }
        }
        return payload;
    }
    transformCall(handler) {
        this.hook("transformCall" /* TRANSFORM_CALL */, handler);
    }
    getAppRecordName(handler) {
        this.hook("getAppRecordName" /* GET_APP_RECORD_NAME */, handler);
    }
    getAppRootInstance(handler) {
        this.hook("getAppRootInstance" /* GET_APP_ROOT_INSTANCE */, handler);
    }
    registerApplication(handler) {
        this.hook("registerApplication" /* REGISTER_APPLICATION */, handler);
    }
    walkComponentTree(handler) {
        this.hook("walkComponentTree" /* WALK_COMPONENT_TREE */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    visitComponentTree(handler) {
        this.hook("visitComponentTree" /* VISIT_COMPONENT_TREE */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    walkComponentParents(handler) {
        this.hook("walkComponentParents" /* WALK_COMPONENT_PARENTS */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    inspectComponent(handler) {
        this.hook("inspectComponent" /* INSPECT_COMPONENT */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    getComponentBounds(handler) {
        this.hook("getComponentBounds" /* GET_COMPONENT_BOUNDS */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    getComponentName(handler) {
        this.hook("getComponentName" /* GET_COMPONENT_NAME */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    getComponentInstances(handler) {
        this.hook("getComponentInstances" /* GET_COMPONENT_INSTANCES */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    getElementComponent(handler) {
        this.hook("getElementComponent" /* GET_ELEMENT_COMPONENT */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    getComponentRootElements(handler) {
        this.hook("getComponentRootElements" /* GET_COMPONENT_ROOT_ELEMENTS */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    editComponentState(handler) {
        this.hook("editComponentState" /* EDIT_COMPONENT_STATE */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    getComponentDevtoolsOptions(handler) {
        this.hook("getAppDevtoolsOptions" /* GET_COMPONENT_DEVTOOLS_OPTIONS */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    getComponentRenderCode(handler) {
        this.hook("getComponentRenderCode" /* GET_COMPONENT_RENDER_CODE */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    inspectTimelineEvent(handler) {
        this.hook("inspectTimelineEvent" /* INSPECT_TIMELINE_EVENT */, handler, shared_utils_1.PluginPermission.TIMELINE);
    }
    timelineCleared(handler) {
        this.hook("timelineCleared" /* TIMELINE_CLEARED */, handler, shared_utils_1.PluginPermission.TIMELINE);
    }
    getInspectorTree(handler) {
        this.hook("getInspectorTree" /* GET_INSPECTOR_TREE */, handler, shared_utils_1.PluginPermission.CUSTOM_INSPECTOR);
    }
    getInspectorState(handler) {
        this.hook("getInspectorState" /* GET_INSPECTOR_STATE */, handler, shared_utils_1.PluginPermission.CUSTOM_INSPECTOR);
    }
    editInspectorState(handler) {
        this.hook("editInspectorState" /* EDIT_INSPECTOR_STATE */, handler, shared_utils_1.PluginPermission.CUSTOM_INSPECTOR);
    }
}
exports.DevtoolsHookable = DevtoolsHookable;
//# sourceMappingURL=hooks.js.map