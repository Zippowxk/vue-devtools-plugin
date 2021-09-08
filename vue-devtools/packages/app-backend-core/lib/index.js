"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.initBackend = void 0;
const app_backend_api_1 = require("@vue-devtools/app-backend-api");
const shared_utils_1 = require("@vue-devtools/shared-utils");
const global_hook_1 = {hook:window['__VUE_DEVTOOLS_GLOBAL_HOOK__']}//require("./global-hook");
const subscriptions_1 = require("./util/subscriptions");
const highlighter_1 = require("./highlighter");
const timeline_1 = require("./timeline");
const component_pick_1 = __importDefault(require("./component-pick"));
const component_1 = require("./component");
const plugin_1 = require("./plugin");
const app_1 = require("./app");
const inspector_1 = require("./inspector");
const timeline_screenshot_1 = require("./timeline-screenshot");
const perf_1 = require("./perf");
const page_config_1 = require("./page-config");
let ctx = (_a = shared_utils_1.target.__vdevtools_ctx) !== null && _a !== void 0 ? _a : null;
let connected = (_b = shared_utils_1.target.__vdevtools_connected) !== null && _b !== void 0 ? _b : false;
async function initBackend(bridge) {
    await shared_utils_1.initSharedData({
        bridge,
        persist: false
    });
    page_config_1.initOnPageConfig();
    global_hook_1.hook = window['__VUE_DEVTOOLS_GLOBAL_HOOK__']
    if (!connected) {
        // connected = false
        ctx = shared_utils_1.target.__vdevtools_ctx = app_backend_api_1.createBackendContext({
            bridge,
            hook: global_hook_1.hook
        });
        if (global_hook_1.hook.Vue) {
            connect();
            app_1._legacy_getAndRegisterApps(global_hook_1.hook.Vue, ctx);
        }
        else {
            global_hook_1.hook.once(shared_utils_1.HookEvents.INIT, (Vue) => {
                app_1._legacy_getAndRegisterApps(Vue, ctx);
            });
        }
        global_hook_1.hook.on(shared_utils_1.HookEvents.APP_ADD, async (app) => {
            await app_1.registerApp(app, ctx);
            // Will init connect
            global_hook_1.hook.emit(shared_utils_1.HookEvents.INIT);
        });
        // Add apps that already sent init
        if (global_hook_1.hook.apps.length) {
            global_hook_1.hook.apps.forEach(app => {
                app_1.registerApp(app, ctx);
                connect();
            });
        }
    }
    else {
        ctx.bridge = bridge;
        connectBridge();
    }
}
exports.initBackend = initBackend;
async function connect() {
    if (connected) {
        return;
    }
    connected = shared_utils_1.target.__vdevtools_connected = true;
    await app_1.waitForAppsRegistration();
    connectBridge();
    ctx.currentTab = shared_utils_1.BuiltinTabs.COMPONENTS;
    // Apps
    global_hook_1.hook.on(shared_utils_1.HookEvents.APP_UNMOUNT, app => {
        app_1.removeApp(app, ctx);
    });
    // Components
    global_hook_1.hook.on(shared_utils_1.HookEvents.COMPONENT_UPDATED, async (app, uid, parentUid, component) => {
        try {
            let id;
            let appRecord;
            if (app && uid != null) {
                id = await component_1.getComponentId(app, uid, ctx);
                appRecord = await app_1.getAppRecord(app, ctx);
            }
            else {
                id = ctx.currentInspectedComponentId;
                appRecord = ctx.currentAppRecord;
            }
            // Update component inspector
            if (id && subscriptions_1.isSubscribed(shared_utils_1.BridgeSubscriptions.SELECTED_COMPONENT_DATA, sub => sub.payload.instanceId === id)) {
                component_1.sendSelectedComponentData(appRecord, id, ctx);
            }
            // Update tree (tags)
            if (subscriptions_1.isSubscribed(shared_utils_1.BridgeSubscriptions.COMPONENT_TREE, sub => sub.payload.instanceId === id)) {
                component_1.sendComponentTreeData(appRecord, id, appRecord.componentFilter, 0, ctx);
            }
        }
        catch (e) {
            if (process.env.NODE_ENV !== 'production') {
                console.error(e);
            }
        }
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.COMPONENT_ADDED, async (app, uid, parentUid, component) => {
        try {
            const id = await component_1.getComponentId(app, uid, ctx);
            const appRecord = await app_1.getAppRecord(app, ctx);
            if (component) {
                if (component.__VUE_DEVTOOLS_UID__ == null) {
                    component.__VUE_DEVTOOLS_UID__ = id;
                }
                if (!appRecord.instanceMap.has(id)) {
                    appRecord.instanceMap.set(id, component);
                }
            }
            const parentId = await component_1.getComponentId(app, parentUid, ctx);
            if (subscriptions_1.isSubscribed(shared_utils_1.BridgeSubscriptions.COMPONENT_TREE, sub => sub.payload.instanceId === parentId)) {
                requestAnimationFrame(() => {
                    component_1.sendComponentTreeData(appRecord, parentId, appRecord.componentFilter, null, ctx);
                });
            }
            if (ctx.currentInspectedComponentId === id) {
                component_1.sendSelectedComponentData(appRecord, id, ctx);
            }
        }
        catch (e) {
            if (process.env.NODE_ENV !== 'production') {
                console.error(e);
            }
        }
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.COMPONENT_REMOVED, async (app, uid, parentUid, component) => {
        try {
            const appRecord = await app_1.getAppRecord(app, ctx);
            const parentId = await component_1.getComponentId(app, parentUid, ctx);
            if (subscriptions_1.isSubscribed(shared_utils_1.BridgeSubscriptions.COMPONENT_TREE, sub => sub.payload.instanceId === parentId)) {
                requestAnimationFrame(async () => {
                    try {
                        component_1.sendComponentTreeData(await app_1.getAppRecord(app, ctx), parentId, appRecord.componentFilter, null, ctx);
                    }
                    catch (e) {
                        if (process.env.NODE_ENV !== 'production') {
                            console.error(e);
                        }
                    }
                });
            }
            const id = await component_1.getComponentId(app, uid, ctx);
            if (subscriptions_1.isSubscribed(shared_utils_1.BridgeSubscriptions.SELECTED_COMPONENT_DATA, sub => sub.payload.instanceId === id)) {
                component_1.sendEmptyComponentData(id, ctx);
            }
            appRecord.instanceMap.delete(id);
        }
        catch (e) {
            if (process.env.NODE_ENV !== 'production') {
                console.error(e);
            }
        }
    });
    // Component perf
    global_hook_1.hook.on(shared_utils_1.HookEvents.PERFORMANCE_START, (app, uid, vm, type, time) => {
        perf_1.performanceMarkStart(app, uid, vm, type, time, ctx);
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.PERFORMANCE_END, (app, uid, vm, type, time) => {
        perf_1.performanceMarkEnd(app, uid, vm, type, time, ctx);
    });
    perf_1.handleAddPerformanceTag(ctx);
    // Highlighter
    global_hook_1.hook.on(shared_utils_1.HookEvents.COMPONENT_HIGHLIGHT, instanceId => {
        highlighter_1.highlight(ctx.currentAppRecord.instanceMap.get(instanceId), ctx);
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.COMPONENT_UNHIGHLIGHT, () => {
        highlighter_1.unHighlight();
    });
    // Timeline
    timeline_1.setupTimeline(ctx);
    global_hook_1.hook.on(shared_utils_1.HookEvents.TIMELINE_LAYER_ADDED, (options, plugin) => {
        ctx.timelineLayers.push({
            ...options,
            app: plugin.descriptor.app,
            plugin,
            events: []
        });
        ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_TIMELINE_LAYER_ADD, {});
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.TIMELINE_EVENT_ADDED, (options, plugin) => {
        timeline_1.addTimelineEvent(options, plugin.descriptor.app, ctx);
    });
    // Custom inspectors
    global_hook_1.hook.on(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_ADD, (options, plugin) => {
        ctx.customInspectors.push({
            ...options,
            app: plugin.descriptor.app,
            plugin,
            treeFilter: '',
            selectedNodeId: null
        });
        ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_ADD, {});
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_SEND_TREE, (inspectorId, plugin) => {
        const inspector = inspector_1.getInspector(inspectorId, plugin.descriptor.app, ctx);
        if (inspector) {
            inspector_1.sendInspectorTree(inspector, ctx);
        }
        else {
            console.error(`Inspector ${inspectorId} not found`);
        }
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_SEND_STATE, (inspectorId, plugin) => {
        const inspector = inspector_1.getInspector(inspectorId, plugin.descriptor.app, ctx);
        if (inspector) {
            inspector_1.sendInspectorState(inspector, ctx);
        }
        else {
            console.error(`Inspector ${inspectorId} not found`);
        }
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_SELECT_NODE, async (inspectorId, nodeId, plugin) => {
        const inspector = inspector_1.getInspector(inspectorId, plugin.descriptor.app, ctx);
        if (inspector) {
            await inspector_1.selectInspectorNode(inspector, nodeId, ctx);
        }
        else {
            console.error(`Inspector ${inspectorId} not found`);
        }
    });
    // Plugins
    plugin_1.addPreviouslyRegisteredPlugins(ctx);
    plugin_1.addQueuedPlugins(ctx);
    global_hook_1.hook.on(shared_utils_1.HookEvents.SETUP_DEVTOOLS_PLUGIN, (pluginDescriptor, setupFn) => {
        plugin_1.addPlugin(pluginDescriptor, setupFn, ctx);
    });
    // Legacy flush
    global_hook_1.hook.off('flush');
    global_hook_1.hook.on('flush', () => {
        var _a;
        if ((_a = ctx.currentAppRecord) === null || _a === void 0 ? void 0 : _a.backend.availableFeatures.includes(app_backend_api_1.BuiltinBackendFeature.FLUSH)) {
            component_1.sendComponentTreeData(ctx.currentAppRecord, '_root', ctx.currentAppRecord.componentFilter, null, ctx);
            if (ctx.currentInspectedComponentId) {
                component_1.sendSelectedComponentData(ctx.currentAppRecord, ctx.currentInspectedComponentId, ctx);
            }
        }
    });
}
function connectBridge() {
    // Subscriptions
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_SUBSCRIBE, ({ type, payload }) => {
        subscriptions_1.subscribe(type, payload);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_UNSUBSCRIBE, ({ type, payload }) => {
        subscriptions_1.unsubscribe(type, payload);
    });
    // Tabs
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_TAB_SWITCH, async (tab) => {
        ctx.currentTab = tab;
        await highlighter_1.unHighlight();
    });
    // Apps
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_APP_LIST, () => {
        console.log('====================================');
        console.log('TO_BACK_APP_LIST');
        console.log('====================================');
        debugger
        app_1.sendApps(ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_APP_SELECT, async (id) => {
        if (id == null)
            return;
        const record = ctx.appRecords.find(r => r.id === id);
        if (!record) {
            console.error(`App with id ${id} not found`);
        }
        else {
            await app_1.selectApp(record, ctx);
        }
    });
    // Components
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_TREE, ({ instanceId, filter }) => {
        ctx.currentAppRecord.componentFilter = filter;
        component_1.sendComponentTreeData(ctx.currentAppRecord, instanceId, filter, null, ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_SELECTED_DATA, (instanceId) => {
        component_1.sendSelectedComponentData(ctx.currentAppRecord, instanceId, ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_EDIT_STATE, ({ instanceId, dotPath, type, value, newKey, remove }) => {
        component_1.editComponentState(instanceId, dotPath, type, { value, newKey, remove }, ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_INSPECT_DOM, async ({ instanceId }) => {
        const instance = component_1.getComponentInstance(ctx.currentAppRecord, instanceId, ctx);
        if (instance) {
            const [el] = await ctx.api.getComponentRootElements(instance);
            if (el) {
                // @ts-ignore
                window.__VUE_DEVTOOLS_INSPECT_TARGET__ = el;
                ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_INSPECT_DOM, null);
            }
        }
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_SCROLL_TO, async ({ instanceId }) => {
        const instance = component_1.getComponentInstance(ctx.currentAppRecord, instanceId, ctx);
        if (instance) {
            const [el] = await ctx.api.getComponentRootElements(instance);
            if (el) {
                if (typeof el.scrollIntoView === 'function') {
                    el.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'center'
                    });
                }
                else {
                    // Handle nodes that don't implement scrollIntoView
                    const bounds = await ctx.api.getComponentBounds(instance);
                    const scrollTarget = document.createElement('div');
                    scrollTarget.style.position = 'absolute';
                    scrollTarget.style.width = `${bounds.width}px`;
                    scrollTarget.style.height = `${bounds.height}px`;
                    scrollTarget.style.top = `${bounds.top}px`;
                    scrollTarget.style.left = `${bounds.left}px`;
                    document.body.appendChild(scrollTarget);
                    scrollTarget.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'center'
                    });
                    setTimeout(() => {
                        document.body.removeChild(scrollTarget);
                    }, 2000);
                }
                highlighter_1.highlight(instance, ctx);
                setTimeout(() => {
                    highlighter_1.unHighlight();
                }, 2000);
            }
        }
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_RENDER_CODE, async ({ instanceId }) => {
        const instance = component_1.getComponentInstance(ctx.currentAppRecord, instanceId, ctx);
        if (instance) {
            const { code } = await ctx.api.getComponentRenderCode(instance);
            ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_RENDER_CODE, {
                instanceId,
                code
            });
        }
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_CUSTOM_STATE_ACTION, async ({ value, actionIndex }) => {
        const rawAction = value._custom.actions[actionIndex];
        const action = shared_utils_1.revive(rawAction === null || rawAction === void 0 ? void 0 : rawAction.action);
        if (action) {
            try {
                await action();
            }
            catch (e) {
                console.error(e);
            }
        }
        else {
            console.warn(`Couldn't revive action ${actionIndex} from`, value);
        }
    });
    // Highlighter
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_MOUSE_OVER, instanceId => {
        highlighter_1.highlight(ctx.currentAppRecord.instanceMap.get(instanceId), ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_MOUSE_OUT, () => {
        highlighter_1.unHighlight();
    });
    // Component picker
    const componentPicker = new component_pick_1.default(ctx);
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_PICK, () => {
        componentPicker.startSelecting();
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_PICK_CANCELED, () => {
        componentPicker.stopSelecting();
    });
    // Timeline
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_TIMELINE_LAYER_LIST, () => {
        timeline_1.sendTimelineLayers(ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_TIMELINE_SHOW_SCREENSHOT, ({ screenshot }) => {
        timeline_screenshot_1.showScreenshot(screenshot, ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_TIMELINE_CLEAR, async () => {
        await timeline_1.clearTimeline(ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_TIMELINE_EVENT_DATA, async ({ id }) => {
        await timeline_1.sendTimelineEventData(id, ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_TIMELINE_LAYER_LOAD_EVENTS, ({ appId, layerId }) => {
        timeline_1.sendTimelineLayerEvents(appId, layerId, ctx);
    });
    // Custom inspectors
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_LIST, () => {
        inspector_1.sendCustomInspectors(ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_TREE, ({ inspectorId, appId, treeFilter }) => {
        const inspector = inspector_1.getInspectorWithAppId(inspectorId, appId, ctx);
        if (inspector) {
            inspector.treeFilter = treeFilter;
            inspector_1.sendInspectorTree(inspector, ctx);
        }
        else {
            console.error(`Inspector ${inspectorId} not found`);
        }
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_STATE, ({ inspectorId, appId, nodeId }) => {
        const inspector = inspector_1.getInspectorWithAppId(inspectorId, appId, ctx);
        if (inspector) {
            inspector.selectedNodeId = nodeId;
            inspector_1.sendInspectorState(inspector, ctx);
        }
        else {
            console.error(`Inspector ${inspectorId} not found`);
        }
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_EDIT_STATE, async ({ inspectorId, appId, nodeId, path, type, payload }) => {
        const inspector = inspector_1.getInspectorWithAppId(inspectorId, appId, ctx);
        if (inspector) {
            await inspector_1.editInspectorState(inspector, nodeId, path, type, payload, ctx);
            inspector.selectedNodeId = nodeId;
            await inspector_1.sendInspectorState(inspector, ctx);
        }
        else {
            console.error(`Inspector ${inspectorId} not found`);
        }
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_ACTION, async ({ inspectorId, appId, actionIndex }) => {
        const inspector = inspector_1.getInspectorWithAppId(inspectorId, appId, ctx);
        if (inspector) {
            const action = inspector.actions[actionIndex];
            try {
                await action.action();
            }
            catch (e) {
                console.error(e);
            }
        }
        else {
            console.error(`Inspector ${inspectorId} not found`);
        }
    });
    // Misc
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_LOG, (payload) => {
        let value = payload.value;
        if (payload.serialized) {
            value = shared_utils_1.parse(value, payload.revive);
        }
        else if (payload.revive) {
            value = shared_utils_1.revive(value);
        }
        console[payload.level](value);
    });
    // Plugins
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_DEVTOOLS_PLUGIN_LIST, () => {
        plugin_1.sendPluginList(ctx);
    });
}
//# sourceMappingURL=index.js.map