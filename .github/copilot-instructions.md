# Copilot Instructions for suricarte

Practical guidance for AI agents to work productively in this monorepo. Focus on real patterns and commands present in the codebase; call out planned integrations separately.

> **📚 React Router v7 Reference:** See [docs/react-router-v7-framework-mode.md](../docs/react-router-v7-framework-mode.md) for comprehensive routing patterns, data loading strategies, and best practices optimized for AI agents.

## Overview

- Monorepo managed by `pnpm` per [pnpm-workspace.yaml](pnpm-workspace.yaml); primary app is in [apps/app](apps/app). `packages/*` is reserved for shared libs (DB schema, auth, utilities).
- React Router v7 with SSR enabled in [apps/app/react-router.config.ts](apps/app/react-router.config.ts); Vite handles dev/build via [apps/app/vite.config.ts](apps/app/vite.config.ts).
- Tailwind v4 styling in [apps/app/app/app.css](apps/app/app/app.css). TS path alias `~/*` → `app/*` from [apps/app/tsconfig.json](apps/app/tsconfig.json).
- Local infra via [docker-compose.yml](docker-compose.yml): Postgres, MinIO, and Drizzle Gateway (service available; no app integration yet).
- Domain: internal, API‑first system to track vending machine stock and sales.

## Developer Workflow

- Install deps:

```bash
pnpm install
```

- Dev server (SSR + HMR):

```bash
pnpm dev
```

- Typegen + typecheck:

```bash
pnpm --filter app run typecheck
```

- Build and serve:

```bash
pnpm --filter app build
pnpm --filter app start
```

## Architecture & Conventions

- SSR‑first: `ssr: true` in [apps/app/react-router.config.ts](apps/app/react-router.config.ts). Only flip to SPA if explicitly required.
- Routing is imperative in [apps/app/app/routes.ts](apps/app/app/routes.ts); do not add file‑system routing.
- App shell + error handling in [apps/app/app/root.tsx](apps/app/app/root.tsx) via `Layout`, `links()`, `Meta`, `Scripts`, `ErrorBoundary`.
- File naming: use kebab‑case for all files and folders.
- Data conventions: DB tables should use singular names (e.g., `machine`, `product`, `sale`, `stock`).
- Shared logic should live under `packages/*` when introduced; app‑specific components/utilities stay under [apps/app/app](apps/app/app) and import via `~/*`.

### JSX Conditional Patterns

- Nested ternaries are considered bad practice; avoid them for readability and maintainability.
- For inline complex conditions in JSX, prefer an immediately invoked function expression (IIFE): `(() => { /* branching */ return <UI /> })()`.
- Keep single, flat ternaries only for simple binary cases that fit on one short line.
- Example:

```tsx
// Avoid
const ui = cond1 ? (cond2 ? <A /> : <B />) : <C />;

// Prefer
const ui = (() => {
  if (cond1) {
    if (cond2) return <A />;
    return <B />;
  }
  return <C />;
})()
```

### Styling: `cn` Utility for ClassNames

Always use the `cn` utility from `@heroui/react` for dynamic className computations. This improves readability and maintainability.

**Import:**

```tsx
import { cn } from '@heroui/react';
```

**Guidelines:**

- **Always prefer `cn`** over template literals with conditional logic in `className` props
- Use inline conditions directly in `cn` for simple logic
- Use IIFE inside `cn` for complex conditional logic (prefer this over extracting helper functions)
- `cn` automatically filters out falsy values, making conditionals clean

**Examples:**

```tsx
// ❌ Avoid: Template literal with IIFE
<span className={`font-semibold ${(() => {
  if (quantity === 0) return 'text-danger';
  if (quantity <= minThreshold) return 'text-warning';
  return 'text-success';
})()}`}>
  {quantity}
</span>

// ✅ Prefer: IIFE inside cn utility
<span className={cn('font-semibold', (() => {
  if (quantity === 0) return 'text-danger';
  if (quantity <= minThreshold) return 'text-warning';
  return 'text-success';
})())}>
  {quantity}
</span>

// ✅ Good: Simple conditional
<div className={cn('flex items-center gap-2', isActive && 'bg-primary')}>

// ✅ Good: Multiple conditions
<button className={cn(
  'px-4 py-2 rounded',
  isLoading && 'opacity-50 cursor-wait',
  isDisabled && 'opacity-30 cursor-not-allowed',
  variant === 'primary' && 'bg-blue-500 text-white'
)}>
```

**Benefits:**

- Cleaner, more maintainable code
- Automatic handling of conditional classes (falsy values are ignored)
- Better readability compared to template literals
- Consistent pattern across the codebase

## React Router v7: Key Points

- **Imperative routing only** via [apps/app/app/routes.ts](apps/app/app/routes.ts) - NO file-system routing
- **SSR-first:** Use `loader` for server-side data, `clientLoader` for navigation optimization
- **Type-safe:** Import types from `./+types/<route-filename>`
- **Route modules** export: `loader`, `action`, default component, optionally `ErrorBoundary`
- **Always redirect** after successful `action` mutations

**For detailed patterns, see [docs/react-router-v7-framework-mode.md](../docs/react-router-v7-framework-mode.md)**

## Fetching Data: Use `fetcher` Utility

Always use the typed `fetcher` utility from [apps/app/src/utils/fetcher.ts](apps/app/src/utils/fetcher.ts) instead of raw `fetch()`. It provides:

- **Type-safe API calls** - Automatically infers return types based on the API route path
- **Error handling** - Throws on non-2xx responses with descriptive error messages
- **Method detection** - Infers `GET` vs `POST` from options, returns appropriate type (`ApiRouteQueryResult` or `ApiRouteMutationResult`)

### Usage

```typescript
// Type-safe GET request
const machines = await fetcher('/api/pifutoys/machines');

// Type-safe POST request
const updated = await fetcher('/api/products', { method: 'POST', body: JSON.stringify(data) });
```

The return type is automatically narrowed based on the route path—no manual typing needed. Invalid paths will fail TypeScript compilation.

## Local Services & Integrations

- Postgres at `localhost:5495`, user `postgres`, password `postgres`, db `suricarte`.
- MinIO API `:9000`, Console `:9001` (user `storage`, password `secret1234`), with a `default` bucket auto‑created.
- Drizzle Gateway at `:4983` (named volume). App code does not yet consume it; integrate via a `packages/db` module when ready.

## Present vs Planned Stack

- Present: `pnpm`, React Router v7 (SSR), Vite, Tailwind v4, TypeScript.
- Planned (not yet wired in code): HeroUI, @iconify, Prettier, ESLint, PostHog, Drizzle ORM, Better‑Auth, Zod. When adding, prefer `packages/*` for shared modules (auth, db, analytics) and keep app imports via `~/*`.

## MCP: Context7 Docs

Always use context7 when I need code generation, setup or configuration steps, or
library/API documentation. This means you should automatically use the Context7 MCP
tools to resolve library id and get library docs without me having to explicitly ask.

## Examples from the Codebase

- Fonts and `<link>` tags via `links()` in [apps/app/app/root.tsx](apps/app/app/root.tsx) to preconnect/load Inter.
- Welcome screen component at [apps/app/app/welcome/welcome.tsx](apps/app/app/welcome/welcome.tsx) with Tailwind classes and SVG assets.
- Vite plugins in [apps/app/vite.config.ts](apps/app/vite.config.ts): keep plugin order minimal and intact.

## Commit and Pull Request Conventions

**CRITICAL**: This repository follows strict commit and PR naming conventions per [CONTRIBUTING.md](../CONTRIBUTING.md). AI agents **MUST** adhere to these guidelines.

### Commit Message Format

All commits must follow the [Angular Commit Message Convention](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit):

```
type(scope): message title
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`

**Scopes**: `app`, `auth`, `db`, `mail`, `dashboard`, `sales`, `stock`, `machines`, or other descriptive scopes

**Examples**:
- `feat(auth): add JWT token refresh mechanism`
- `fix(db): resolve connection pool exhaustion issue`
- `docs(readme): update quick start instructions`
- `refactor(app): simplify routing configuration`
- `chore(deps): update drizzle-orm to v0.45.1`

**Guidelines**:
1. Keep message title concise (50 chars or less recommended)
2. Use imperative mood ("add" not "added" or "adds")
3. Don't capitalize the first letter of message title
4. Don't end message title with a period
5. See [CONTRIBUTING.md](../CONTRIBUTING.md) for complete guidelines

### Pull Request Naming

**Pull request titles MUST match the commit message format**:

```
type(scope): message title
```

When creating or updating PRs:
- Use the same format as commits
- The PR title should describe the overall change
- If the PR contains a single commit, the PR title should match that commit exactly
- If the PR contains multiple related commits, the PR title should reflect the primary/most significant change

**Example PR titles**:
- `feat(dashboard): add real-time stock level indicators`
- `fix(sales): correct tax calculation for transactions`
- `docs(contributing): add commit message examples`

## What to Avoid

- Do not introduce file‑system routing; keep using `RouteConfig` in [apps/app/app/routes.ts](apps/app/app/routes.ts).
- Do not change SSR mode unless asked; meta tags and flows assume SSR.
- Do not add backend code inside the app; align with docker services and place shared backend/client code under `packages/*`.
- **Do not** use arbitrary commit messages like "fix typo", "WIP", "changes", etc.
- **Do not** create PRs with titles that don't follow the `type(scope): message` format.

If any section needs clarification (e.g., planned Drizzle/Auth/PostHog integration points), please comment so we can refine and codify the conventions.
