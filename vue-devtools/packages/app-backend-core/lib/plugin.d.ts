import { PluginQueueItem } from '@vue/devtools-api';
import { Plugin, BackendContext } from '@vue-devtools/app-backend-api';
export declare function addPlugin(pluginQueueItem: PluginQueueItem, ctx: BackendContext): Promise<void>;
export declare function addQueuedPlugins(ctx: BackendContext): Promise<void>;
export declare function addPreviouslyRegisteredPlugins(ctx: BackendContext): Promise<void>;
export declare function sendPluginList(ctx: BackendContext): Promise<void>;
export declare function serializePlugin(plugin: Plugin): Promise<{
    id: string;
    label: string;
    appId: string;
    packageName: string;
    homepage: string;
    logo: string;
    componentStateTypes: string[];
    settingsSchema: Record<string, import("@vue/devtools-api").PluginSettingsItem>;
}>;
