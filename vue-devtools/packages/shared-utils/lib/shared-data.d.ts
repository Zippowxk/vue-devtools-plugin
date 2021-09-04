import { Bridge } from './bridge';
declare const internalSharedData: {
    openInEditorHost: string;
    componentNameStyle: string;
    theme: string;
    displayDensity: string;
    timeFormat: string;
    recordVuex: boolean;
    cacheVuexSnapshotsEvery: number;
    cacheVuexSnapshotsLimit: number;
    snapshotLoading: boolean;
    performanceMonitoringEnabled: boolean;
    editableProps: boolean;
    logDetected: boolean;
    vuexNewBackend: boolean;
    vuexAutoload: boolean;
    vuexGroupGettersByModule: boolean;
    showMenuScrollTip: boolean;
    timelineTimeGrid: boolean;
    timelineScreenshots: boolean;
    menuStepScrolling: boolean;
    pluginPermissions: {};
};
export interface SharedDataParams {
    bridge: Bridge;
    persist: boolean;
    Vue?: any;
}
export declare function initSharedData(params: SharedDataParams): Promise<unknown>;
export declare function onSharedDataInit(cb: any): () => void;
export declare function destroySharedData(): void;
export declare function watchSharedData(prop: any, handler: any): () => void;
declare const proxy: Partial<typeof internalSharedData>;
export default proxy;
