"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTimelineMarkers = exports.addTimelineMarker = void 0;
const shared_utils_1 = require("@vue-devtools/shared-utils");
const devtools_api_1 = require("@vue/devtools-api");
const timeline_1 = require("./timeline");
async function addTimelineMarker(options, ctx) {
    var _a;
    if (!ctx.currentAppRecord) {
        options.all = true;
    }
    const marker = {
        ...options,
        appRecord: options.all ? null : ctx.currentAppRecord,
    };
    ctx.timelineMarkers.push(marker);
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_TIMELINE_MARKER, {
        marker: await serializeMarker(marker),
        appId: (_a = ctx.currentAppRecord) === null || _a === void 0 ? void 0 : _a.id,
    });
}
exports.addTimelineMarker = addTimelineMarker;
async function sendTimelineMarkers(ctx) {
    if (!ctx.currentAppRecord)
        return;
    const markers = ctx.timelineMarkers.filter(marker => marker.all || marker.appRecord === ctx.currentAppRecord);
    const result = [];
    for (const marker of markers) {
        result.push(await serializeMarker(marker));
    }
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_TIMELINE_LOAD_MARKERS, {
        markers: result,
        appId: ctx.currentAppRecord.id,
    });
}
exports.sendTimelineMarkers = sendTimelineMarkers;
async function serializeMarker(marker) {
    var _a;
    let time = marker.time;
    if ((0, devtools_api_1.isPerformanceSupported)() && time < timeline_1.dateThreshold) {
        time += timeline_1.perfTimeDiff;
    }
    return {
        id: marker.id,
        appId: (_a = marker.appRecord) === null || _a === void 0 ? void 0 : _a.id,
        all: marker.all,
        time: Math.round(time * 1000),
        label: marker.label,
        color: marker.color,
    };
}
//# sourceMappingURL=timeline-marker.js.map