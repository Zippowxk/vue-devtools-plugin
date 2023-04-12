"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBackendContext = void 0;
function createBackendContext(options) {
    return {
        bridge: options.bridge,
        hook: options.hook,
        backends: [],
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
        customInspectors: [],
        timelineMarkers: [],
    };
}
exports.createBackendContext = createBackendContext;
//# sourceMappingURL=backend-context.js.map