import { BackendContext, DevtoolsBackend } from '@vue-devtools/app-backend-api';
import { ComponentInstance } from '@vue/devtools-api';
export declare function highlight(instance: ComponentInstance, backend: DevtoolsBackend, ctx: BackendContext): Promise<void>;
export declare function unHighlight(): Promise<void>;
