# Instructions Claude Code - Projet Maestro

## Stack technique

- React Router v7 (SSR)
- HeroUI (composants UI)
- Drizzle ORM + PostgreSQL (Neon)
- Better Auth (authentification)
- Zod (validation)
- TypeScript

## Conventions critiques

### Fichiers serveur `.server.ts`

**TOUJOURS** suffixer avec `.server.ts` les fichiers contenant :
- Accès base de données
- `process.env`
- Secrets/clés API

```
app/server/lib/db/index.server.ts
app/server/lib/auth.server.ts
app/server/actions/**/*.server.ts
app/server/utils/env.server.ts
```

### Séparation serveur/client dans les routes

```tsx
// ✅ OK dans loader/action
import { auth } from "~/server/lib/auth.server";

export async function loader() { ... }
export async function action() { ... }

// ❌ INTERDIT dans le composant
export default function Page() {
  // Pas d'import .server.ts ici
}
```

## Types

Inférer depuis Drizzle dans `/types` :

```tsx
// app/types/course.ts
import { courses } from "~/server/lib/db/schema-definition/courses";

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
```

## Actions serveur

```tsx
// app/server/actions/course/create.actions.server.ts
import { db } from "~/server/lib/db/index.server";
import type { NewCourse } from "~/types/course";

type Input = Omit<NewCourse, "createdAt" | "updatedAt">;

export async function createCourse(data: Input) {
  return await db.insert(courses).values(data);
}
```

## Pattern route complète

```tsx
import { z } from "zod";
import { redirect, useFetcher } from "react-router";
import { auth } from "~/server/lib/auth.server";
import { createX } from "~/server/actions/x/create.actions.server";

const schema = z.object({ ... });

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw redirect("/auth");
  return { user: session.user };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: parsed.error.flatten() };
  return await createX(parsed.data);
}

export default function Page() {
  const fetcher = useFetcher();
  return <form onSubmit={...}>...</form>;
}
```

## Commandes utiles

```bash
pnpm dev           # Serveur dev
pnpm db:generate   # Générer migrations
pnpm db:migrate    # Appliquer migrations
pnpm db:studio     # Interface DB
```
