export declare type Job = () => Promise<void>;
export declare class JobQueue {
    jobs: Job[];
    currentJob: Job;
    queue(job: Job): Promise<void>;
}
