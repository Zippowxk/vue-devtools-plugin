import { BackendContext } from '@vue-devtools/app-backend-api';
import { ID } from '@vue/devtools-api';
interface Screenshot {
    id: ID;
    time: number;
    image: string;
    events: ID[];
}
export declare function showScreenshot(screenshot: Screenshot, ctx: BackendContext): Promise<void>;
export {};
