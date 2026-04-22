import { registerAllJobs } from './jobs/index';
import { startAllJobs } from './server/scheduler.server';

registerAllJobs();
startAllJobs();
console.log('[scheduler] Worker started');

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
