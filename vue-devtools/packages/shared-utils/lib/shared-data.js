"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedData = exports.watchSharedData = exports.destroySharedData = exports.onSharedDataInit = exports.initSharedData = void 0;
const storage_1 = require("./storage");
const env_1 = require("./env");
// Initial state
const internalSharedData = {
    openInEditorHost: '/',
    componentNameStyle: 'class',
    theme: 'auto',
    displayDensity: 'low',
    timeFormat: 'default',
    recordVuex: true,
    cacheVuexSnapshotsEvery: 50,
    cacheVuexSnapshotsLimit: 10,
    snapshotLoading: false,
    componentEventsEnabled: true,
    performanceMonitoringEnabled: true,
    editableProps: false,
    logDetected: true,
    vuexNewBackend: false,
    vuexAutoload: false,
    vuexGroupGettersByModule: true,
    showMenuScrollTip: true,
    timelineTimeGrid: true,
    timelineScreenshots: true,
    menuStepScrolling: env_1.isMac,
    pluginPermissions: {},
    pluginSettings: {},
    pageConfig: {},
    legacyApps: false,
    trackUpdates: true,
    flashUpdates: false,
    debugInfo: false,
    isBrowser: env_1.isBrowser,
};
const persisted = [
    'componentNameStyle',
    'theme',
    'displayDensity',
    'recordVuex',
    'editableProps',
    'logDetected',
    'vuexNewBackend',
    'vuexAutoload',
    'vuexGroupGettersByModule',
    'timeFormat',
    'showMenuScrollTip',
    'timelineTimeGrid',
    'timelineScreenshots',
    'menuStepScrolling',
    'pluginPermissions',
    'pluginSettings',
    'performanceMonitoringEnabled',
    'componentEventsEnabled',
    'trackUpdates',
    'flashUpdates',
    'debugInfo',
];
const storageVersion = '6.0.0-alpha.1';
// ---- INTERNALS ---- //
let bridge;
// List of fields to persist to storage (disabled if 'false')
// This should be unique to each shared data client to prevent conflicts
let persist = false;
let data;
let initRetryInterval;
let initRetryCount = 0;
const initCbs = [];
function initSharedData(params) {
    return new Promise((resolve) => {
        // Mandatory params
        bridge = params.bridge;
        persist = !!params.persist;
        if (persist) {
            if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.log('[shared data] Master init in progress...');
            }
            // Load persisted fields
            persisted.forEach(key => {
                const value = (0, storage_1.getStorage)(`vue-devtools-${storageVersion}:shared-data:${key}`);
                if (value !== null) {
                    internalSharedData[key] = value;
                }
            });
            bridge.on('shared-data:load', () => {
                // Send all fields
                Object.keys(internalSharedData).forEach(key => {
                    sendValue(key, internalSharedData[key]);
                });
                bridge.send('shared-data:load-complete');
            });
            bridge.on('shared-data:init-complete', () => {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.log('[shared data] Master init complete');
                }
                clearInterval(initRetryInterval);
                resolve();
            });
            bridge.send('shared-data:master-init-waiting');
            // In case backend init is executed after frontend
            bridge.on('shared-data:minion-init-waiting', () => {
                bridge.send('shared-data:master-init-waiting');
            });
            initRetryCount = 0;
            clearInterval(initRetryInterval);
            initRetryInterval = setInterval(() => {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.log('[shared data] Master init retrying...');
                }
                bridge.send('shared-data:master-init-waiting');
                initRetryCount++;
                if (initRetryCount > 1) {
                    clearInterval(initRetryInterval);
                    console.error('[shared data] Master init failed');
                }
            }, 2000);
        }
        else {
            if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.log('[shared data] Minion init in progress...');
            }
            bridge.on('shared-data:master-init-waiting', () => {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.log('[shared data] Minion loading data...');
                }
                // Load all persisted shared data
                bridge.send('shared-data:load');
                bridge.once('shared-data:load-complete', () => {
                    if (process.env.NODE_ENV !== 'production') {
                        // eslint-disable-next-line no-console
                        console.log('[shared data] Minion init complete');
                    }
                    bridge.send('shared-data:init-complete');
                    resolve();
                });
            });
            bridge.send('shared-data:minion-init-waiting');
        }
        data = {
            ...internalSharedData,
        };
        if (params.Vue) {
            data = params.Vue.observable(data);
        }
        // Update value from other shared data clients
        bridge.on('shared-data:set', ({ key, value }) => {
            setValue(key, value);
        });
        initCbs.forEach(cb => cb());
    });
}
exports.initSharedData = initSharedData;
function onSharedDataInit(cb) {
    initCbs.push(cb);
    return () => {
        const index = initCbs.indexOf(cb);
        if (index !== -1)
            initCbs.splice(index, 1);
    };
}
exports.onSharedDataInit = onSharedDataInit;
function destroySharedData() {
    bridge.removeAllListeners('shared-data:set');
    watchers = {};
}
exports.destroySharedData = destroySharedData;
let watchers = {};
function setValue(key, value) {
    // Storage
    if (persist && persisted.includes(key)) {
        (0, storage_1.setStorage)(`vue-devtools-${storageVersion}:shared-data:${key}`, value);
    }
    const oldValue = data[key];
    data[key] = value;
    const handlers = watchers[key];
    if (handlers) {
        handlers.forEach(h => h(value, oldValue));
    }
    // Validate Proxy set trap
    return true;
}
function sendValue(key, value) {
    bridge && bridge.send('shared-data:set', {
        key,
        value,
    });
}
function watchSharedData(prop, handler) {
    const list = watchers[prop] || (watchers[prop] = []);
    list.push(handler);
    return () => {
        const index = list.indexOf(handler);
        if (index !== -1)
            list.splice(index, 1);
    };
}
exports.watchSharedData = watchSharedData;
const proxy = {};
Object.keys(internalSharedData).forEach(key => {
    Object.defineProperty(proxy, key, {
        configurable: false,
        get: () => data[key],
        set: (value) => {
            sendValue(key, value);
            setValue(key, value);
        },
    });
});
exports.SharedData = proxy;
//# sourceMappingURL=shared-data.js.map