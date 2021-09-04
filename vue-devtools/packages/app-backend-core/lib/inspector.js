"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectInspectorNode = exports.sendCustomInspectors = exports.editInspectorState = exports.sendInspectorState = exports.sendInspectorTree = exports.getInspectorWithAppId = exports.getInspector = void 0;
const shared_utils_1 = require("@vue-devtools/shared-utils");
const app_1 = require("./app");
function getInspector(inspectorId, app, ctx) {
    return ctx.customInspectors.find(i => i.id === inspectorId && i.app === app);
}
exports.getInspector = getInspector;
function getInspectorWithAppId(inspectorId, appId, ctx) {
    return ctx.customInspectors.find(i => i.id === inspectorId && app_1.getAppRecordId(i.app) === appId);
}
exports.getInspectorWithAppId = getInspectorWithAppId;
async function sendInspectorTree(inspector, ctx) {
    const rootNodes = await ctx.api.getInspectorTree(inspector.id, inspector.app, inspector.treeFilter);
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_TREE, {
        appId: app_1.getAppRecordId(inspector.app),
        inspectorId: inspector.id,
        rootNodes
    });
}
exports.sendInspectorTree = sendInspectorTree;
async function sendInspectorState(inspector, ctx) {
    const state = inspector.selectedNodeId ? await ctx.api.getInspectorState(inspector.id, inspector.app, inspector.selectedNodeId) : null;
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_STATE, {
        appId: app_1.getAppRecordId(inspector.app),
        inspectorId: inspector.id,
        state: shared_utils_1.stringify(state)
    });
}
exports.sendInspectorState = sendInspectorState;
async function editInspectorState(inspector, nodeId, dotPath, type, state, ctx) {
    await ctx.api.editInspectorState(inspector.id, inspector.app, nodeId, dotPath, type, {
        ...state,
        value: state.value != null ? shared_utils_1.parse(state.value, true) : state.value
    });
}
exports.editInspectorState = editInspectorState;
async function sendCustomInspectors(ctx) {
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_LIST, {
        inspectors: ctx.customInspectors.map(i => {
            var _a;
            return ({
                id: i.id,
                appId: app_1.getAppRecordId(i.app),
                pluginId: i.plugin.descriptor.id,
                label: i.label,
                icon: i.icon,
                treeFilterPlaceholder: i.treeFilterPlaceholder,
                stateFilterPlaceholder: i.stateFilterPlaceholder,
                noSelectionText: i.noSelectionText,
                actions: (_a = i.actions) === null || _a === void 0 ? void 0 : _a.map(a => ({
                    icon: a.icon,
                    tooltip: a.tooltip
                }))
            });
        })
    });
}
exports.sendCustomInspectors = sendCustomInspectors;
async function selectInspectorNode(inspector, nodeId, ctx) {
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_SELECT_NODE, {
        appId: app_1.getAppRecordId(inspector.app),
        inspectorId: inspector.id,
        nodeId
    });
}
exports.selectInspectorNode = selectInspectorNode;
//# sourceMappingURL=inspector.js.map