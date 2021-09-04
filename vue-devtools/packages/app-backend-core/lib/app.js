"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._legacy_getAndRegisterApps = exports.removeApp = exports.sendApps = exports.waitForAppsRegistration = exports.getAppRecord = exports.getAppRecordId = exports.mapAppRecord = exports.selectApp = exports.registerApp = void 0;
const shared_utils_1 = require("@vue-devtools/shared-utils");
const queue_1 = require("./util/queue");
const scan_1 = require("./legacy/scan");
const app_backend_vue1_1 = require("@vue-devtools/app-backend-vue1");
const app_backend_vue2_1 = require("@vue-devtools/app-backend-vue2");
const app_backend_vue3_1 = require("@vue-devtools/app-backend-vue3");
const timeline_1 = require("./timeline");
const availableBackends = [
    app_backend_vue1_1.backend,
    app_backend_vue2_1.backend,
    app_backend_vue3_1.backend
];
const enabledBackends = new Set();
const jobs = new queue_1.JobQueue();
let recordId = 0;
const appRecordPromises = new Map();
async function registerApp(options, ctx) {
    return jobs.queue(() => registerAppJob(options, ctx));
}
exports.registerApp = registerApp;
async function registerAppJob(options, ctx) {
    var _a;
    // Dedupe
    if (ctx.appRecords.find(a => a.options === options)) {
        return;
    }
    let record;
    const baseFrameworkVersion = parseInt(options.version.substr(0, options.version.indexOf('.')));
    for (let i = 0; i < availableBackends.length; i++) {
        const backend = availableBackends[i];
        if (backend.frameworkVersion === baseFrameworkVersion) {
            // Enabled backend
            if (!enabledBackends.has(backend)) {
                backend.setup(ctx.api);
                enabledBackends.add(backend);
            }
            // Create app record
            const rootInstance = await ctx.api.getAppRootInstance(options.app);
            if (rootInstance) {
                const id = getAppRecordId(options.app);
                const name = await ctx.api.getAppRecordName(options.app, id);
                const [el] = await ctx.api.getComponentRootElements(rootInstance);
                record = {
                    id,
                    name,
                    options,
                    backend,
                    lastInspectedComponentId: null,
                    instanceMap: new Map(),
                    rootInstance,
                    perfGroupIds: new Map(),
                    iframe: document !== el.ownerDocument ? el.ownerDocument.location.pathname : null,
                    meta: (_a = options.meta) !== null && _a !== void 0 ? _a : {}
                };
                options.app.__VUE_DEVTOOLS_APP_RECORD__ = record;
                const rootId = `${record.id}:root`;
                record.instanceMap.set(rootId, record.rootInstance);
                record.rootInstance.__VUE_DEVTOOLS_UID__ = rootId;
                await ctx.api.registerApplication(record);
                ctx.appRecords.push(record);
                timeline_1.addBuiltinLayers(options.app, ctx);
                ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_APP_ADD, {
                    appRecord: mapAppRecord(record)
                });
                if (backend.setupApp) {
                    backend.setupApp(ctx.api, record);
                }
                if (appRecordPromises.has(options.app)) {
                    for (const r of appRecordPromises.get(options.app)) {
                        await r(record);
                    }
                }
                // Auto select first app
                if (ctx.currentAppRecord == null) {
                    await selectApp(record, ctx);
                }
            }
            else {
                console.warn('[Vue devtools] No root instance found for app, it might have been unmounted', options.app);
            }
            break;
        }
    }
}
async function selectApp(record, ctx) {
    ctx.currentAppRecord = record;
    ctx.currentInspectedComponentId = record.lastInspectedComponentId;
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_APP_SELECTED, {
        id: record.id,
        lastInspectedComponentId: record.lastInspectedComponentId
    });
}
exports.selectApp = selectApp;
function mapAppRecord(record) {
    return {
        id: record.id,
        name: record.name,
        version: record.options.version,
        iframe: record.iframe
    };
}
exports.mapAppRecord = mapAppRecord;
function getAppRecordId(app) {
    if (app.__VUE_DEVTOOLS_APP_RECORD_ID__ != null) {
        return app.__VUE_DEVTOOLS_APP_RECORD_ID__;
    }
    const id = recordId++;
    app.__VUE_DEVTOOLS_APP_RECORD_ID__ = id;
    return id;
}
exports.getAppRecordId = getAppRecordId;
async function getAppRecord(app, ctx) {
    const record = ctx.appRecords.find(ar => ar.options.app === app);
    if (record) {
        return record;
    }
    return new Promise((resolve, reject) => {
        let timedOut = false;
        const timer = setTimeout(() => {
            timedOut = true;
            reject(new Error(`Timed out getting app record for app ${app}`));
        }, 2000);
        let resolvers = appRecordPromises.get(app);
        if (!resolvers) {
            resolvers = [];
            appRecordPromises.set(app, resolvers);
        }
        resolvers.push((record) => {
            if (!timedOut) {
                clearTimeout(timer);
                resolve(record);
            }
        });
    });
}
exports.getAppRecord = getAppRecord;
function waitForAppsRegistration() {
    return jobs.queue(async () => { });
}
exports.waitForAppsRegistration = waitForAppsRegistration;
async function sendApps(ctx) {
    const appRecords = [];
    for (const appRecord of ctx.appRecords) {
        if (!(await ctx.api.getComponentDevtoolsOptions(appRecord.rootInstance)).hide) {
            appRecords.push(appRecord);
        }
    }
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_APP_LIST, {
        apps: appRecords.map(mapAppRecord)
    });
}
exports.sendApps = sendApps;
async function removeApp(app, ctx) {
    try {
        const appRecord = await getAppRecord(app, ctx);
        if (appRecord) {
            const index = ctx.appRecords.indexOf(appRecord);
            if (index !== -1)
                ctx.appRecords.splice(index, 1);
            timeline_1.removeLayersForApp(app, ctx);
            ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_APP_REMOVE, { id: appRecord.id });
        }
    }
    catch (e) {
        if (process.env.NODE_ENV !== 'production') {
            console.error(e);
        }
    }
}
exports.removeApp = removeApp;
// eslint-disable-next-line camelcase
async function _legacy_getAndRegisterApps(Vue, ctx) {
    const apps = scan_1.scan();
    apps.forEach(app => {
        registerApp({
            app,
            types: {},
            version: Vue.version,
            meta: {
                Vue
            }
        }, ctx);
    });
}
exports._legacy_getAndRegisterApps = _legacy_getAndRegisterApps;
//# sourceMappingURL=app.js.map