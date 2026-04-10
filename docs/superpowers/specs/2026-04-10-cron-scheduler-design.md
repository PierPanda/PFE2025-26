# Cron Scheduler — Design Spec

**Date:** 2026-04-10  
**Status:** Approved

---

## Context

The app has no background task infrastructure. We need a reusable cron job system that:
- Starts automatically when the server boots
- Is easy to extend with new jobs
- Does not crash the server if a job throws

Stack: React Router v7 (SSR, `@react-router/serve`), Node.js, TypeScript, node-cron.

---

## Architecture

### New files

```
app/
├── server/
│   └── scheduler.server.ts     # Cron engine: job registry + init
├── jobs/
│   ├── index.ts                # Registers all active jobs
│   └── example.job.ts          # Template for new jobs
```

### Modified file

```
app/entry.server.tsx            # One-time scheduler init via global guard
```

### Boot flow

```
Server starts
  → entry.server.tsx loaded by @react-router/serve
    → global.__schedulerInitialized guard fires once
      → initScheduler() called
        → registerAllJobs() registers jobs from jobs/index.ts
          → node-cron starts timers
```

---

## Components

### `app/server/scheduler.server.ts`

Core engine. Responsibilities:
- Maintain a `Map<string, ScheduledTask>` of active jobs
- Export `registerJob(name, cronExpr, handler)` — validates cron expression, wraps handler in try/catch, schedules with node-cron
- Export `initScheduler()` — calls `registerAllJobs()` then logs active jobs
- Export `getJobs()` — returns list of `{ name, cron, running }` for observability

Error handling: each job handler is wrapped in an async try/catch. Errors are logged with the job name and stack trace but do not propagate.

### `app/jobs/example.job.ts`

Template job. Exports a plain object `{ name, cron, handler }`. The handler is an async function containing the task logic (DB queries, emails, etc.). Copy and rename this file for each new job.

### `app/jobs/index.ts`

Single registration point. Imports all job modules and calls `registerJob()` for each. Adding a new job = add one import + one call here.

### `app/entry.server.tsx` (modification)

Adds at the top:
```ts
import { initScheduler } from '~/server/scheduler.server';

declare global { var __schedulerInitialized: boolean | undefined }
if (!global.__schedulerInitialized) {
  global.__schedulerInitialized = true;
  initScheduler();
}
```

The `global.__schedulerInitialized` guard is the standard singleton pattern for React Router/Remix server code. It prevents double-initialization during hot module reload in development.

---

## Data flow

```
node-cron timer fires
  → handler() called (async)
    → try { await jobLogic() }
    → catch (err) { console.error(`[cron:${name}]`, err) }
  → next timer cycle scheduled automatically by node-cron
```

---

## Error handling

| Scenario | Behavior |
|---|---|
| Job throws synchronously | Caught by async try/catch, logged, server unaffected |
| Job throws asynchronously (rejected promise) | Caught by await + try/catch, logged |
| Invalid cron expression | node-cron throws at `registerJob` time (startup), not at runtime — fails fast |
| DB unreachable inside job | Error logged, job retries on next cycle |

---

## Testing

1. **Unit test `scheduler.server.ts`**: mock node-cron, verify `registerJob` schedules tasks and `initScheduler` calls `registerAllJobs`.
2. **Unit test each job**: call `handler()` directly with a mocked DB/service, assert side effects.
3. **Manual smoke test**: set cron to `* * * * *` (every minute), start dev server, observe console log after 60s.

---

## Dependencies

- **Add:** `node-cron` + `@types/node-cron` (dev)
- **No change** to existing routes, services, or DB schema

---

## Out of scope

- HTTP endpoint to start/stop jobs at runtime (not needed for this iteration)
- Job persistence / history in DB
- Distributed locking (single-instance deployment assumed)
