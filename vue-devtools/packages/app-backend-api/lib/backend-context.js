"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBackendContext = void 0;
const api_1 = require("./api");
function createBackendContext(options) {
    const ctx = {
        bridge: options.bridge,
        hook: options.hook,
        api: null,
        appRecords: [],
        currentTab: null,
        currentAppRecord: null,
        currentInspectedComponentId: null,
        plugins: [],
        currentPlugin: null,
        timelineLayers: [],
        nextTimelineEventId: 0,
        timelineEventMap: new Map(),
        perfUniqueGroupId: 0,
        customInspectors: []
    };
    ctx.api = new api_1.DevtoolsApi(options.bridge, ctx);
    return ctx;
}
exports.createBackendContext = createBackendContext;
//# sourceMappingURL=backend-context.js.map