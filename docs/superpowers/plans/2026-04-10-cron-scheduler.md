# Cron Scheduler Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable cron job infrastructure that auto-starts at server boot using node-cron and React Router v7's entry.server.tsx.

**Architecture:** Module-level singleton via a `global.__schedulerInitialized` guard in `entry.server.tsx`. The scheduler registry lives in `scheduler.server.ts`, jobs are registered from `jobs/index.ts`, and `entry.server.tsx` wires everything together at startup.

**Tech Stack:** node-cron, React Router v7 SSR, TypeScript, Vitest

---

### Task 1: Install node-cron

**Files:**
- Modify: `package.json` (pnpm adds it)

- [ ] **Step 1: Install dependencies**

```bash
pnpm add node-cron
pnpm add -D @types/node-cron
```

Expected output: packages added with no errors.

- [ ] **Step 2: Verify installation**

```bash
pnpm list node-cron @types/node-cron
```

Expected: both packages listed.

---

### Task 2: Create `app/server/scheduler.server.ts`

**Files:**
- Create: `app/server/scheduler.server.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/scheduler.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockStart = vi.fn();
const mockSchedule = vi.fn(() => ({ start: mockStart }));
const mockValidate = vi.fn(() => true);

vi.mock('node-cron', () => ({
  default: { schedule: mockSchedule, validate: mockValidate },
}));

describe('scheduler', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('registerJob schedules a cron task (not started)', async () => {
    const { registerJob } = await import('../app/server/scheduler.server');
    registerJob('test-job', '* * * * *', async () => {});
    expect(mockValidate).toHaveBeenCalledWith('* * * * *');
    expect(mockSchedule).toHaveBeenCalledWith(
      '* * * * *',
      expect.any(Function),
      { scheduled: false }
    );
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
    expect(() => registerJob('bad', 'not-a-cron', async () => {})).toThrow(
      'Invalid cron expression'
    );
  });

  it('handler errors are caught and do not propagate', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { registerJob } = await import('../app/server/scheduler.server');

    let capturedFn!: () => Promise<void>;
    mockSchedule.mockImplementationOnce((_expr, fn) => {
      capturedFn = fn;
      return { start: mockStart };
    });

    registerJob('fail-job', '* * * * *', async () => {
      throw new Error('boom');
    });

    await expect(capturedFn()).resolves.toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[cron:fail-job]'),
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
pnpm test:run tests/scheduler.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `app/server/scheduler.server.ts`**

```ts
import cron from 'node-cron';

type JobHandler = () => Promise<void>;

interface RegisteredJob {
  name: string;
  cronExpr: string;
  task: cron.ScheduledTask;
}

const registry = new Map<string, RegisteredJob>();

export function registerJob(
  name: string,
  cronExpr: string,
  handler: JobHandler
): void {
  if (!cron.validate(cronExpr)) {
    throw new Error(
      `[scheduler] Invalid cron expression for job "${name}": "${cronExpr}"`
    );
  }
  const task = cron.schedule(
    cronExpr,
    async () => {
      try {
        await handler();
      } catch (err) {
        console.error(`[cron:${name}] Job failed`, err);
      }
    },
    { scheduled: false }
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
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
pnpm test:run tests/scheduler.test.ts
```

Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/server/scheduler.server.ts tests/scheduler.test.ts
git commit -m "feat: add cron scheduler registry"
```

---

### Task 3: Create job files

**Files:**
- Create: `app/jobs/example.job.ts`
- Create: `app/jobs/index.ts`

- [ ] **Step 1: Create `app/jobs/example.job.ts`**

```ts
export const exampleJob = {
  name: 'example',
  cronExpr: '0 * * * *', // every hour
  async handler() {
    console.log('[job:example] Running example job');
  },
};
```

- [ ] **Step 2: Create `app/jobs/index.ts`**

```ts
import { registerJob } from '~/server/scheduler.server';
import { exampleJob } from './example.job';

export function registerAllJobs(): void {
  registerJob(exampleJob.name, exampleJob.cronExpr, exampleJob.handler);
}
```

- [ ] **Step 3: Commit**

```bash
git add app/jobs/example.job.ts app/jobs/index.ts
git commit -m "feat: add job registry and example job template"
```

---

### Task 4: Create `app/entry.server.tsx`

**Files:**
- Create: `app/entry.server.tsx`

`entry.server.tsx` does not exist yet — React Router v7 uses an internal default. Creating it overrides the default and lets us hook into module load time.

- [ ] **Step 1: Create `app/entry.server.tsx`**

```tsx
import { PassThrough } from 'node:stream';

import type { AppLoadContext, EntryContext } from 'react-router';
import { ServerRouter } from 'react-router';
import { createReadableStreamFromReadable } from '@react-router/node';
import { isbot } from 'isbot';
import { renderToPipeableStream } from 'react-dom/server';

import { registerAllJobs } from '~/jobs/index';
import { startAllJobs } from '~/server/scheduler.server';

declare global {
  // eslint-disable-next-line no-var
  var __schedulerInitialized: boolean | undefined;
}

if (!global.__schedulerInitialized) {
  global.__schedulerInitialized = true;
  registerAllJobs();
  startAllJobs();
}

const ABORT_DELAY = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  _loadContext: AppLoadContext
) {
  return isbot(request.headers.get('user-agent') ?? '')
    ? handleBotRequest(request, responseStatusCode, responseHeaders, routerContext)
    : handleBrowserRequest(
        request,
        responseStatusCode,
        responseHeaders,
        routerContext
      );
}

function handleBotRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set('Content-Type', 'text/html');
          resolve(
            new Response(stream, { headers: responseHeaders, status: responseStatusCode })
          );
          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          if (shellRendered) console.error(error);
        },
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}

function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set('Content-Type', 'text/html');
          resolve(
            new Response(stream, { headers: responseHeaders, status: responseStatusCode })
          );
          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          if (shellRendered) console.error(error);
        },
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
```

- [ ] **Step 2: Run typecheck**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/entry.server.tsx
git commit -m "feat: wire cron scheduler into server entry point"
```

---

### Task 5: Verify full test suite and build

- [ ] **Step 1: Run all tests**

```bash
pnpm test:run
```

Expected: all tests pass.

- [ ] **Step 2: Build**

```bash
pnpm build
```

Expected: build succeeds with no errors.
