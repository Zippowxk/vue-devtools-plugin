"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendComponentUpdateTracking = exports.refreshComponentTreeSearch = exports.getComponentInstance = exports.getComponentId = exports.editComponentState = exports.sendEmptyComponentData = exports.markSelectedInstance = exports.sendSelectedComponentData = exports.sendComponentTreeData = void 0;
const shared_utils_1 = require("@vue-devtools/shared-utils");
const app_backend_api_1 = require("@vue-devtools/app-backend-api");
const app_1 = require("./app");
const MAX_$VM = 10;
const $vmQueue = [];
async function sendComponentTreeData(appRecord, instanceId, filter = '', maxDepth = null, recursively = false, ctx) {
    if (!instanceId || appRecord !== ctx.currentAppRecord)
        return;
    // Flush will send all components in the tree
    // So we skip individiual tree updates
    if (instanceId !== '_root' &&
        ctx.currentAppRecord.backend.options.features.includes(app_backend_api_1.BuiltinBackendFeature.FLUSH)) {
        return;
    }
    const instance = getComponentInstance(appRecord, instanceId, ctx);
    if (!instance) {
        ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_TREE, {
            instanceId,
            treeData: null,
            notFound: true,
        });
    }
    else {
        if (filter)
            filter = filter.toLowerCase();
        if (maxDepth == null) {
            maxDepth = instance === ctx.currentAppRecord.rootInstance ? 2 : 1;
        }
        const data = await appRecord.backend.api.walkComponentTree(instance, maxDepth, filter, recursively);
        const payload = {
            instanceId,
            treeData: (0, shared_utils_1.stringify)(data),
        };
        ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_TREE, payload);
    }
}
exports.sendComponentTreeData = sendComponentTreeData;
async function sendSelectedComponentData(appRecord, instanceId, ctx) {
    if (!instanceId || appRecord !== ctx.currentAppRecord)
        return;
    const instance = getComponentInstance(appRecord, instanceId, ctx);
    if (!instance) {
        sendEmptyComponentData(instanceId, ctx);
    }
    else {
        // Expose instance on window
        if (typeof window !== 'undefined') {
            const win = window;
            win.$vm = instance;
            // $vm0, $vm1, $vm2, ...
            if ($vmQueue[0] !== instance) {
                if ($vmQueue.length >= MAX_$VM) {
                    $vmQueue.pop();
                }
                for (let i = $vmQueue.length; i > 0; i--) {
                    win[`$vm${i}`] = $vmQueue[i] = $vmQueue[i - 1];
                }
                win.$vm0 = $vmQueue[0] = instance;
            }
        }
        if (shared_utils_1.SharedData.debugInfo) {
            // eslint-disable-next-line no-console
            console.log('[DEBUG] inspect', instance);
        }
        const parentInstances = await appRecord.backend.api.walkComponentParents(instance);
        const payload = {
            instanceId,
            data: (0, shared_utils_1.stringify)(await appRecord.backend.api.inspectComponent(instance, ctx.currentAppRecord.options.app)),
            parentIds: parentInstances.map(i => i.__VUE_DEVTOOLS_UID__),
        };
        ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_SELECTED_DATA, payload);
        markSelectedInstance(instanceId, ctx);
    }
}
exports.sendSelectedComponentData = sendSelectedComponentData;
function markSelectedInstance(instanceId, ctx) {
    ctx.currentInspectedComponentId = instanceId;
    ctx.currentAppRecord.lastInspectedComponentId = instanceId;
}
exports.markSelectedInstance = markSelectedInstance;
function sendEmptyComponentData(instanceId, ctx) {
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_SELECTED_DATA, {
        instanceId,
        data: null,
    });
}
exports.sendEmptyComponentData = sendEmptyComponentData;
async function editComponentState(instanceId, dotPath, type, state, ctx) {
    if (!instanceId)
        return;
    const instance = getComponentInstance(ctx.currentAppRecord, instanceId, ctx);
    if (instance) {
        if ('value' in state && state.value != null) {
            state.value = (0, shared_utils_1.parse)(state.value, true);
        }
        await ctx.currentAppRecord.backend.api.editComponentState(instance, dotPath, type, state, ctx.currentAppRecord.options.app);
        await sendSelectedComponentData(ctx.currentAppRecord, instanceId, ctx);
    }
}
exports.editComponentState = editComponentState;
async function getComponentId(app, uid, instance, ctx) {
    try {
        if (instance.__VUE_DEVTOOLS_UID__)
            return instance.__VUE_DEVTOOLS_UID__;
        const appRecord = await (0, app_1.getAppRecord)(app, ctx);
        if (!appRecord)
            return null;
        const isRoot = appRecord.rootInstance === instance;
        return `${appRecord.id}:${isRoot ? 'root' : uid}`;
    }
    catch (e) {
        if (shared_utils_1.SharedData.debugInfo) {
            console.error(e);
        }
        return null;
    }
}
exports.getComponentId = getComponentId;
function getComponentInstance(appRecord, instanceId, ctx) {
    if (instanceId === '_root') {
        instanceId = `${appRecord.id}:root`;
    }
    const instance = appRecord.instanceMap.get(instanceId);
    if (!instance && shared_utils_1.SharedData.debugInfo) {
        console.warn(`Instance uid=${instanceId} not found`);
    }
    return instance;
}
exports.getComponentInstance = getComponentInstance;
async function refreshComponentTreeSearch(ctx) {
    if (!ctx.currentAppRecord.componentFilter)
        return;
    await sendComponentTreeData(ctx.currentAppRecord, '_root', ctx.currentAppRecord.componentFilter, null, false, ctx);
}
exports.refreshComponentTreeSearch = refreshComponentTreeSearch;
async function sendComponentUpdateTracking(instanceId, ctx) {
    if (!instanceId)
        return;
    const payload = {
        instanceId,
        time: Date.now(), // Use normal date
    };
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_UPDATED, payload);
}
exports.sendComponentUpdateTracking = sendComponentUpdateTracking;
//# sourceMappingURL=component.js.map