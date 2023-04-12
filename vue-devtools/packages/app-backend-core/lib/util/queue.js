"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobQueue = void 0;
class JobQueue {
    constructor() {
        this.jobs = [];
    }
    queue(id, fn) {
        const job = {
            id,
            fn,
        };
        return new Promise(resolve => {
            const onDone = () => {
                this.currentJob = null;
                const nextJob = this.jobs.shift();
                if (nextJob) {
                    nextJob.fn();
                }
                resolve();
            };
            const run = () => {
                this.currentJob = job;
                return job.fn().then(onDone).catch(e => {
                    console.error(`Job ${job.id} failed:`);
                    console.error(e);
                });
            };
            if (this.currentJob) {
                this.jobs.push({
                    id: job.id,
                    fn: () => run(),
                });
            }
            else {
                run();
            }
        });
    }
}
exports.JobQueue = JobQueue;
//# sourceMappingURL=queue.js.map