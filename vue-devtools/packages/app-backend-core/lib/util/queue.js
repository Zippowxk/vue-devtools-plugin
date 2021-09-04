"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobQueue = void 0;
class JobQueue {
    constructor() {
        this.jobs = [];
    }
    queue(job) {
        return new Promise(resolve => {
            const onDone = () => {
                this.currentJob = null;
                const nextJob = this.jobs.shift();
                if (nextJob) {
                    nextJob();
                }
                resolve();
            };
            const run = () => {
                this.currentJob = job;
                return job().then(onDone);
            };
            if (this.currentJob) {
                this.jobs.push(() => run());
            }
            else {
                run();
            }
        });
    }
}
exports.JobQueue = JobQueue;
//# sourceMappingURL=queue.js.map