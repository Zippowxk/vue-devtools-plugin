"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPluginPermission = exports.hasPluginPermission = exports.PluginPermission = void 0;
const shared_data_1 = __importDefault(require("./shared-data"));
var PluginPermission;
(function (PluginPermission) {
    PluginPermission["ENABLED"] = "enabled";
    PluginPermission["COMPONENTS"] = "components";
    PluginPermission["CUSTOM_INSPECTOR"] = "custom-inspector";
    PluginPermission["TIMELINE"] = "timeline";
})(PluginPermission = exports.PluginPermission || (exports.PluginPermission = {}));
function hasPluginPermission(pluginId, permission) {
    const result = shared_data_1.default.pluginPermissions[`${pluginId}:${permission}`];
    if (result == null)
        return true;
    return !!result;
}
exports.hasPluginPermission = hasPluginPermission;
function setPluginPermission(pluginId, permission, active) {
    shared_data_1.default.pluginPermissions = {
        ...shared_data_1.default.pluginPermissions,
        [`${pluginId}:${permission}`]: active
    };
}
exports.setPluginPermission = setPluginPermission;
//# sourceMappingURL=plugin-permissions.js.map