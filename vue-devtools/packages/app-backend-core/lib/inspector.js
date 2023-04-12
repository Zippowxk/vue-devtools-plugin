"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectInspectorNode = exports.sendCustomInspectors = exports.editInspectorState = exports.sendInspectorState = exports.sendInspectorTree = exports.getInspectorWithAppId = exports.getInspector = void 0;
const shared_utils_1 = require("@vue-devtools/shared-utils");
function getInspector(inspectorId, app, ctx) {
    return ctx.customInspectors.find(i => i.id === inspectorId && i.appRecord.options.app === app);
}
exports.getInspector = getInspector;
async function getInspectorWithAppId(inspectorId, appId, ctx) {
    for (const i of ctx.customInspectors) {
        if (i.id === inspectorId && i.appRecord.id === appId) {
            return i;
        }
    }
    return null;
}
exports.getInspectorWithAppId = getInspectorWithAppId;
async function sendInspectorTree(inspector, ctx) {
    const rootNodes = await inspector.appRecord.backend.api.getInspectorTree(inspector.id, inspector.appRecord.options.app, inspector.treeFilter);
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_TREE, {
        appId: inspector.appRecord.id,
        inspectorId: inspector.id,
        rootNodes,
    });
}
exports.sendInspectorTree = sendInspectorTree;
async function sendInspectorState(inspector, ctx) {
    const state = inspector.selectedNodeId ? await inspector.appRecord.backend.api.getInspectorState(inspector.id, inspector.appRecord.options.app, inspector.selectedNodeId) : null;
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_STATE, {
        appId: inspector.appRecord.id,
        inspectorId: inspector.id,
        state: (0, shared_utils_1.stringify)(state),
    });
}
exports.sendInspectorState = sendInspectorState;
async function editInspectorState(inspector, nodeId, dotPath, type, state, ctx) {
    await inspector.appRecord.backend.api.editInspectorState(inspector.id, inspector.appRecord.options.app, nodeId, dotPath, type, {
        ...state,
        value: state.value != null ? (0, shared_utils_1.parse)(state.value, true) : state.value,
    });
}
exports.editInspectorState = editInspectorState;
async function sendCustomInspectors(ctx) {
    var _a, _b;
    const inspectors = [];
    for (const i of ctx.customInspectors) {
        inspectors.push({
            id: i.id,
            appId: i.appRecord.id,
            pluginId: i.plugin.descriptor.id,
            label: i.label,
            icon: i.icon,
            treeFilterPlaceholder: i.treeFilterPlaceholder,
            stateFilterPlaceholder: i.stateFilterPlaceholder,
            noSelectionText: i.noSelectionText,
            actions: (_a = i.actions) === null || _a === void 0 ? void 0 : _a.map(a => ({
                icon: a.icon,
                tooltip: a.tooltip,
            })),
            nodeActions: (_b = i.nodeActions) === null || _b === void 0 ? void 0 : _b.map(a => ({
                icon: a.icon,
                tooltip: a.tooltip,
            })),
        });
    }
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_LIST, {
        inspectors,
    });
}
exports.sendCustomInspectors = sendCustomInspectors;
async function selectInspectorNode(inspector, nodeId, ctx) {
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_SELECT_NODE, {
        appId: inspector.appRecord.id,
        inspectorId: inspector.id,
        nodeId,
    });
}
exports.selectInspectorNode = selectInspectorNode;
//# sourceMappingURL=inspector.js.map