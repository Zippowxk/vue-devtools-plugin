import { EditStatePayload } from '@vue/devtools-api';
export declare class StateEditor {
    set(object: any, path: any, value: any, cb?: any): void;
    get(object: any, path: any): any;
    has(object: any, path: any, parent?: boolean): boolean;
    createDefaultSetCallback(state: EditStatePayload): (obj: any, field: any, value: any) => void;
    isRef(ref: any): boolean;
    setRefValue(ref: any, value: any): void;
    getRefValue(ref: any): any;
}
