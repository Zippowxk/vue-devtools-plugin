import { StateEditor } from '@vue-devtools/shared-utils';
import { CustomState, HookPayloads, Hooks, InspectedComponentData } from '@vue/devtools-api';
import 'core-js/modules/es.object.entries';
/**
 * Get the detailed information of an inspected instance.
 */
export declare function getInstanceDetails(instance: any): InspectedComponentData;
export declare function getCustomInstanceDetails(instance: any): {
    _custom: {
        type: string;
        id: any;
        display: string;
        tooltip: string;
        value: any;
        fields: {
            abstract: boolean;
        };
    };
};
export declare function reduceStateList(list: any): any;
/**
 * Get the appropriate display name for an instance.
 */
export declare function getInstanceName(instance: any): string;
export declare function getCustomObjectDetails(object: any, proto: string): CustomState | undefined;
export declare function findInstanceOrVnode(id: any): any;
export declare function editState({ componentInstance, path, state, type, }: HookPayloads[Hooks.EDIT_COMPONENT_STATE], stateEditor: StateEditor): void;
