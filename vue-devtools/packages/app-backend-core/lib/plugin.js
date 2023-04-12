"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializePlugin = exports.sendPluginList = exports.addPreviouslyRegisteredPlugins = exports.addQueuedPlugins = exports.addPlugin = void 0;
const app_backend_api_1 = require("@vue-devtools/app-backend-api");
const shared_utils_1 = require("@vue-devtools/shared-utils");
const app_1 = require("./app");
async function addPlugin(pluginQueueItem, ctx) {
    const { pluginDescriptor, setupFn } = pluginQueueItem;
    const plugin = {
        descriptor: pluginDescriptor,
        setupFn,
        error: null,
    };
    ctx.currentPlugin = plugin;
    try {
        const appRecord = await (0, app_1.getAppRecord)(plugin.descriptor.app, ctx);
        const api = new app_backend_api_1.DevtoolsPluginApiInstance(plugin, appRecord, ctx);
        if (pluginQueueItem.proxy) {
            await pluginQueueItem.proxy.setRealTarget(api);
        }
        else {
            setupFn(api);
        }
    }
    catch (e) {
        plugin.error = e;
        if (shared_utils_1.SharedData.debugInfo) {
            console.error(e);
        }
    }
    ctx.currentPlugin = null;
    ctx.plugins.push(plugin);
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_DEVTOOLS_PLUGIN_ADD, {
        plugin: await serializePlugin(plugin),
    });
    const targetList = shared_utils_1.target.__VUE_DEVTOOLS_REGISTERED_PLUGINS__ = shared_utils_1.target.__VUE_DEVTOOLS_REGISTERED_PLUGINS__ || [];
    targetList.push({
        pluginDescriptor,
        setupFn,
    });
}
exports.addPlugin = addPlugin;
async function addQueuedPlugins(ctx) {
    if (shared_utils_1.target.__VUE_DEVTOOLS_PLUGINS__ && Array.isArray(shared_utils_1.target.__VUE_DEVTOOLS_PLUGINS__)) {
        for (const queueItem of shared_utils_1.target.__VUE_DEVTOOLS_PLUGINS__) {
            await addPlugin(queueItem, ctx);
        }
        shared_utils_1.target.__VUE_DEVTOOLS_PLUGINS__ = null;
    }
}
exports.addQueuedPlugins = addQueuedPlugins;
async function addPreviouslyRegisteredPlugins(ctx) {
    if (shared_utils_1.target.__VUE_DEVTOOLS_REGISTERED_PLUGINS__ && Array.isArray(shared_utils_1.target.__VUE_DEVTOOLS_REGISTERED_PLUGINS__)) {
        for (const queueItem of shared_utils_1.target.__VUE_DEVTOOLS_REGISTERED_PLUGINS__) {
            await addPlugin(queueItem, ctx);
        }
    }
}
exports.addPreviouslyRegisteredPlugins = addPreviouslyRegisteredPlugins;
async function sendPluginList(ctx) {
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_DEVTOOLS_PLUGIN_LIST, {
        plugins: await Promise.all(ctx.plugins.map(p => serializePlugin(p))),
    });
}
exports.sendPluginList = sendPluginList;
async function serializePlugin(plugin) {
    return {
        id: plugin.descriptor.id,
        label: plugin.descriptor.label,
        appId: (0, app_1.getAppRecordId)(plugin.descriptor.app),
        packageName: plugin.descriptor.packageName,
        homepage: plugin.descriptor.homepage,
        logo: plugin.descriptor.logo,
        componentStateTypes: plugin.descriptor.componentStateTypes,
        settingsSchema: plugin.descriptor.settings,
    };
}
exports.serializePlugin = serializePlugin;
//# sourceMappingURL=plugin.js.map