# Scheduler Docker Container — Design Spec

**Date:** 2026-04-10  
**Status:** Approved

---

## Context

The cron scheduler was initially integrated into the React Router app via `entry.server.tsx`. The goal is to extract it into a dedicated Docker container so that the `app` and `scheduler` containers have clear, independent responsibilities. Both services start together via `docker compose up`.

---

## Architecture

### Modified files

```
app/entry.server.tsx          # Remove scheduler init (global guard + imports)
docker-compose.yml            # Add "scheduler" service
Dockerfile                    # Build scheduler.js in the build stage
package.json                  # Add "build:scheduler" script
```

### New files

```
app/scheduler-worker.ts       # Standalone scheduler entry point
scripts/build-scheduler.mjs   # esbuild script that compiles the worker
```

### Service topology after change

```
docker compose up
  ├── postgres   → PostgreSQL 16
  ├── app        → node ./build/server/index.js   (React Router SSR, no scheduler)
  └── scheduler  → node ./build/scheduler.js      (cron jobs only, no HTTP server)
```

`app` and `scheduler` share the **same Docker image** (same `Dockerfile`, same build context). They differ only in the command they run. Both depend on `postgres:healthy`.

---

## Components

### `app/scheduler-worker.ts`

Standalone Node.js entry point. Registers all jobs, starts the scheduler, then keeps the process alive. Handles `SIGTERM` and `SIGINT` for graceful container shutdown.

```ts
import { registerAllJobs } from './jobs/index';
import { startAllJobs } from './server/scheduler.server';

registerAllJobs();
startAllJobs();
console.log('[scheduler] Worker started');

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT',  () => process.exit(0));
```

Uses **relative imports** (not `~/` alias) because it is compiled independently from the React Router build.

### `scripts/build-scheduler.mjs`

esbuild script that bundles `scheduler-worker.ts` into `build/scheduler.js`. Resolves the `~/` alias so that job files using `~/server/scheduler.server` continue to work.

```js
import { build } from 'esbuild';
import { resolve } from 'path';

await build({
  entryPoints: ['app/scheduler-worker.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: 'build/scheduler.js',
  alias: { '~': resolve('./app') },
});
```

### `package.json` — new script

```json
"build:scheduler": "node scripts/build-scheduler.mjs"
```

### `Dockerfile` — build stage update

```dockerfile
RUN pnpm run build && pnpm run build:scheduler
```

`build/scheduler.js` is produced in the `build-env` stage and copied into the final image alongside `build/server/index.js`.

### `docker-compose.yml` — new service

```yaml
scheduler:
  build: .
  container_name: maestro-scheduler
  restart: unless-stopped
  env_file:
    - .env
  depends_on:
    postgres:
      condition: service_healthy
  command: node ./build/scheduler.js
```

### `app/entry.server.tsx` — cleanup

Remove the scheduler init block entirely:
- `import { registerAllJobs } from '~/jobs/index'`
- `import { startAllJobs } from '~/server/scheduler.server'`
- `declare global { var __schedulerInitialized: … }`
- The `if (!global.__schedulerInitialized) { … }` block

---

## Data flow

```
docker compose up
  → postgres healthy
    → app container: React Router server starts (no cron)
    → scheduler container:
        registerAllJobs() → registers jobs in scheduler registry
        startAllJobs()    → node-cron starts timers
          → timer fires → handler() → try/catch (errors logged, not thrown)
```

---

## Error handling

| Scenario | Behavior |
|---|---|
| Job throws | Caught in scheduler.server.ts try/catch, logged, process stays up |
| DB unreachable inside job | Error logged, job retries on next cycle |
| Container OOM / crash | `restart: unless-stopped` restarts it automatically |
| SIGTERM from Docker | `process.on('SIGTERM')` exits cleanly |

---

## Dependencies

- **Add:** `esbuild` to devDependencies (used at build time only; already present transitively via Vite but must be explicit for reliability)
- **No change** to runtime deps, DB schema, or existing routes

---

## Testing

1. **Build test:** `pnpm build:scheduler` — verify `build/scheduler.js` is produced without errors.
2. **Local run test:** `node build/scheduler.js` — verify `[scheduler] Worker started` log appears and no crash.
3. **Docker test:** `docker compose up --build` — verify three containers start, `maestro-scheduler` logs show job registration.
4. **Isolation test:** `docker compose stop scheduler` — verify `maestro-app` continues serving HTTP normally.

---

## Out of scope

- Health check endpoint on the scheduler container
- Shared job state between app and scheduler containers
- Job deduplication / distributed locking
