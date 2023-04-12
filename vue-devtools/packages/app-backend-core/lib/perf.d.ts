import { BackendContext, DevtoolsBackend } from '@vue-devtools/app-backend-api';
import { App, ComponentInstance } from '@vue/devtools-api';
export declare function performanceMarkStart(app: App, uid: number, instance: ComponentInstance, type: string, time: number, ctx: BackendContext): Promise<void>;
export declare function performanceMarkEnd(app: App, uid: number, instance: ComponentInstance, type: string, time: number, ctx: BackendContext): Promise<void>;
export declare function handleAddPerformanceTag(backend: DevtoolsBackend, ctx: BackendContext): void;
