"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPluginDefaultSettings = exports.setPluginSettings = exports.getPluginSettings = void 0;
const shared_data_1 = require("./shared-data");
function getPluginSettings(pluginId, defaultSettings) {
    var _a;
    return {
        ...defaultSettings !== null && defaultSettings !== void 0 ? defaultSettings : {},
        ...(_a = shared_data_1.SharedData.pluginSettings[pluginId]) !== null && _a !== void 0 ? _a : {},
    };
}
exports.getPluginSettings = getPluginSettings;
function setPluginSettings(pluginId, settings) {
    shared_data_1.SharedData.pluginSettings = {
        ...shared_data_1.SharedData.pluginSettings,
        [pluginId]: settings,
    };
}
exports.setPluginSettings = setPluginSettings;
function getPluginDefaultSettings(schema) {
    const result = {};
    if (schema) {
        for (const id in schema) {
            const item = schema[id];
            result[id] = item.defaultValue;
        }
    }
    return result;
}
exports.getPluginDefaultSettings = getPluginDefaultSettings;
//# sourceMappingURL=plugin-settings.js.map