"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComponentInstance = exports.getComponentId = exports.editComponentState = exports.sendEmptyComponentData = exports.markSelectedInstance = exports.sendSelectedComponentData = exports.sendComponentTreeData = void 0;
const shared_utils_1 = require("@vue-devtools/shared-utils");
const app_1 = require("./app");
const MAX_$VM = 10;
const $vmQueue = [];
async function sendComponentTreeData(appRecord, instanceId, filter = '', maxDepth = null, ctx) {
    if (!instanceId || appRecord !== ctx.currentAppRecord)
        return;
    const instance = getComponentInstance(appRecord, instanceId, ctx);
    if (!instance) {
        ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_TREE, {
            instanceId,
            treeData: null,
            notFound: true
        });
    }
    else {
        if (filter)
            filter = filter.toLowerCase();
        if (maxDepth == null) {
            maxDepth = instance === ctx.currentAppRecord.rootInstance ? 2 : 1;
        }
        const payload = {
            instanceId,
            treeData: shared_utils_1.stringify(await ctx.api.walkComponentTree(instance, maxDepth, filter))
        };
        ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_TREE, payload);
    }
}
exports.sendComponentTreeData = sendComponentTreeData;
async function sendSelectedComponentData(appRecord, instanceId, ctx) {
    if (!instanceId || appRecord !== ctx.currentAppRecord)
        return;
    markSelectedInstance(instanceId, ctx);
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
        if (process.env.NODE_ENV !== 'production') {
            console.log('inspect', instance);
        }
        const parentInstances = await ctx.api.walkComponentParents(instance);
        const payload = {
            instanceId,
            data: shared_utils_1.stringify(await ctx.api.inspectComponent(instance, ctx.currentAppRecord.options.app)),
            parentIds: parentInstances.map(i => i.__VUE_DEVTOOLS_UID__)
        };
        ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_SELECTED_DATA, payload);
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
        data: null
    });
}
exports.sendEmptyComponentData = sendEmptyComponentData;
async function editComponentState(instanceId, dotPath, type, state, ctx) {
    if (!instanceId)
        return;
    const instance = getComponentInstance(ctx.currentAppRecord, instanceId, ctx);
    if (instance) {
        if ('value' in state && state.value != null) {
            state.value = shared_utils_1.parse(state.value, true);
        }
        await ctx.api.editComponentState(instance, dotPath, type, state, ctx.currentAppRecord.options.app);
        await sendSelectedComponentData(ctx.currentAppRecord, instanceId, ctx);
    }
}
exports.editComponentState = editComponentState;
async function getComponentId(app, uid, ctx) {
    try {
        const appRecord = await app_1.getAppRecord(app, ctx);
        if (!appRecord)
            return null;
        return `${appRecord.id}:${uid === 0 ? 'root' : uid}`;
    }
    catch (e) {
        if (process.env.NODE_ENV !== 'production') {
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
    if (!instance && process.env.NODE_ENV !== 'production') {
        console.warn(`Instance uid=${instanceId} not found`);
    }
    return instance;
}
exports.getComponentInstance = getComponentInstance;
//# sourceMappingURL=component.js.map