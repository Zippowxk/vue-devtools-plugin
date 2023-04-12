import { PluginSettingsItem } from '@vue/devtools-api';
export declare function getPluginSettings<TSettings extends Record<string, any> = any>(pluginId: string, defaultSettings?: TSettings): TSettings;
export declare function setPluginSettings<TSettings extends Record<string, any> = any>(pluginId: string, settings: TSettings): void;
export declare function getPluginDefaultSettings<TSettings extends Record<string, any> = any>(schema: Record<string, PluginSettingsItem>): TSettings;
