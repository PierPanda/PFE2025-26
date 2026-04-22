import { registerJob } from '~/server/scheduler.server';
import { exampleJob } from './example.job';

export function registerAllJobs(): void {
  registerJob(exampleJob.name, exampleJob.cronExpr, exampleJob.handler);
}
