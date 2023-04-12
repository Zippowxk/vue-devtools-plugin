import { Bridge } from '@vue-devtools/shared-utils';
import { TimelineLayerOptions, CustomInspectorOptions, TimelineEventOptions, WithId, ID, TimelineMarkerOptions } from '@vue/devtools-api';
import { AppRecord } from './app-record';
import { Plugin } from './plugin';
import { DevtoolsHook } from './global-hook';
import { DevtoolsBackend } from './backend';
export interface BackendContext {
    bridge: Bridge;
    hook: DevtoolsHook;
    backends: DevtoolsBackend[];
    appRecords: AppRecord[];
    currentTab: string;
    currentAppRecord: AppRecord;
    currentInspectedComponentId: string;
    plugins: Plugin[];
    currentPlugin: Plugin;
    timelineLayers: TimelineLayer[];
    nextTimelineEventId: number;
    timelineEventMap: Map<ID, TimelineEventOptions & WithId>;
    perfUniqueGroupId: number;
    customInspectors: CustomInspector[];
    timelineMarkers: TimelineMarker[];
}
export interface TimelineLayer extends TimelineLayerOptions {
    appRecord: AppRecord | null;
    plugin: Plugin;
    events: (TimelineEventOptions & WithId)[];
}
export interface TimelineMarker extends TimelineMarkerOptions {
    appRecord: AppRecord | null;
}
export interface CustomInspector extends CustomInspectorOptions {
    appRecord: AppRecord;
    plugin: Plugin;
    treeFilter: string;
    selectedNodeId: string;
}
export interface CreateBackendContextOptions {
    bridge: Bridge;
    hook: DevtoolsHook;
}
export declare function createBackendContext(options: CreateBackendContextOptions): BackendContext;
