"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAddPerformanceTag = exports.performanceMarkEnd = exports.performanceMarkStart = void 0;
const shared_utils_1 = require("@vue-devtools/shared-utils");
const timeline_1 = require("./timeline");
const app_1 = require("./app");
const component_1 = require("./component");
const subscriptions_1 = require("./util/subscriptions");
async function performanceMarkStart(app, uid, instance, type, time, ctx) {
    try {
        if (!shared_utils_1.SharedData.performanceMonitoringEnabled)
            return;
        const appRecord = await (0, app_1.getAppRecord)(app, ctx);
        const componentName = await appRecord.backend.api.getComponentName(instance);
        const groupId = ctx.perfUniqueGroupId++;
        const groupKey = `${uid}-${type}`;
        appRecord.perfGroupIds.set(groupKey, { groupId, time });
        await (0, timeline_1.addTimelineEvent)({
            layerId: 'performance',
            event: {
                time,
                data: {
                    component: componentName,
                    type,
                    measure: 'start',
                },
                title: componentName,
                subtitle: type,
                groupId,
            },
        }, app, ctx);
        if (markEndQueue.has(groupKey)) {
            const { app, uid, instance, type, time, } = markEndQueue.get(groupKey);
            markEndQueue.delete(groupKey);
            await performanceMarkEnd(app, uid, instance, type, time, ctx);
        }
    }
    catch (e) {
        if (shared_utils_1.SharedData.debugInfo) {
            console.error(e);
        }
    }
}
exports.performanceMarkStart = performanceMarkStart;
const markEndQueue = new Map();
async function performanceMarkEnd(app, uid, instance, type, time, ctx) {
    try {
        if (!shared_utils_1.SharedData.performanceMonitoringEnabled)
            return;
        const appRecord = await (0, app_1.getAppRecord)(app, ctx);
        const componentName = await appRecord.backend.api.getComponentName(instance);
        const groupKey = `${uid}-${type}`;
        const groupInfo = appRecord.perfGroupIds.get(groupKey);
        if (!groupInfo) {
            markEndQueue.set(groupKey, {
                app,
                uid,
                instance,
                type,
                time,
            });
            return;
        }
        const { groupId, time: startTime } = groupInfo;
        const duration = time - startTime;
        await (0, timeline_1.addTimelineEvent)({
            layerId: 'performance',
            event: {
                time,
                data: {
                    component: componentName,
                    type,
                    measure: 'end',
                    duration: {
                        _custom: {
                            type: 'Duration',
                            value: duration,
                            display: `${duration} ms`,
                        },
                    },
                },
                title: componentName,
                subtitle: type,
                groupId,
            },
        }, app, ctx);
        // Mark on component
        const tooSlow = duration > 10;
        if (tooSlow || instance.__VUE_DEVTOOLS_SLOW__) {
            let change = false;
            if (tooSlow && !instance.__VUE_DEVTOOLS_SLOW__) {
                instance.__VUE_DEVTOOLS_SLOW__ = {
                    duration: null,
                    measures: {},
                };
            }
            const data = instance.__VUE_DEVTOOLS_SLOW__;
            if (tooSlow && (data.duration == null || data.duration < duration)) {
                data.duration = duration;
                change = true;
            }
            if (data.measures[type] == null || data.measures[type] < duration) {
                data.measures[type] = duration;
                change = true;
            }
            if (change) {
                // Update component tree
                const id = await (0, component_1.getComponentId)(app, uid, instance, ctx);
                if ((0, subscriptions_1.isSubscribed)(shared_utils_1.BridgeSubscriptions.COMPONENT_TREE, sub => sub.payload.instanceId === id)) {
                    (0, shared_utils_1.raf)(() => {
                        (0, component_1.sendComponentTreeData)(appRecord, id, ctx.currentAppRecord.componentFilter, null, false, ctx);
                    });
                }
            }
        }
    }
    catch (e) {
        if (shared_utils_1.SharedData.debugInfo) {
            console.error(e);
        }
    }
}
exports.performanceMarkEnd = performanceMarkEnd;
function handleAddPerformanceTag(backend, ctx) {
    backend.api.on.visitComponentTree(payload => {
        if (payload.componentInstance.__VUE_DEVTOOLS_SLOW__) {
            const { duration, measures } = payload.componentInstance.__VUE_DEVTOOLS_SLOW__;
            let tooltip = '<div class="grid grid-cols-2 gap-2 font-mono text-xs">';
            for (const type in measures) {
                const d = measures[type];
                tooltip += `<div>${type}</div><div class="text-right text-black rounded px-1 ${d > 30 ? 'bg-red-400' : d > 10 ? 'bg-yellow-400' : 'bg-green-400'}">${Math.round(d * 1000) / 1000} ms</div>`;
            }
            tooltip += '</div>';
            payload.treeNode.tags.push({
                backgroundColor: duration > 30 ? 0xF87171 : 0xFBBF24,
                textColor: 0x000000,
                label: `${Math.round(duration * 1000) / 1000} ms`,
                tooltip,
            });
        }
    });
}
exports.handleAddPerformanceTag = handleAddPerformanceTag;
//# sourceMappingURL=perf.js.map