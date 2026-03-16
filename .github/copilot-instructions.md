# Copilot Instructions — Maestroo

AI agent guidance for working productively in this codebase. Focus on real patterns present in the code.

## Stack

- **Framework**: React Router v7 (SSR mode)
- **UI**: HeroUI (based on NextUI) + Tailwind CSS v4
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth
- **Validation**: Zod v4 (centralised in `app/lib/validation.ts`)
- **State management**: TanStack Query (client-side fetches)
- **Language**: TypeScript
- **Bundler**: Vite
- **Package manager**: pnpm
- **Linter / formatter**: oxlint + oxfmt
- **Tests**: Vitest
- **Git hooks**: Husky + lint-staged

## Developer Workflow

```bash
pnpm install          # install dependencies
pnpm dev              # dev server (SSR + HMR)
pnpm typecheck        # run typegen then tsc --noEmit
pnpm lint             # lint and auto-fix
pnpm lint:check       # lint without auto-fix (CI)
pnpm format           # format with oxfmt
pnpm test             # run tests interactively
pnpm test:run         # run tests once (CI)
pnpm build            # production build
pnpm start            # serve production build
pnpm "db generate"    # generate Drizzle migrations
pnpm "db migrate"     # run migrations
pnpm "db push"        # push schema directly (dev only)
pnpm "db studio"      # open Drizzle Studio
pnpm "db seed"        # seed the database
pnpm "db reset"       # reset and re-seed
```

## Architecture & Conventions

- **SSR-first**: `ssr: true` in `react-router.config.ts`. Do not switch to SPA mode.
- **Imperative routing** via `app/routes.ts` — no file-system routing.
- **TypeScript path alias**: `~/*` → `app/*` (defined in `tsconfig.json`).
- **File naming**: kebab-case for all files and folders.
- **Server-only code**: DB access and server utilities live under `app/server/`. Auth helpers use `.server.ts` suffix.

## Project Structure

```
app/
├── auth.server.ts              # Better Auth config
├── lib/
│   ├── auth-client.ts          # auth client
│   ├── validation.ts           # centralised Zod schemas
│   ├── constant.ts             # shared constants (categories, levels…)
│   └── utils.ts                # shared utilities (cn helper, etc.)
├── routes/
│   ├── _api/                   # API routes (loader / action, no JSX)
│   │   ├── auth/route.ts
│   │   ├── courses/route.ts
│   │   ├── teachers/route.ts
│   │   ├── learners/route.ts
│   │   ├── availabilities/route.ts
│   │   └── stats/route.ts
│   ├── layouts/                # shared layouts (auth-layout, public-layout)
│   └── pages/                  # UI pages
├── server/
│   ├── lib/db/                 # Drizzle schema + client
│   └── utils/
│       └── authentify-user.server.ts
├── services/                   # business logic (one file per operation)
│   ├── courses/
│   ├── teachers/
│   ├── learners/
│   ├── availabilities/
│   └── stats/
├── types/                      # shared TypeScript types
├── components/                 # shared React components
└── hooks/                      # custom React hooks
```

## API Routes (`routes/_api/`)

Files use `.ts` extension (no JSX). Service imports have no `.server` suffix.
Loaders handle GET; actions handle POST/PUT/DELETE.

```ts
// app/routes/_api/courses/route.ts
import { data, type LoaderFunctionArgs, type ActionFunctionArgs } from 'react-router';
import { authentifyUser } from '~/server/utils/authentify-user.server';
import { createCourseSchema } from '~/lib/validation';
import { createCourse } from '~/services/courses/create-course';
import { getCourses } from '~/services/courses/get-courses';

export async function loader({ request }: LoaderFunctionArgs) {
  return getCourses();
}

export async function action({ request }: ActionFunctionArgs) {
  await authentifyUser(request);
  const body = await request.json();
  const parsed = createCourseSchema.safeParse(body);
  if (!parsed.success) {
    return data({ success: false, error: parsed.error.issues.map((e) => e.message).join(', ') }, { status: 400 });
  }
  return createCourse(parsed.data);
}
```

## Page Routes (`routes/pages/`)

**Always** use auto-generated route types — do NOT fall back to generic `LoaderFunctionArgs`.
Run `pnpm typecheck` (which calls `react-router typegen`) to generate or refresh `+types/` files.

```ts
// app/routes/pages/profile/page.tsx
import type { Route } from './+types/page';
import { authentifyUser } from '~/server/utils/authentify-user.server';

export async function loader({ request }: Route.LoaderArgs) {
  const session = await authentifyUser(request, { redirectTo: '/auth' });
  return { user: session.user };
}

export async function action({ request }: Route.ActionArgs) {
  await authentifyUser(request, { redirectTo: '/auth' });
  // ...
}

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data?.user ? 'Profil | Maestroo' : 'Maestroo' }];
}

export default function Page() {
  const { user } = useLoaderData<typeof loader>();
}
```

## Authentication

Use `authentifyUser` in every protected loader:

```ts
// With redirect (page routes)
const session = await authentifyUser(request, { redirectTo: '/auth' });

// Without redirect — returns 401 (API routes)
const session = await authentifyUser(request);
```

Do NOT:
- Put auth logic in layout components
- Use `<Navigate />` or client-side redirects for auth
- Check auth exclusively on the client

## Centralised Validation (`lib/validation.ts`)

```ts
// Schemas
export const createCourseSchema = z.object({ ... });
export const updateCourseSchema = createCourseSchema.partial().extend({ ... });

// Inferred types
export type CreateCourseInput = z.infer<typeof createCourseSchema>;

// Helpers
export function validateSearchParams<T>(url: URL, schema: T): z.infer<T>;
export async function validateJsonBody<T>(request: Request, schema: T): Promise<z.infer<T>>;
export async function validateFormData<T>(request: Request, schema: T): Promise<z.infer<T>>;
export function validateParams<T>(params: Record<string, string>, schema: T): z.infer<T>;
```

## Drizzle Types

Infer types directly from the schema — do not write manual interfaces for DB entities:

```ts
// app/types/course.ts
import { courses } from '~/server/lib/db/schema-definition/courses';

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
```

## JSX Conditional Patterns

- Avoid nested ternaries.
- For complex inline conditions, use an IIFE:

```tsx
// ❌ Avoid
const ui = cond1 ? (cond2 ? <A /> : <B />) : <C />;

// ✅ Prefer
const ui = (() => {
  if (cond1) {
    if (cond2) return <A />;
    return <B />;
  }
  return <C />;
})();
```

## Styling: `cn` Utility

Always use `cn` from `@heroui/react` for dynamic className composition:

```tsx
import { cn } from '@heroui/react';

// ✅ Simple conditional
<div className={cn('flex items-center gap-2', isActive && 'bg-primary')} />

// ✅ Complex conditional via IIFE inside cn
<span className={cn('font-semibold', (() => {
  if (qty === 0) return 'text-danger';
  if (qty <= min) return 'text-warning';
  return 'text-success';
})())} />

// ❌ Avoid template literals with conditional logic
<span className={`font-semibold ${isActive ? 'text-primary' : 'text-gray-500'}`} />
```

## MCP: Context7 Docs

Always use context7 for library documentation and code generation. Resolve the library id first, then fetch the docs. Do this automatically without waiting to be asked.

## Commit and Pull Request Conventions

All commits must follow the [Angular Commit Message Convention](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit):

```
type(scope): message title
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`

**Scopes**: `app`, `auth`, `db`, `courses`, `teachers`, `learners`, `availabilities`, `dashboard`, `profile`, `ci`, or any other descriptive scope.

**Examples**:
- `feat(courses): add course filtering by category`
- `fix(auth): redirect to login on expired session`
- `refactor(services): remove .server suffix from service files`
- `ci(workflow): restore lint:check script name`
- `chore(deps): upgrade drizzle-orm to v0.45.1`

**Guidelines**:
1. Keep message title under 50 characters
2. Use imperative mood ("add" not "added" or "adds")
3. Do not capitalise the first letter of the title
4. Do not end the title with a period

**PR titles follow the same format.** See [CONTRIBUTING.md](../CONTRIBUTING.md).

## What to Avoid

- No file-system routing — use `RouteConfig` in `app/routes.ts`.
- No SPA mode — SSR is assumed throughout.
- No `LoaderFunctionArgs` / `ActionFunctionArgs` in page routes — use `Route.LoaderArgs` / `Route.ActionArgs` from `./+types/page`.
- No arbitrary commit messages ("WIP", "fix", "changes", "update").
- No PR titles that do not follow `type(scope): message` format.
