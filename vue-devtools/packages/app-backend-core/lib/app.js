"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._legacy_getAndRegisterApps = exports.removeApp = exports.sendApps = exports.waitForAppsRegistration = exports.getAppRecord = exports.getAppRecordId = exports.mapAppRecord = exports.selectApp = exports.registerApp = void 0;
const shared_utils_1 = require("@vue-devtools/shared-utils");
const speakingurl_1 = __importDefault(require("speakingurl"));
const queue_1 = require("./util/queue");
const scan_1 = require("./legacy/scan");
const timeline_1 = require("./timeline");
const backend_1 = require("./backend");
const global_hook_js_1 = require("./global-hook.js");
const jobs = new queue_1.JobQueue();
let recordId = 0;
const appRecordPromises = new Map();
async function registerApp(options, ctx) {
    return jobs.queue('regiserApp', () => registerAppJob(options, ctx));
}
exports.registerApp = registerApp;
async function registerAppJob(options, ctx) {
    // Dedupe
    if (ctx.appRecords.find(a => a.options.app === options.app)) {
        return;
    }
    if (!options.version) {
        throw new Error('[Vue Devtools] Vue version not found');
    }
    // Find correct backend
    const baseFrameworkVersion = parseInt(options.version.substring(0, options.version.indexOf('.')));
    for (let i = 0; i < backend_1.availableBackends.length; i++) {
        const backendOptions = backend_1.availableBackends[i];
        if (backendOptions.frameworkVersion === baseFrameworkVersion) {
            // Enable backend if it's not enabled
            const backend = (0, backend_1.getBackend)(backendOptions, ctx);
            await createAppRecord(options, backend, ctx);
            break;
        }
    }
}
async function createAppRecord(options, backend, ctx) {
    var _a, _b, _c;
    const rootInstance = await backend.api.getAppRootInstance(options.app);
    if (rootInstance) {
        if ((await backend.api.getComponentDevtoolsOptions(rootInstance)).hide) {
            options.app._vueDevtools_hidden_ = true;
            return;
        }
        recordId++;
        const name = await backend.api.getAppRecordName(options.app, recordId.toString());
        const id = getAppRecordId(options.app, (0, speakingurl_1.default)(name));
        const [el] = await backend.api.getComponentRootElements(rootInstance);
        const record = {
            id,
            name,
            options,
            backend,
            lastInspectedComponentId: null,
            instanceMap: new Map(),
            rootInstance,
            perfGroupIds: new Map(),
            iframe: shared_utils_1.isBrowser && document !== el.ownerDocument ? (_b = (_a = el.ownerDocument) === null || _a === void 0 ? void 0 : _a.location) === null || _b === void 0 ? void 0 : _b.pathname : null,
            meta: (_c = options.meta) !== null && _c !== void 0 ? _c : {},
        };
        options.app.__VUE_DEVTOOLS_APP_RECORD__ = record;
        const rootId = `${record.id}:root`;
        record.instanceMap.set(rootId, record.rootInstance);
        record.rootInstance.__VUE_DEVTOOLS_UID__ = rootId;
        // Timeline
        (0, timeline_1.addBuiltinLayers)(record, ctx);
        ctx.appRecords.push(record);
        if (backend.options.setupApp) {
            backend.options.setupApp(backend.api, record);
        }
        await backend.api.registerApplication(options.app);
        ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_APP_ADD, {
            appRecord: mapAppRecord(record),
        });
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
    else if (shared_utils_1.SharedData.debugInfo) {
        console.warn('[Vue devtools] No root instance found for app, it might have been unmounted', options.app);
    }
}
async function selectApp(record, ctx) {
    ctx.currentAppRecord = record;
    ctx.currentInspectedComponentId = record.lastInspectedComponentId;
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_APP_SELECTED, {
        id: record.id,
        lastInspectedComponentId: record.lastInspectedComponentId,
    });
}
exports.selectApp = selectApp;
function mapAppRecord(record) {
    return {
        id: record.id,
        name: record.name,
        version: record.options.version,
        iframe: record.iframe,
    };
}
exports.mapAppRecord = mapAppRecord;
const appIds = new Set();
function getAppRecordId(app, defaultId) {
    if (app.__VUE_DEVTOOLS_APP_RECORD_ID__ != null) {
        return app.__VUE_DEVTOOLS_APP_RECORD_ID__;
    }
    let id = defaultId !== null && defaultId !== void 0 ? defaultId : (recordId++).toString();
    if (defaultId && appIds.has(id)) {
        let count = 1;
        while (appIds.has(`${defaultId}_${count}`)) {
            count++;
        }
        id = `${defaultId}_${count}`;
    }
    appIds.add(id);
    app.__VUE_DEVTOOLS_APP_RECORD_ID__ = id;
    return id;
}
exports.getAppRecordId = getAppRecordId;
async function getAppRecord(app, ctx) {
    var _a;
    const record = (_a = app.__VUE_DEVTOOLS_APP_RECORD__) !== null && _a !== void 0 ? _a : ctx.appRecords.find(ar => ar.options.app === app);
    if (record) {
        return record;
    }
    if (app._vueDevtools_hidden_)
        return null;
    return new Promise((resolve, reject) => {
        let resolvers = appRecordPromises.get(app);
        let timedOut = false;
        if (!resolvers) {
            resolvers = [];
            appRecordPromises.set(app, resolvers);
        }
        const fn = (record) => {
            if (!timedOut) {
                clearTimeout(timer);
                resolve(record);
            }
        };
        resolvers.push(fn);
        const timer = setTimeout(() => {
            timedOut = true;
            const index = resolvers.indexOf(fn);
            if (index !== -1)
                resolvers.splice(index, 1);
            if (shared_utils_1.SharedData.debugInfo) {
                // eslint-disable-next-line no-console
                console.log('Timed out waiting for app record', app);
            }
            reject(new Error(`Timed out getting app record for app`));
        }, 60000);
    });
}
exports.getAppRecord = getAppRecord;
function waitForAppsRegistration() {
    return jobs.queue('waitForAppsRegistrationNoop', async () => { });
}
exports.waitForAppsRegistration = waitForAppsRegistration;
async function sendApps(ctx) {
    const appRecords = [];
    for (const appRecord of ctx.appRecords) {
        appRecords.push(appRecord);
    }
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_APP_LIST, {
        apps: appRecords.map(mapAppRecord),
    });
}
exports.sendApps = sendApps;
function removeAppRecord(appRecord, ctx) {
    try {
        appIds.delete(appRecord.id);
        const index = ctx.appRecords.indexOf(appRecord);
        if (index !== -1)
            ctx.appRecords.splice(index, 1);
        (0, timeline_1.removeLayersForApp)(appRecord.options.app, ctx);
        ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_APP_REMOVE, { id: appRecord.id });
    }
    catch (e) {
        if (shared_utils_1.SharedData.debugInfo) {
            console.error(e);
        }
    }
}
async function removeApp(app, ctx) {
    try {
        const appRecord = await getAppRecord(app, ctx);
        if (appRecord) {
            removeAppRecord(appRecord, ctx);
        }
    }
    catch (e) {
        if (shared_utils_1.SharedData.debugInfo) {
            console.error(e);
        }
    }
}
exports.removeApp = removeApp;
let scanTimeout;
// eslint-disable-next-line camelcase
function _legacy_getAndRegisterApps(ctx, clear = false) {
    setTimeout(() => {
        try {
            if (clear) {
                // Remove apps that are legacy
                ctx.appRecords.forEach(appRecord => {
                    if (appRecord.meta.Vue) {
                        removeAppRecord(appRecord, ctx);
                    }
                });
            }
            const apps = (0, scan_1.scan)();
            clearTimeout(scanTimeout);
            if (!apps.length) {
                scanTimeout = setTimeout(() => _legacy_getAndRegisterApps(ctx), 1000);
            }
            apps.forEach(app => {
                const Vue = global_hook_js_1.hook.Vue;
                registerApp({
                    app,
                    types: {},
                    version: Vue === null || Vue === void 0 ? void 0 : Vue.version,
                    meta: {
                        Vue,
                    },
                }, ctx);
            });
        }
        catch (e) {
            console.error(`Error scanning for legacy apps:`);
            console.error(e);
        }
    }, 0);
}
exports._legacy_getAndRegisterApps = _legacy_getAndRegisterApps;
//# sourceMappingURL=app.js.map