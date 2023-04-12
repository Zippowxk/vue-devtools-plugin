"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.initBackend = void 0;
const app_backend_api_1 = require("@vue-devtools/app-backend-api");
const shared_utils_1 = require("@vue-devtools/shared-utils");
const debounce_1 = __importDefault(require("lodash/debounce"));
const throttle_1 = __importDefault(require("lodash/throttle"));
const global_hook_1 = require("./global-hook");
const subscriptions_1 = require("./util/subscriptions");
const highlighter_1 = require("./highlighter");
const timeline_1 = require("./timeline");
const component_pick_1 = __importDefault(require("./component-pick"));
const component_1 = require("./component");
const plugin_1 = require("./plugin");
const devtools_api_1 = require("@vue/devtools-api");
const app_1 = require("./app");
const inspector_1 = require("./inspector");
const timeline_screenshot_1 = require("./timeline-screenshot");
const perf_1 = require("./perf");
const page_config_1 = require("./page-config");
const timeline_marker_1 = require("./timeline-marker");
const flash_js_1 = require("./flash.js");
let ctx = (_a = shared_utils_1.target.__vdevtools_ctx) !== null && _a !== void 0 ? _a : null;
let connected = (_b = shared_utils_1.target.__vdevtools_connected) !== null && _b !== void 0 ? _b : false;
async function initBackend(bridge) {
    await (0, shared_utils_1.initSharedData)({
        bridge,
        persist: false,
    });
    shared_utils_1.SharedData.isBrowser = shared_utils_1.isBrowser;
    (0, page_config_1.initOnPageConfig)();
    if (!connected) {
        // First connect
        ctx = shared_utils_1.target.__vdevtools_ctx = (0, app_backend_api_1.createBackendContext)({
            bridge,
            hook: global_hook_1.hook,
        });
        shared_utils_1.SharedData.legacyApps = false;
        console.log('====================================');
        console.log(global_hook_1);
        console.log(window.__VUE_DEVTOOLS_GLOBAL_HOOK__);
        console.log('====================================');
        if (global_hook_1.hook.Vue) {
            connect();
            (0, app_1._legacy_getAndRegisterApps)(ctx, true);
            shared_utils_1.SharedData.legacyApps = true;
        }
        global_hook_1.hook.on(shared_utils_1.HookEvents.INIT, () => {
            (0, app_1._legacy_getAndRegisterApps)(ctx, true);
            shared_utils_1.SharedData.legacyApps = true;
        });
        global_hook_1.hook.on(shared_utils_1.HookEvents.APP_ADD, async (app) => {
            await (0, app_1.registerApp)(app, ctx);
            connect();
        });
        // Add apps that already sent init
        if (global_hook_1.hook.apps.length) {
            global_hook_1.hook.apps.forEach(app => {
                (0, app_1.registerApp)(app, ctx);
                connect();
            });
        }
    }
    else {
        // Reconnect
        ctx.bridge = bridge;
        connectBridge();
        ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_RECONNECTED);
    }
}
exports.initBackend = initBackend;
async function connect() {
    if (connected) {
        return;
    }
    connected = shared_utils_1.target.__vdevtools_connected = true;
    await (0, app_1.waitForAppsRegistration)();
    connectBridge();
    ctx.currentTab = shared_utils_1.BuiltinTabs.COMPONENTS;
    // Apps
    global_hook_1.hook.on(shared_utils_1.HookEvents.APP_UNMOUNT, async (app) => {
        await (0, app_1.removeApp)(app, ctx);
    });
    // Components
    const sendComponentUpdate = (0, throttle_1.default)(async (appRecord, id) => {
        try {
            // Update component inspector
            if (id && (0, subscriptions_1.isSubscribed)(shared_utils_1.BridgeSubscriptions.SELECTED_COMPONENT_DATA, sub => sub.payload.instanceId === id)) {
                await (0, component_1.sendSelectedComponentData)(appRecord, id, ctx);
            }
            // Update tree (tags)
            if ((0, subscriptions_1.isSubscribed)(shared_utils_1.BridgeSubscriptions.COMPONENT_TREE, sub => sub.payload.instanceId === id)) {
                await (0, component_1.sendComponentTreeData)(appRecord, id, appRecord.componentFilter, 0, false, ctx);
            }
        }
        catch (e) {
            if (shared_utils_1.SharedData.debugInfo) {
                console.error(e);
            }
        }
    }, 100);
    global_hook_1.hook.on(shared_utils_1.HookEvents.COMPONENT_UPDATED, async (app, uid, parentUid, component) => {
        try {
            if (!app || (typeof uid !== 'number' && !uid) || !component)
                return;
            let id;
            let appRecord;
            if (app && uid != null) {
                id = await (0, component_1.getComponentId)(app, uid, component, ctx);
                appRecord = await (0, app_1.getAppRecord)(app, ctx);
            }
            else {
                id = ctx.currentInspectedComponentId;
                appRecord = ctx.currentAppRecord;
            }
            if (shared_utils_1.SharedData.trackUpdates) {
                await (0, component_1.sendComponentUpdateTracking)(id, ctx);
            }
            if (shared_utils_1.SharedData.flashUpdates) {
                await (0, flash_js_1.flashComponent)(component, appRecord.backend);
            }
            await sendComponentUpdate(appRecord, id);
        }
        catch (e) {
            if (shared_utils_1.SharedData.debugInfo) {
                console.error(e);
            }
        }
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.COMPONENT_ADDED, async (app, uid, parentUid, component) => {
        try {
            if (!app || (typeof uid !== 'number' && !uid) || !component)
                return;
            const id = await (0, component_1.getComponentId)(app, uid, component, ctx);
            const appRecord = await (0, app_1.getAppRecord)(app, ctx);
            if (component) {
                if (component.__VUE_DEVTOOLS_UID__ == null) {
                    component.__VUE_DEVTOOLS_UID__ = id;
                }
                if (!appRecord.instanceMap.has(id)) {
                    appRecord.instanceMap.set(id, component);
                }
            }
            if (parentUid != null) {
                const parentInstances = await appRecord.backend.api.walkComponentParents(component);
                if (parentInstances.length) {
                    // Check two parents level to update `hasChildren
                    for (let i = 0; i < parentInstances.length; i++) {
                        const parentId = await (0, component_1.getComponentId)(app, parentUid, parentInstances[i], ctx);
                        if (i < 2 && (0, subscriptions_1.isSubscribed)(shared_utils_1.BridgeSubscriptions.COMPONENT_TREE, sub => sub.payload.instanceId === parentId)) {
                            (0, shared_utils_1.raf)(() => {
                                (0, component_1.sendComponentTreeData)(appRecord, parentId, appRecord.componentFilter, null, false, ctx);
                            });
                        }
                        if (shared_utils_1.SharedData.trackUpdates) {
                            await (0, component_1.sendComponentUpdateTracking)(parentId, ctx);
                        }
                    }
                }
            }
            if (ctx.currentInspectedComponentId === id) {
                await (0, component_1.sendSelectedComponentData)(appRecord, id, ctx);
            }
            if (shared_utils_1.SharedData.trackUpdates) {
                await (0, component_1.sendComponentUpdateTracking)(id, ctx);
            }
            if (shared_utils_1.SharedData.flashUpdates) {
                await (0, flash_js_1.flashComponent)(component, appRecord.backend);
            }
            await (0, component_1.refreshComponentTreeSearch)(ctx);
        }
        catch (e) {
            if (shared_utils_1.SharedData.debugInfo) {
                console.error(e);
            }
        }
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.COMPONENT_REMOVED, async (app, uid, parentUid, component) => {
        try {
            if (!app || (typeof uid !== 'number' && !uid) || !component)
                return;
            const appRecord = await (0, app_1.getAppRecord)(app, ctx);
            if (parentUid != null) {
                const parentInstances = await appRecord.backend.api.walkComponentParents(component);
                if (parentInstances.length) {
                    const parentId = await (0, component_1.getComponentId)(app, parentUid, parentInstances[0], ctx);
                    if ((0, subscriptions_1.isSubscribed)(shared_utils_1.BridgeSubscriptions.COMPONENT_TREE, sub => sub.payload.instanceId === parentId)) {
                        (0, shared_utils_1.raf)(async () => {
                            try {
                                (0, component_1.sendComponentTreeData)(await (0, app_1.getAppRecord)(app, ctx), parentId, appRecord.componentFilter, null, false, ctx);
                            }
                            catch (e) {
                                if (shared_utils_1.SharedData.debugInfo) {
                                    console.error(e);
                                }
                            }
                        });
                    }
                }
            }
            const id = await (0, component_1.getComponentId)(app, uid, component, ctx);
            if ((0, subscriptions_1.isSubscribed)(shared_utils_1.BridgeSubscriptions.SELECTED_COMPONENT_DATA, sub => sub.payload.instanceId === id)) {
                await (0, component_1.sendEmptyComponentData)(id, ctx);
            }
            appRecord.instanceMap.delete(id);
            await (0, component_1.refreshComponentTreeSearch)(ctx);
        }
        catch (e) {
            if (shared_utils_1.SharedData.debugInfo) {
                console.error(e);
            }
        }
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.TRACK_UPDATE, (id, ctx) => {
        (0, component_1.sendComponentUpdateTracking)(id, ctx);
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.FLASH_UPDATE, (instance, backend) => {
        (0, flash_js_1.flashComponent)(instance, backend);
    });
    // Component perf
    global_hook_1.hook.on(shared_utils_1.HookEvents.PERFORMANCE_START, async (app, uid, vm, type, time) => {
        await (0, perf_1.performanceMarkStart)(app, uid, vm, type, time, ctx);
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.PERFORMANCE_END, async (app, uid, vm, type, time) => {
        await (0, perf_1.performanceMarkEnd)(app, uid, vm, type, time, ctx);
    });
    // Highlighter
    global_hook_1.hook.on(shared_utils_1.HookEvents.COMPONENT_HIGHLIGHT, async (instanceId) => {
        await (0, highlighter_1.highlight)(ctx.currentAppRecord.instanceMap.get(instanceId), ctx.currentAppRecord.backend, ctx);
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.COMPONENT_UNHIGHLIGHT, async () => {
        await (0, highlighter_1.unHighlight)();
    });
    // Timeline
    (0, timeline_1.setupTimeline)(ctx);
    global_hook_1.hook.on(shared_utils_1.HookEvents.TIMELINE_LAYER_ADDED, async (options, plugin) => {
        const appRecord = await (0, app_1.getAppRecord)(plugin.descriptor.app, ctx);
        ctx.timelineLayers.push({
            ...options,
            appRecord,
            plugin,
            events: [],
        });
        ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_TIMELINE_LAYER_ADD, {});
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.TIMELINE_EVENT_ADDED, async (options, plugin) => {
        await (0, timeline_1.addTimelineEvent)(options, plugin.descriptor.app, ctx);
    });
    // Custom inspectors
    global_hook_1.hook.on(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_ADD, async (options, plugin) => {
        const appRecord = await (0, app_1.getAppRecord)(plugin.descriptor.app, ctx);
        ctx.customInspectors.push({
            ...options,
            appRecord,
            plugin,
            treeFilter: '',
            selectedNodeId: null,
        });
        ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_ADD, {});
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_SEND_TREE, async (inspectorId, plugin) => {
        const inspector = (0, inspector_1.getInspector)(inspectorId, plugin.descriptor.app, ctx);
        if (inspector) {
            await (0, inspector_1.sendInspectorTree)(inspector, ctx);
        }
        else if (shared_utils_1.SharedData.debugInfo) {
            console.warn(`Inspector ${inspectorId} not found`);
        }
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_SEND_STATE, async (inspectorId, plugin) => {
        const inspector = (0, inspector_1.getInspector)(inspectorId, plugin.descriptor.app, ctx);
        if (inspector) {
            await (0, inspector_1.sendInspectorState)(inspector, ctx);
        }
        else if (shared_utils_1.SharedData.debugInfo) {
            console.warn(`Inspector ${inspectorId} not found`);
        }
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_SELECT_NODE, async (inspectorId, nodeId, plugin) => {
        const inspector = (0, inspector_1.getInspector)(inspectorId, plugin.descriptor.app, ctx);
        if (inspector) {
            await (0, inspector_1.selectInspectorNode)(inspector, nodeId, ctx);
        }
        else if (shared_utils_1.SharedData.debugInfo) {
            console.warn(`Inspector ${inspectorId} not found`);
        }
    });
    // Plugins
    try {
        await (0, plugin_1.addPreviouslyRegisteredPlugins)(ctx);
    }
    catch (e) {
        console.error(`Error adding previously registered plugins:`);
        console.error(e);
    }
    try {
        await (0, plugin_1.addQueuedPlugins)(ctx);
    }
    catch (e) {
        console.error(`Error adding queued plugins:`);
        console.error(e);
    }
    global_hook_1.hook.on(shared_utils_1.HookEvents.SETUP_DEVTOOLS_PLUGIN, async (pluginDescriptor, setupFn) => {
        await (0, plugin_1.addPlugin)({ pluginDescriptor, setupFn }, ctx);
    });
    shared_utils_1.target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ = true;
    // Legacy flush
    const handleFlush = (0, debounce_1.default)(async () => {
        var _a;
        if ((_a = ctx.currentAppRecord) === null || _a === void 0 ? void 0 : _a.backend.options.features.includes(app_backend_api_1.BuiltinBackendFeature.FLUSH)) {
            await (0, component_1.sendComponentTreeData)(ctx.currentAppRecord, '_root', ctx.currentAppRecord.componentFilter, null, false, ctx);
            if (ctx.currentInspectedComponentId) {
                await (0, component_1.sendSelectedComponentData)(ctx.currentAppRecord, ctx.currentInspectedComponentId, ctx);
            }
        }
    }, 500);
    global_hook_1.hook.off(shared_utils_1.HookEvents.FLUSH);
    global_hook_1.hook.on(shared_utils_1.HookEvents.FLUSH, handleFlush);
    // Connect done
    try {
        await (0, timeline_marker_1.addTimelineMarker)({
            id: 'vue-devtools-init-backend',
            time: (0, devtools_api_1.now)(),
            label: 'Vue Devtools connected',
            color: 0x41B883,
            all: true,
        }, ctx);
    }
    catch (e) {
        console.error(`Error while adding devtools connected timeline marker:`);
        console.error(e);
    }
}
function connectBridge() {
    // Subscriptions
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_SUBSCRIBE, ({ type, payload }) => {
        (0, subscriptions_1.subscribe)(type, payload);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_UNSUBSCRIBE, ({ type, payload }) => {
        (0, subscriptions_1.unsubscribe)(type, payload);
    });
    // Tabs
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_TAB_SWITCH, async (tab) => {
        ctx.currentTab = tab;
        await (0, highlighter_1.unHighlight)();
    });
    // Apps
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_APP_LIST, async () => {
        await (0, app_1.sendApps)(ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_APP_SELECT, async (id) => {
        if (id == null)
            return;
        const record = ctx.appRecords.find(r => r.id === id);
        if (record) {
            await (0, app_1.selectApp)(record, ctx);
        }
        else if (shared_utils_1.SharedData.debugInfo) {
            console.warn(`App with id ${id} not found`);
        }
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_SCAN_LEGACY_APPS, () => {
        if (global_hook_1.hook.Vue) {
            (0, app_1._legacy_getAndRegisterApps)(ctx);
        }
    });
    // Components
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_TREE, async ({ instanceId, filter, recursively }) => {
        ctx.currentAppRecord.componentFilter = filter;
        (0, subscriptions_1.subscribe)(shared_utils_1.BridgeSubscriptions.COMPONENT_TREE, { instanceId });
        await (0, component_1.sendComponentTreeData)(ctx.currentAppRecord, instanceId, filter, null, recursively, ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_SELECTED_DATA, async (instanceId) => {
        await (0, component_1.sendSelectedComponentData)(ctx.currentAppRecord, instanceId, ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_EDIT_STATE, async ({ instanceId, dotPath, type, value, newKey, remove }) => {
        await (0, component_1.editComponentState)(instanceId, dotPath, type, { value, newKey, remove }, ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_INSPECT_DOM, async ({ instanceId }) => {
        const instance = (0, component_1.getComponentInstance)(ctx.currentAppRecord, instanceId, ctx);
        if (instance) {
            const [el] = await ctx.currentAppRecord.backend.api.getComponentRootElements(instance);
            if (el) {
                // @ts-ignore
                shared_utils_1.target.__VUE_DEVTOOLS_INSPECT_TARGET__ = el;
                ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_INSPECT_DOM, null);
            }
        }
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_SCROLL_TO, async ({ instanceId }) => {
        if (!shared_utils_1.isBrowser)
            return;
        const instance = (0, component_1.getComponentInstance)(ctx.currentAppRecord, instanceId, ctx);
        if (instance) {
            const [el] = await ctx.currentAppRecord.backend.api.getComponentRootElements(instance);
            if (el) {
                if (typeof el.scrollIntoView === 'function') {
                    el.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'center',
                    });
                }
                else {
                    // Handle nodes that don't implement scrollIntoView
                    const bounds = await ctx.currentAppRecord.backend.api.getComponentBounds(instance);
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
                        inline: 'center',
                    });
                    setTimeout(() => {
                        document.body.removeChild(scrollTarget);
                    }, 2000);
                }
                (0, highlighter_1.highlight)(instance, ctx.currentAppRecord.backend, ctx);
                setTimeout(() => {
                    (0, highlighter_1.unHighlight)();
                }, 2000);
            }
        }
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_RENDER_CODE, async ({ instanceId }) => {
        if (!shared_utils_1.isBrowser)
            return;
        const instance = (0, component_1.getComponentInstance)(ctx.currentAppRecord, instanceId, ctx);
        if (instance) {
            const { code } = await ctx.currentAppRecord.backend.api.getComponentRenderCode(instance);
            ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_RENDER_CODE, {
                instanceId,
                code,
            });
        }
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_CUSTOM_STATE_ACTION, async ({ value, actionIndex }) => {
        const rawAction = value._custom.actions[actionIndex];
        const action = (0, shared_utils_1.revive)(rawAction === null || rawAction === void 0 ? void 0 : rawAction.action);
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
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_MOUSE_OVER, async (instanceId) => {
        await (0, highlighter_1.highlight)(ctx.currentAppRecord.instanceMap.get(instanceId), ctx.currentAppRecord.backend, ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_MOUSE_OUT, async () => {
        await (0, highlighter_1.unHighlight)();
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
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_TIMELINE_LAYER_LIST, async () => {
        await (0, timeline_1.sendTimelineLayers)(ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_TIMELINE_SHOW_SCREENSHOT, async ({ screenshot }) => {
        await (0, timeline_screenshot_1.showScreenshot)(screenshot, ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_TIMELINE_CLEAR, async () => {
        await (0, timeline_1.clearTimeline)(ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_TIMELINE_EVENT_DATA, async ({ id }) => {
        await (0, timeline_1.sendTimelineEventData)(id, ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_TIMELINE_LAYER_LOAD_EVENTS, async ({ appId, layerId }) => {
        await (0, timeline_1.sendTimelineLayerEvents)(appId, layerId, ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_TIMELINE_LOAD_MARKERS, async () => {
        await (0, timeline_marker_1.sendTimelineMarkers)(ctx);
    });
    // Custom inspectors
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_LIST, async () => {
        await (0, inspector_1.sendCustomInspectors)(ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_TREE, async ({ inspectorId, appId, treeFilter }) => {
        const inspector = await (0, inspector_1.getInspectorWithAppId)(inspectorId, appId, ctx);
        if (inspector) {
            inspector.treeFilter = treeFilter;
            (0, inspector_1.sendInspectorTree)(inspector, ctx);
        }
        else if (shared_utils_1.SharedData.debugInfo) {
            console.warn(`Inspector ${inspectorId} not found`);
        }
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_STATE, async ({ inspectorId, appId, nodeId }) => {
        const inspector = await (0, inspector_1.getInspectorWithAppId)(inspectorId, appId, ctx);
        if (inspector) {
            inspector.selectedNodeId = nodeId;
            (0, inspector_1.sendInspectorState)(inspector, ctx);
        }
        else if (shared_utils_1.SharedData.debugInfo) {
            console.warn(`Inspector ${inspectorId} not found`);
        }
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_EDIT_STATE, async ({ inspectorId, appId, nodeId, path, type, payload }) => {
        const inspector = await (0, inspector_1.getInspectorWithAppId)(inspectorId, appId, ctx);
        if (inspector) {
            await (0, inspector_1.editInspectorState)(inspector, nodeId, path, type, payload, ctx);
            inspector.selectedNodeId = nodeId;
            await (0, inspector_1.sendInspectorState)(inspector, ctx);
        }
        else if (shared_utils_1.SharedData.debugInfo) {
            console.warn(`Inspector ${inspectorId} not found`);
        }
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_ACTION, async ({ inspectorId, appId, actionIndex, actionType, args }) => {
        const inspector = await (0, inspector_1.getInspectorWithAppId)(inspectorId, appId, ctx);
        if (inspector) {
            const action = inspector[actionType !== null && actionType !== void 0 ? actionType : 'actions'][actionIndex];
            try {
                await action.action(...(args !== null && args !== void 0 ? args : []));
            }
            catch (e) {
                if (shared_utils_1.SharedData.debugInfo) {
                    console.error(e);
                }
            }
        }
        else if (shared_utils_1.SharedData.debugInfo) {
            console.warn(`Inspector ${inspectorId} not found`);
        }
    });
    // Misc
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_LOG, (payload) => {
        let value = payload.value;
        if (payload.serialized) {
            value = (0, shared_utils_1.parse)(value, payload.revive);
        }
        else if (payload.revive) {
            value = (0, shared_utils_1.revive)(value);
        }
        // eslint-disable-next-line no-console
        console[payload.level](value);
    });
    // Plugins
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_DEVTOOLS_PLUGIN_LIST, async () => {
        await (0, plugin_1.sendPluginList)(ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_DEVTOOLS_PLUGIN_SETTING_UPDATED, ({ pluginId, key, newValue, oldValue }) => {
        const settings = (0, shared_utils_1.getPluginSettings)(pluginId);
        ctx.hook.emit(shared_utils_1.HookEvents.PLUGIN_SETTINGS_SET, pluginId, settings);
        ctx.currentAppRecord.backend.api.callHook("setPluginSettings" /* Hooks.SET_PLUGIN_SETTINGS */, {
            app: ctx.currentAppRecord.options.app,
            pluginId,
            key,
            newValue,
            oldValue,
            settings,
        });
    });
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_TITLE, { title: document.title });
    // Watch page title
    const titleEl = document.querySelector('title');
    if (titleEl && typeof MutationObserver !== 'undefined') {
        if (pageTitleObserver) {
            pageTitleObserver.disconnect();
        }
        pageTitleObserver = new MutationObserver((mutations) => {
            const title = mutations[0].target;
            ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_TITLE, { title: title.innerText });
        });
        pageTitleObserver.observe(titleEl, { subtree: true, characterData: true, childList: true });
    }
}
let pageTitleObserver;
//# sourceMappingURL=index.js.map