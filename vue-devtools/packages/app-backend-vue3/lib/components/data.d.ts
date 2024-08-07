import { BackendContext } from '@vue-devtools/app-backend-api';
import { StateEditor } from '@vue-devtools/shared-utils';
import { CustomState, HookPayloads, Hooks, InspectedComponentData } from '@vue/devtools-api';
/**
 * Get the detailed information of an inspected instance.
 */
export declare function getInstanceDetails(instance: any, ctx: BackendContext): InspectedComponentData;
export declare function getCustomObjectDetails(object: any, proto: string): CustomState | undefined;
export declare function editState({ componentInstance, path, state, type }: HookPayloads[Hooks.EDIT_COMPONENT_STATE], stateEditor: StateEditor, ctx: BackendContext): void;
export declare function getCustomInstanceDetails(instance: any): {
    _custom: {
        type: string;
        id: any;
        display: any;
        tooltip: string;
        value: any;
        fields: {
            abstract: boolean;
        };
    };
};
