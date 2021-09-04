import { BackendContext } from '@vue-devtools/app-backend-api';
import { ComponentTreeNode } from '@vue/devtools-api';
export declare let instanceMap: Map<any, any>;
export declare let functionalVnodeMap: Map<any, any>;
export declare function walkTree(instance: any, pFilter: string, ctx: BackendContext): ComponentTreeNode[];
export declare function getComponentParents(instance: any, ctx: BackendContext): any[];
