"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAddPerformanceTag = exports.performanceMarkEnd = exports.performanceMarkStart = void 0;
const shared_data_1 = __importDefault(require("@vue-devtools/shared-utils/lib/shared-data"));
const shared_utils_1 = require("@vue-devtools/shared-utils");
const timeline_1 = require("./timeline");
const app_1 = require("./app");
const component_1 = require("./component");
const subscriptions_1 = require("./util/subscriptions");
async function performanceMarkStart(app, uid, instance, type, time, ctx) {
    try {
        if (!shared_data_1.default.performanceMonitoringEnabled)
            return;
        const appRecord = await app_1.getAppRecord(app, ctx);
        const componentName = await ctx.api.getComponentName(instance);
        const groupId = ctx.perfUniqueGroupId++;
        const groupKey = `${uid}-${type}`;
        appRecord.perfGroupIds.set(groupKey, { groupId, time });
        timeline_1.addTimelineEvent({
            layerId: 'performance',
            event: {
                time,
                data: {
                    component: componentName,
                    type,
                    measure: 'start'
                },
                title: componentName,
                subtitle: type,
                groupId
            }
        }, app, ctx);
    }
    catch (e) {
        if (process.env.NODE_ENV !== 'production') {
            console.error(e);
        }
    }
}
exports.performanceMarkStart = performanceMarkStart;
async function performanceMarkEnd(app, uid, instance, type, time, ctx) {
    try {
        if (!shared_data_1.default.performanceMonitoringEnabled)
            return;
        const appRecord = await app_1.getAppRecord(app, ctx);
        const componentName = await ctx.api.getComponentName(instance);
        const groupKey = `${uid}-${type}`;
        const { groupId, time: startTime } = appRecord.perfGroupIds.get(groupKey);
        const duration = time - startTime;
        timeline_1.addTimelineEvent({
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
                            display: `${duration} ms`
                        }
                    }
                },
                title: componentName,
                subtitle: type,
                groupId
            }
        }, app, ctx);
        // Mark on component
        const tooSlow = duration > 10;
        if (tooSlow || instance.__VUE_DEVTOOLS_SLOW__) {
            let change = false;
            if (tooSlow && !instance.__VUE_DEVTOOLS_SLOW__) {
                instance.__VUE_DEVTOOLS_SLOW__ = {
                    duration: null,
                    measures: {}
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
                const id = await component_1.getComponentId(app, uid, ctx);
                if (subscriptions_1.isSubscribed(shared_utils_1.BridgeSubscriptions.COMPONENT_TREE, sub => sub.payload.instanceId === id)) {
                    requestAnimationFrame(() => {
                        component_1.sendComponentTreeData(appRecord, id, ctx.currentAppRecord.componentFilter, null, ctx);
                    });
                }
            }
        }
    }
    catch (e) {
        if (process.env.NODE_ENV !== 'production') {
            console.error(e);
        }
    }
}
exports.performanceMarkEnd = performanceMarkEnd;
function handleAddPerformanceTag(ctx) {
    ctx.api.on.visitComponentTree(payload => {
        if (payload.componentInstance.__VUE_DEVTOOLS_SLOW__) {
            const { duration, measures } = payload.componentInstance.__VUE_DEVTOOLS_SLOW__;
            let tooltip = '<div class="grid grid-cols-2 gap-2 font-mono text-xs">';
            for (const type in measures) {
                const d = measures[type];
                tooltip += `<div>${type}</div><div class="text-right text-black rounded px-1 ${d > 30 ? 'bg-red-400' : d > 10 ? 'bg-yellow-400' : 'bg-green-400'}">${d} ms</div>`;
            }
            tooltip += '</div>';
            payload.treeNode.tags.push({
                backgroundColor: duration > 30 ? 0xF87171 : 0xFBBF24,
                textColor: 0x000000,
                label: `${duration} ms`,
                tooltip
            });
        }
    });
}
exports.handleAddPerformanceTag = handleAddPerformanceTag;
//# sourceMappingURL=perf.js.map