import { BackendContext } from '@vue-devtools/app-backend-api';
import { TimelineMarkerOptions } from '@vue/devtools-api';
export declare function addTimelineMarker(options: TimelineMarkerOptions, ctx: BackendContext): Promise<void>;
export declare function sendTimelineMarkers(ctx: BackendContext): Promise<void>;
