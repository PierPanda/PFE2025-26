# React Router v7 - Guide et Conventions

## Conventions de fichiers serveur/client

### Suffixe `.server.ts`

Les fichiers contenant du code serveur uniquement **doivent** être suffixés avec `.server.ts`. Cela indique à Vite de les exclure du bundle client.

```
app/
├── server/
│   ├── lib/
│   │   ├── db/
│   │   │   └── index.server.ts    ✅ Accès base de données
│   │   └── auth.server.ts          ✅ Configuration auth
│   └── actions/
│       └── course/
│           └── create.actions.server.ts  ✅ Actions serveur
```

### Quand utiliser `.server.ts`

- Accès à la base de données (`drizzle`, `prisma`, etc.)
- Variables d'environnement serveur (`process.env`)
- Secrets et clés API
- Logique métier côté serveur

### Erreur courante

```
Server-only module referenced by client
'~/server/lib/db/index.server' imported by 'app/routes/...'
```

**Cause** : Un fichier client importe directement ou indirectement un module serveur.

**Solution** : Suffixer le fichier avec `.server.ts` et s'assurer que les imports serveur ne sont utilisés que dans les `loader` et `action`.

---

## Structure des routes

### Fichier de route type

```tsx
// app/routes/example.tsx

import type { Route } from "./+types/example";

// LOADER - S'exécute côté serveur avant le rendu
export async function loader({ request }: Route.LoaderArgs) {
  // ✅ Peut importer des modules .server.ts
  // ✅ Accès à la base de données
  // ✅ Vérification de session
  return { data: "..." };
}

// ACTION - S'exécute côté serveur lors d'une soumission de formulaire
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  // ✅ Peut importer des modules .server.ts
  // ✅ Mutations base de données
  return { success: true };
}

// COMPOSANT - S'exécute côté client ET serveur (SSR)
export default function Example() {
  // ❌ NE PAS importer de modules .server.ts ici
  // ❌ NE PAS appeler de fonctions serveur directement
  return <div>...</div>;
}
```

---

## Loaders

### Utilisation

Le `loader` s'exécute côté serveur avant le rendu du composant.

```tsx
import { auth } from "~/server/lib/auth.server";
import { redirect } from "react-router";
import type { Route } from "./+types/page";

export async function loader({ request }: Route.LoaderArgs) {
  // Vérifier l'authentification
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    throw redirect("/auth");
  }

  // Retourner les données pour le composant
  return { user: session.user };
}
```

### Accéder aux données du loader

```tsx
import { useLoaderData } from "react-router";

export default function Page() {
  const { user } = useLoaderData<typeof loader>();
  return <div>Bonjour {user.name}</div>;
}
```

---

## Actions

### Utilisation basique

```tsx
import { createCourse } from "~/server/actions/course/create.actions.server";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  // Validation
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten() };
  }

  // Appel de l'action serveur
  const result = await createCourse(parsed.data);
  return result;
}
```

### Soumettre un formulaire

#### Méthode 1 : Form natif React Router

```tsx
import { Form } from "react-router";

export default function Page() {
  return (
    <Form method="post">
      <input name="title" />
      <button type="submit">Envoyer</button>
    </Form>
  );
}
```

#### Méthode 2 : useFetcher (sans navigation)

```tsx
import { useFetcher } from "react-router";

export default function Page() {
  const fetcher = useFetcher();

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("title", "Mon titre");
    fetcher.submit(formData, { method: "post" });
  };

  return (
    <div>
      <button onClick={handleSubmit}>Envoyer</button>
      {fetcher.data?.success && <p>Succès!</p>}
      {fetcher.data?.error && <p>{fetcher.data.error}</p>}
    </div>
  );
}
```

---

## Types inférés depuis Drizzle

### Définir les types dans `/types`

```tsx
// app/types/course.ts
import { courses } from "~/server/lib/db/schema-definition/courses";

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
```

### Utiliser dans les actions serveur

```tsx
// app/server/actions/course/create.actions.server.ts
import type { NewCourse } from "~/types/course";

type CreateCourseInput = Omit<NewCourse, "createdAt" | "updatedAt">;

export async function createCourse(data: CreateCourseInput) {
  // ...
}
```

---

## Validation avec Zod

### Schéma dans le fichier de route

```tsx
// app/routes/course/create.tsx
import { z } from "zod";
import { categoryValues, levelValues } from "~/types/course";

export const createCourseSchema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  description: z.string().min(1, "La description est requise."),
  duration: z.coerce.number().min(1, "La durée est requise."),
  level: z.enum(levelValues),
  price: z.coerce
    .number()
    .min(0, "Le prix doit être positif.")
    .transform((val) => val.toString()), // Transformer en string pour la DB
  category: z.enum(categoryValues),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
```

---

## Résumé des règles

| Règle | Description |
|-------|-------------|
| `.server.ts` | Fichiers avec accès DB, env vars, secrets |
| `loader` | Chargement de données côté serveur |
| `action` | Mutations côté serveur (POST, PUT, DELETE) |
| Composant | Pas d'import direct de modules serveur |
| Types | Inférer depuis Drizzle avec `$inferSelect`/`$inferInsert` |
| Validation | Zod dans le fichier de route si utilisé client + serveur |

---

## Arborescence recommandée

```
app/
├── routes/
│   ├── course/
│   │   ├── create.tsx        # Route + schema Zod
│   │   ├── CourseForm.tsx    # Composant formulaire
│   │   └── CourseValidation.tsx
│   └── auth/
│       └── page.tsx
├── server/
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.server.ts
│   │   │   └── schema-definition/
│   │   └── auth.server.ts
│   ├── actions/
│   │   ├── course/
│   │   │   ├── create.actions.server.ts
│   │   │   ├── update.actions.server.ts
│   │   │   └── get.actions.server.ts
│   │   └── teacher/
│   └── utils/
│       └── env.server.ts
├── types/
│   ├── course.ts
│   └── teacher.ts
└── components/
    └── ui/
```
