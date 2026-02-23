# Instructions Copilot - Projet Maestro

## Stack technique

- **Framework** : React Router v7 (mode SSR)
- **UI** : HeroUI (basé sur NextUI) + Tailwind CSS v4
- **Base de données** : PostgreSQL avec Drizzle ORM
- **Authentification** : Better Auth
- **Validation** : Zod (centralisée dans `lib/validation.ts`)
- **State management** : TanStack Query
- **Langage** : TypeScript

---

## Conventions de nommage

### kebab-case obligatoire

Tous les fichiers doivent être en kebab-case :

```
app/services/courses/create-course.server.ts
app/components/auth/user-profile.tsx
app/routes/pages/courses/course-form.tsx
app/hooks/use-auth.ts
```

### Fichiers serveur (`.server.ts`)

Tout fichier contenant du code serveur doit être suffixé avec `.server.ts` :

```
app/auth.server.ts
app/server/utils/authentify-user.server.ts
app/services/courses/create-course.server.ts
```

---

## Structure des routes

### Routes API (`routes/_api/`)

```tsx
// app/routes/_api/courses/route.tsx
import { authentifyUser } from "~/server/utils/authentify-user.server";
import { createCourseSchema, validateJsonBody } from "~/lib/validation";

// GET - Lecture
export async function loader({ request }: LoaderFunctionArgs) {
  // Pas d'auth nécessaire pour lecture publique
  return getCourses();
}

// POST/PUT/DELETE - Mutations
export async function action({ request }: ActionFunctionArgs) {
  await authentifyUser(request); // Auth obligatoire
  const data = await validateJsonBody(request, createCourseSchema);
  return createCourse(data);
}
```

### Pages (`routes/pages/`)

```tsx
// app/routes/pages/courses/create.tsx
import { authentifyUser } from "~/server/utils/authentify-user.server";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await authentifyUser(request, { redirectTo: "/auth" });
  return { user: session.user };
}

export default function CreateCourse() {
  // Composant React (pas d'import .server.ts)
}
```

---

## Authentification

### Helper `authentifyUser`

Utiliser dans **chaque loader** qui nécessite une auth :

```tsx
import { authentifyUser } from "~/server/utils/authentify-user.server";

// Avec redirection
const session = await authentifyUser(request, { redirectTo: "/auth" });

// Sans redirection (retourne 401)
const session = await authentifyUser(request);
```

### Ne PAS faire

- Auth dans les layouts
- `<Navigate />` ou `<Redirect />` côté client
- Vérification auth côté client uniquement

---

## Validation centralisée

### Fichier `lib/validation.ts`

```tsx
// Schémas
export const createCourseSchema = z.object({...});
export const updateCourseSchema = createCourseSchema.partial().extend({...});

// Types inférés
export type CreateCourseInput = z.infer<typeof createCourseSchema>;

// Helpers
export function validateSearchParams<T>(url: URL, schema: T);
export async function validateFormData<T>(request: Request, schema: T);
export async function validateJsonBody<T>(request: Request, schema: T);
export function validateParams<T>(params: Record<string, string>, schema: T);
```

### Utilisation

```tsx
import {
  createCourseSchema,
  validateFormData,
  type CreateCourseInput
} from "~/lib/validation";

export async function action({ request }: Route.ActionArgs) {
  const data = await validateFormData(request, createCourseSchema);
  // data est typé comme CreateCourseInput
}
```

---

## Types Drizzle

### Inférer depuis le schéma

```tsx
// app/types/course.ts
import { courses } from "~/server/lib/db/schema-definition/courses";

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
```

---

## TanStack Query

### Pour les appels API côté client

```tsx
import { useQuery, useMutation } from "@tanstack/react-query";

// Lecture
const { data } = useQuery({
  queryKey: ["courses"],
  queryFn: () => fetch("/api/courses").then(r => r.json()),
});

// Mutation
const mutation = useMutation({
  mutationFn: (data) => fetch("/api/courses", {
    method: "POST",
    body: JSON.stringify(data),
  }),
});
```

---

## Arborescence projet

```
app/
├── auth.server.ts              # Config Better Auth (racine app/)
├── lib/
│   ├── auth-client.ts          # Client auth
│   └── validation.ts           # Schémas Zod centralisés
├── routes/
│   ├── _api/                   # Routes API (loader/action)
│   │   ├── auth/route.tsx
│   │   ├── courses/route.tsx
│   │   └── teachers/route.tsx
│   ├── layouts/                # Layouts simples (pas d'auth)
│   └── pages/                  # Pages UI
├── server/
│   ├── lib/db/                 # Drizzle
│   └── utils/
│       └── authentify-user.server.ts
├── services/                   # Logique métier (kebab-case)
├── types/
├── components/
└── hooks/
```

---

## Règles importantes

1. **kebab-case** pour tous les noms de fichiers
2. **`.server.ts`** pour tout code serveur
3. **`authentifyUser`** dans chaque loader protégé
4. **Validation centralisée** dans `lib/validation.ts`
5. **Pas d'auth dans les layouts**
6. **Redirections côté serveur** uniquement
7. **TanStack Query** pour les appels API côté client
8. **Types Drizzle** inférés avec `$inferSelect`/`$inferInsert`
