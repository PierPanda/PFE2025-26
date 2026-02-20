# Instructions Copilot - Projet Maestro

## Stack technique

- **Framework** : React Router v7 (mode SSR)
- **UI** : HeroUI (basé sur NextUI)
- **Base de données** : PostgreSQL avec Drizzle ORM
- **Authentification** : Better Auth
- **Validation** : Zod
- **Langage** : TypeScript

---

## Conventions de fichiers

### Fichiers serveur (`.server.ts`)

Tout fichier contenant du code serveur doit être suffixé avec `.server.ts` :

```
✅ db/index.server.ts
✅ auth.server.ts
✅ create.actions.server.ts
✅ env.server.ts

❌ db/index.ts (si contient accès DB)
❌ auth.ts (si contient secrets)
```

### Quand utiliser `.server.ts`

- Accès base de données (Drizzle)
- Variables d'environnement (`process.env`)
- Secrets et clés API
- Actions serveur (mutations)

---

## Structure des routes React Router

```tsx
// Imports serveur OK dans loader/action
import { auth } from "~/server/lib/auth.server";
import { db } from "~/server/lib/db/index.server";

// Loader - données initiales
export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw redirect("/auth");
  return { user: session.user };
}

// Action - mutations (POST, PUT, DELETE)
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  // Validation et traitement
  return { success: true };
}

// Composant - PAS d'import .server.ts
export default function Page() {
  return <div>...</div>;
}
```

---

## Types Drizzle

### Définir les types dans `/types`

```tsx
// app/types/course.ts
import { courses } from "~/server/lib/db/schema-definition/courses";

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
```

### Utiliser dans les actions

```tsx
import type { NewCourse } from "~/types/course";

type CreateInput = Omit<NewCourse, "createdAt" | "updatedAt">;

export async function createCourse(data: CreateInput) {
  // ...
}
```

---

## Actions serveur

### Structure d'une action

```tsx
// app/server/actions/course/create.actions.server.ts
import { sql } from "drizzle-orm";
import { db } from "~/server/lib/db/index.server";
import { courses } from "~/server/lib/db/schema";
import type { NewCourse } from "~/types/course";

type CreateCourseInput = Omit<NewCourse, "createdAt" | "updatedAt">;

export async function createCourse(data: CreateCourseInput) {
  try {
    const result = await db.insert(courses).values({
      ...data,
      createdAt: sql`NOW()`,
      updatedAt: sql`NOW()`,
    });
    return { success: true, course: result };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, error: "Erreur lors de la création." };
  }
}
```

---

## Validation Zod

### Schéma dans le fichier de route

```tsx
import { z } from "zod";
import { categoryValues, levelValues } from "~/types/course";

export const createCourseSchema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  duration: z.coerce.number().min(1),
  level: z.enum(levelValues),
  price: z.coerce.number().min(0).transform((v) => v.toString()),
  category: z.enum(categoryValues),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
```

---

## Formulaires

### Avec useFetcher (sans navigation)

```tsx
import { useFetcher } from "react-router";

export default function Page() {
  const fetcher = useFetcher();

  const handleSubmit = (data: FormData) => {
    fetcher.submit(data, { method: "post" });
  };

  return (
    <>
      {fetcher.data?.success && <p>Succès!</p>}
      {fetcher.data?.error && <p>{fetcher.data.error}</p>}
    </>
  );
}
```

---

## Arborescence projet

```
app/
├── routes/           # Pages et routes
├── server/
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.server.ts
│   │   │   └── schema-definition/
│   │   └── auth.server.ts
│   ├── actions/      # Actions serveur (.server.ts)
│   └── utils/
│       └── env.server.ts
├── types/            # Types inférés Drizzle
└── components/       # Composants UI
```

---

## Règles importantes

1. **Ne jamais** importer de fichiers `.server.ts` dans les composants React
2. **Toujours** utiliser `$inferSelect` et `$inferInsert` pour les types Drizzle
3. **Toujours** suffixer les fichiers serveur avec `.server.ts`
4. **Utiliser** les `loader` pour charger les données
5. **Utiliser** les `action` pour les mutations
6. **Valider** avec Zod avant d'appeler les actions serveur
7. **Transformer** les types si nécessaire (ex: `price` number → string pour DB)

---

## Exemples de code

### Route complète

```tsx
// app/routes/course/create.tsx
import { z } from "zod";
import { redirect, useFetcher } from "react-router";
import { auth } from "~/server/lib/auth.server";
import { createCourse } from "~/server/actions/course/create.actions.server";
import { levelValues, categoryValues } from "~/types/course";
import type { Route } from "./+types/create";

const schema = z.object({
  title: z.string().min(1),
  level: z.enum(levelValues),
  category: z.enum(categoryValues),
});

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw redirect("/auth");
  return { user: session.user };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, errors: parsed.error.flatten() };
  return await createCourse(parsed.data);
}

export default function CreateCourse() {
  const fetcher = useFetcher();
  // ...
}
```
