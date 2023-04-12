import { DevtoolsBackendOptions, DevtoolsBackend, BackendContext } from '@vue-devtools/app-backend-api';
export declare const availableBackends: DevtoolsBackendOptions[];
export declare function getBackend(backendOptions: DevtoolsBackendOptions, ctx: BackendContext): DevtoolsBackend;
