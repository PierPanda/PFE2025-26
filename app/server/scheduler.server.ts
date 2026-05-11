import cron, { type ScheduledTask } from 'node-cron';

type JobHandler = () => Promise<void>;

interface RegisteredJob {
  name: string;
  cronExpr: string;
  task: ScheduledTask;
}

const registry = new Map<string, RegisteredJob>();

export function registerJob(name: string, cronExpr: string, handler: JobHandler): void {
  if (!cron.validate(cronExpr)) {
    throw new Error(`[scheduler] Invalid cron expression for job "${name}": "${cronExpr}"`);
  }
  const task = cron.createTask(
    cronExpr,
    async () => {
      try {
        await handler();
      } catch (err) {
        console.error(`[cron:${name}] Job failed`, err);
      }
    },
    {},
  );
  registry.set(name, { name, cronExpr, task });
}

export function startAllJobs(): void {
  for (const job of registry.values()) {
    job.task.start();
    console.log(`[scheduler] Started "${job.name}" (${job.cronExpr})`);
  }
}

export function getJobs(): Array<{ name: string; cronExpr: string }> {
  return Array.from(registry.values()).map(({ name, cronExpr }) => ({
    name,
    cronExpr,
  }));
}
