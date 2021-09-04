export declare enum PluginPermission {
    ENABLED = "enabled",
    COMPONENTS = "components",
    CUSTOM_INSPECTOR = "custom-inspector",
    TIMELINE = "timeline"
}
export declare function hasPluginPermission(pluginId: string, permission: PluginPermission): boolean;
export declare function setPluginPermission(pluginId: string, permission: PluginPermission, active: boolean): void;
