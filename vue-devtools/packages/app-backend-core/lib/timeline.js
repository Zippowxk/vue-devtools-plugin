"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTimelineLayerEvents = exports.removeLayersForApp = exports.sendTimelineEventData = exports.clearTimeline = exports.perfTimeDiff = exports.dateThreshold = exports.addTimelineEvent = exports.sendTimelineLayers = exports.addBuiltinLayers = exports.setupTimeline = void 0;
const shared_utils_1 = require("@vue-devtools/shared-utils");
const devtools_api_1 = require("@vue/devtools-api");
const global_hook_1 = require("./global-hook");
const app_1 = require("./app");
const timeline_builtins_1 = require("./timeline-builtins");
function setupTimeline(ctx) {
    setupBuiltinLayers(ctx);
}
exports.setupTimeline = setupTimeline;
function addBuiltinLayers(appRecord, ctx) {
    for (const layerDef of timeline_builtins_1.builtinLayers) {
        ctx.timelineLayers.push({
            ...layerDef,
            appRecord,
            plugin: null,
            events: [],
        });
    }
}
exports.addBuiltinLayers = addBuiltinLayers;
function setupBuiltinLayers(ctx) {
    if (shared_utils_1.isBrowser) {
        ['mousedown', 'mouseup', 'click', 'dblclick'].forEach(eventType => {
            // @ts-ignore
            window.addEventListener(eventType, async (event) => {
                await addTimelineEvent({
                    layerId: 'mouse',
                    event: {
                        time: (0, devtools_api_1.now)(),
                        data: {
                            type: eventType,
                            x: event.clientX,
                            y: event.clientY,
                        },
                        title: eventType,
                    },
                }, null, ctx);
            }, {
                capture: true,
                passive: true,
            });
        });
        ['keyup', 'keydown', 'keypress'].forEach(eventType => {
            // @ts-ignore
            window.addEventListener(eventType, async (event) => {
                await addTimelineEvent({
                    layerId: 'keyboard',
                    event: {
                        time: (0, devtools_api_1.now)(),
                        data: {
                            type: eventType,
                            key: event.key,
                            ctrlKey: event.ctrlKey,
                            shiftKey: event.shiftKey,
                            altKey: event.altKey,
                            metaKey: event.metaKey,
                        },
                        title: event.key,
                    },
                }, null, ctx);
            }, {
                capture: true,
                passive: true,
            });
        });
    }
    global_hook_1.hook.on(shared_utils_1.HookEvents.COMPONENT_EMIT, async (app, instance, event, params) => {
        try {
            if (!shared_utils_1.SharedData.componentEventsEnabled)
                return;
            const appRecord = await (0, app_1.getAppRecord)(app, ctx);
            const componentId = `${appRecord.id}:${instance.uid}`;
            const componentDisplay = (await appRecord.backend.api.getComponentName(instance)) || '<i>Unknown Component</i>';
            await addTimelineEvent({
                layerId: 'component-event',
                event: {
                    time: (0, devtools_api_1.now)(),
                    data: {
                        component: {
                            _custom: {
                                type: 'component-definition',
                                display: componentDisplay,
                            },
                        },
                        event,
                        params,
                    },
                    title: event,
                    subtitle: `by ${componentDisplay}`,
                    meta: {
                        componentId,
                        bounds: await appRecord.backend.api.getComponentBounds(instance),
                    },
                },
            }, app, ctx);
        }
        catch (e) {
            if (shared_utils_1.SharedData.debugInfo) {
                console.error(e);
            }
        }
    });
}
async function sendTimelineLayers(ctx) {
    var _a, _b;
    const layers = [];
    for (const layer of ctx.timelineLayers) {
        try {
            layers.push({
                id: layer.id,
                label: layer.label,
                color: layer.color,
                appId: (_a = layer.appRecord) === null || _a === void 0 ? void 0 : _a.id,
                pluginId: (_b = layer.plugin) === null || _b === void 0 ? void 0 : _b.descriptor.id,
                groupsOnly: layer.groupsOnly,
                skipScreenshots: layer.skipScreenshots,
                ignoreNoDurationGroups: layer.ignoreNoDurationGroups,
            });
        }
        catch (e) {
            if (shared_utils_1.SharedData.debugInfo) {
                console.error(e);
            }
        }
    }
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_TIMELINE_LAYER_LIST, {
        layers,
    });
}
exports.sendTimelineLayers = sendTimelineLayers;
async function addTimelineEvent(options, app, ctx) {
    const appId = app ? (0, app_1.getAppRecordId)(app) : null;
    const isAllApps = options.all || !app || appId == null;
    const id = ctx.nextTimelineEventId++;
    const eventData = {
        id,
        ...options,
        all: isAllApps,
    };
    ctx.timelineEventMap.set(eventData.id, eventData);
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_TIMELINE_EVENT, {
        appId: eventData.all ? 'all' : appId,
        layerId: eventData.layerId,
        event: mapTimelineEvent(eventData),
    });
    const layer = ctx.timelineLayers.find(l => { var _a; return (isAllApps || ((_a = l.appRecord) === null || _a === void 0 ? void 0 : _a.options.app) === app) && l.id === options.layerId; });
    if (layer) {
        layer.events.push(eventData);
    }
    else if (shared_utils_1.SharedData.debugInfo) {
        console.warn(`Timeline layer ${options.layerId} not found`);
    }
}
exports.addTimelineEvent = addTimelineEvent;
const initialTime = Date.now();
exports.dateThreshold = initialTime - 1000000;
exports.perfTimeDiff = initialTime - (0, devtools_api_1.now)();
function mapTimelineEvent(eventData) {
    let time = eventData.event.time;
    if ((0, devtools_api_1.isPerformanceSupported)() && time < exports.dateThreshold) {
        time += exports.perfTimeDiff;
    }
    return {
        id: eventData.id,
        time: Math.round(time * 1000),
        logType: eventData.event.logType,
        groupId: eventData.event.groupId,
        title: eventData.event.title,
        subtitle: eventData.event.subtitle,
    };
}
async function clearTimeline(ctx) {
    ctx.timelineEventMap.clear();
    for (const layer of ctx.timelineLayers) {
        layer.events = [];
    }
    for (const backend of ctx.backends) {
        await backend.api.clearTimeline();
    }
}
exports.clearTimeline = clearTimeline;
async function sendTimelineEventData(id, ctx) {
    let data = null;
    const eventData = ctx.timelineEventMap.get(id);
    if (eventData) {
        data = await ctx.currentAppRecord.backend.api.inspectTimelineEvent(eventData, ctx.currentAppRecord.options.app);
        data = (0, shared_utils_1.stringify)(data);
    }
    else if (shared_utils_1.SharedData.debugInfo) {
        console.warn(`Event ${id} not found`, ctx.timelineEventMap.keys());
    }
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_TIMELINE_EVENT_DATA, {
        eventId: id,
        data,
    });
}
exports.sendTimelineEventData = sendTimelineEventData;
function removeLayersForApp(app, ctx) {
    const layers = ctx.timelineLayers.filter(l => { var _a; return ((_a = l.appRecord) === null || _a === void 0 ? void 0 : _a.options.app) === app; });
    for (const layer of layers) {
        const index = ctx.timelineLayers.indexOf(layer);
        if (index !== -1)
            ctx.timelineLayers.splice(index, 1);
        for (const e of layer.events) {
            ctx.timelineEventMap.delete(e.id);
        }
    }
}
exports.removeLayersForApp = removeLayersForApp;
function sendTimelineLayerEvents(appId, layerId, ctx) {
    var _a;
    const app = (_a = ctx.appRecords.find(ar => ar.id === appId)) === null || _a === void 0 ? void 0 : _a.options.app;
    if (!app)
        return;
    const layer = ctx.timelineLayers.find(l => { var _a; return ((_a = l.appRecord) === null || _a === void 0 ? void 0 : _a.options.app) === app && l.id === layerId; });
    if (!layer)
        return;
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_TIMELINE_LAYER_LOAD_EVENTS, {
        appId,
        layerId,
        events: layer.events.map(e => mapTimelineEvent(e)),
    });
}
exports.sendTimelineLayerEvents = sendTimelineLayerEvents;
//# sourceMappingURL=timeline.js.map