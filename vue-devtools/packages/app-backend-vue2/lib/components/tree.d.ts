import { BackendContext, DevtoolsApi } from '@vue-devtools/app-backend-api';
import { ComponentTreeNode } from '@vue/devtools-api';
export declare let instanceMap: Map<any, any>;
export declare let functionalVnodeMap: Map<any, any>;
export declare function walkTree(instance: any, pFilter: string, pRecursively: boolean, api: DevtoolsApi, ctx: BackendContext): Promise<ComponentTreeNode[]>;
export declare function getComponentParents(instance: any, api: DevtoolsApi, ctx: BackendContext): any[];
