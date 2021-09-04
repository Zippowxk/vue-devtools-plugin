import { PluginDescriptor, SetupFunction } from '@vue/devtools-api';
import { Plugin, BackendContext } from '@vue-devtools/app-backend-api';
export declare function addPlugin(pluginDescriptor: PluginDescriptor, setupFn: SetupFunction, ctx: BackendContext): void;
export declare function addQueuedPlugins(ctx: BackendContext): Promise<void>;
export declare function addPreviouslyRegisteredPlugins(ctx: BackendContext): Promise<void>;
export declare function sendPluginList(ctx: BackendContext): void;
export declare function serializePlugin(plugin: Plugin): {
    id: string;
    label: string;
    appId: number;
    packageName: string;
    homepage: string;
    logo: string;
    componentStateTypes: string[];
};
