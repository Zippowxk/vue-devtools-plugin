export interface Job {
    id: string;
    fn: () => Promise<void>;
}
export declare class JobQueue {
    jobs: Job[];
    currentJob: Job;
    queue(id: string, fn: Job['fn']): Promise<void>;
}
