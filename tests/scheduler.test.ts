import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockStart = vi.fn();
const mockCreateTask = vi.fn(() => ({ start: mockStart }));
const mockValidate = vi.fn(() => true);

vi.mock('node-cron', () => ({
  default: { createTask: mockCreateTask, validate: mockValidate },
}));

describe('scheduler', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('registerJob creates a cron task (not started)', async () => {
    const { registerJob } = await import('../app/server/scheduler.server');
    registerJob('test-job', '* * * * *', async () => {});
    expect(mockValidate).toHaveBeenCalledWith('* * * * *');
    expect(mockCreateTask).toHaveBeenCalledWith('* * * * *', expect.any(Function), {});
    expect(mockStart).not.toHaveBeenCalled();
  });

  it('startAllJobs starts every registered task', async () => {
    const { registerJob, startAllJobs } = await import('../app/server/scheduler.server');
    registerJob('job-a', '* * * * *', async () => {});
    registerJob('job-b', '0 * * * *', async () => {});
    startAllJobs();
    expect(mockStart).toHaveBeenCalledTimes(2);
  });

  it('getJobs returns registered job metadata', async () => {
    const { registerJob, getJobs } = await import('../app/server/scheduler.server');
    registerJob('meta-job', '0 0 * * *', async () => {});
    const jobs = getJobs();
    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toEqual({ name: 'meta-job', cronExpr: '0 0 * * *' });
  });

  it('registerJob throws on invalid cron expression', async () => {
    mockValidate.mockReturnValueOnce(false);
    const { registerJob } = await import('../app/server/scheduler.server');
    expect(() => registerJob('bad', 'not-a-cron', async () => {})).toThrow('Invalid cron expression');
  });

  it('handler errors are caught and do not propagate', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { registerJob } = await import('../app/server/scheduler.server');

    let capturedFn!: () => Promise<void>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockCreateTask as any).mockImplementationOnce((_expr: unknown, fn: () => Promise<void>) => {
      capturedFn = fn;
      return { start: mockStart };
    });

    registerJob('fail-job', '* * * * *', async () => {
      throw new Error('boom');
    });

    await expect(capturedFn()).resolves.toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[cron:fail-job]'), expect.any(Error));
    consoleSpy.mockRestore();
  });
});
