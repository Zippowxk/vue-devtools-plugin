import { BackendContext } from '@vue-devtools/app-backend-api';
import { ComponentInstance } from '@vue/devtools-api';
export default class ComponentPicker {
    ctx: BackendContext;
    selectedInstance: ComponentInstance;
    constructor(ctx: BackendContext);
    /**
     * Adds event listeners for mouseover and mouseup
     */
    startSelecting(): void;
    /**
     * Removes event listeners
     */
    stopSelecting(): void;
    /**
     * Highlights a component on element mouse over
     */
    elementMouseOver(e: MouseEvent): Promise<void>;
    /**
     * Selects an instance in the component view
     */
    elementClicked(e: MouseEvent): Promise<void>;
    /**
     * Cancel a mouse event
     */
    cancelEvent(e: MouseEvent): void;
    /**
     * Bind class methods to the class scope to avoid rebind for event listeners
     */
    bindMethods(): void;
}
