"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializePlugin = exports.sendPluginList = exports.addPreviouslyRegisteredPlugins = exports.addQueuedPlugins = exports.addPlugin = void 0;
const app_backend_api_1 = require("@vue-devtools/app-backend-api");
const shared_utils_1 = require("@vue-devtools/shared-utils");
const app_1 = require("./app");
function addPlugin(pluginDescriptor, setupFn, ctx) {
    const plugin = {
        descriptor: pluginDescriptor,
        setupFn,
        error: null
    };
    ctx.currentPlugin = plugin;
    try {
        const api = new app_backend_api_1.DevtoolsPluginApiInstance(plugin, ctx);
        setupFn(api);
    }
    catch (e) {
        plugin.error = e;
        console.error(e);
    }
    ctx.currentPlugin = null;
    ctx.plugins.push(plugin);
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_DEVTOOLS_PLUGIN_ADD, {
        plugin: serializePlugin(plugin)
    });
    const targetList = shared_utils_1.target.__VUE_DEVTOOLS_REGISTERED_PLUGINS__ = shared_utils_1.target.__VUE_DEVTOOLS_REGISTERED_PLUGINS__ || [];
    targetList.push({
        pluginDescriptor,
        setupFn
    });
}
exports.addPlugin = addPlugin;
async function addQueuedPlugins(ctx) {
    if (shared_utils_1.target.__VUE_DEVTOOLS_PLUGINS__ && Array.isArray(shared_utils_1.target.__VUE_DEVTOOLS_PLUGINS__)) {
        for (const plugin of shared_utils_1.target.__VUE_DEVTOOLS_PLUGINS__) {
            addPlugin(plugin.pluginDescriptor, plugin.setupFn, ctx);
        }
        shared_utils_1.target.__VUE_DEVTOOLS_PLUGINS__ = null;
    }
}
exports.addQueuedPlugins = addQueuedPlugins;
async function addPreviouslyRegisteredPlugins(ctx) {
    if (shared_utils_1.target.__VUE_DEVTOOLS_REGISTERED_PLUGINS__ && Array.isArray(shared_utils_1.target.__VUE_DEVTOOLS_REGISTERED_PLUGINS__)) {
        for (const plugin of shared_utils_1.target.__VUE_DEVTOOLS_REGISTERED_PLUGINS__) {
            addPlugin(plugin.pluginDescriptor, plugin.setupFn, ctx);
        }
    }
}
exports.addPreviouslyRegisteredPlugins = addPreviouslyRegisteredPlugins;
function sendPluginList(ctx) {
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_DEVTOOLS_PLUGIN_LIST, {
        plugins: ctx.plugins.map(p => serializePlugin(p))
    });
}
exports.sendPluginList = sendPluginList;
function serializePlugin(plugin) {
    return {
        id: plugin.descriptor.id,
        label: plugin.descriptor.label,
        appId: app_1.getAppRecordId(plugin.descriptor.app),
        packageName: plugin.descriptor.packageName,
        homepage: plugin.descriptor.homepage,
        logo: plugin.descriptor.logo,
        componentStateTypes: plugin.descriptor.componentStateTypes
    };
}
exports.serializePlugin = serializePlugin;
//# sourceMappingURL=plugin.js.map