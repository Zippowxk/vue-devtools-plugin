import { AppRecord } from './app-record';
import { DevtoolsApi } from './api';
import { BackendContext } from './backend-context';
export declare enum BuiltinBackendFeature {
    /**
     * @deprecated
     */
    FLUSH = "flush"
}
export interface DevtoolsBackendOptions {
    frameworkVersion: 1 | 2 | 3;
    features: (BuiltinBackendFeature | string)[];
    setup: (api: DevtoolsApi) => void;
    setupApp?: (api: DevtoolsApi, app: AppRecord) => void;
}
export declare function defineBackend(options: DevtoolsBackendOptions): DevtoolsBackendOptions;
export interface DevtoolsBackend {
    options: DevtoolsBackendOptions;
    api: DevtoolsApi;
}
export declare function createBackend(options: DevtoolsBackendOptions, ctx: BackendContext): DevtoolsBackend;
