# React Router v7 - Guide et Conventions

## Conventions de nommage

### kebab-case obligatoire

Tous les fichiers doivent être nommés en kebab-case :

```
app/
├── services/
│   └── courses/
│       └── create-course.server.ts    ✅
│       └── createCourse.server.ts     ❌
├── components/
│   └── auth/
│       └── user-profile.tsx           ✅
│       └── UserProfile.tsx            ❌
├── hooks/
│   └── use-auth.ts                    ✅
│   └── useAuth.ts                     ❌
```

### Suffixe `.server.ts`

Les fichiers contenant du code serveur **doivent** être suffixés avec `.server.ts` :

```
app/
├── auth.server.ts                     ✅ Config Better Auth
├── server/
│   └── utils/
│       └── authentify-user.server.ts  ✅ Helper auth
├── services/
│   └── courses/
│       └── create-course.server.ts    ✅ Service métier
```

### Quand utiliser `.server.ts`

- Accès à la base de données (Drizzle)
- Variables d'environnement serveur (`process.env`)
- Secrets et clés API
- Logique métier côté serveur

---

## Structure des routes

### Organisation des dossiers

```
app/routes/
├── _api/                    # Routes API (loader/action uniquement)
│   ├── auth/route.tsx       # Endpoints Better Auth
│   ├── courses/route.tsx    # CRUD courses
│   └── teachers/route.tsx   # CRUD teachers
├── layouts/                 # Layouts simples (PAS d'auth)
│   ├── auth-layout.tsx
│   └── public-layout.tsx
└── pages/                   # Pages UI
    ├── auth/
    │   ├── page.tsx
    │   ├── login-form.tsx
    │   └── sign-up-form.tsx
    ├── courses/
    │   ├── create.tsx
    │   └── course-form.tsx
    └── dashboard/
        └── page.tsx
```

### Configuration (`routes.ts`)

```tsx
import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  // Routes API
  route("/api/auth/*", "routes/_api/auth/route.tsx"),
  route("/api/courses", "routes/_api/courses/route.tsx"),
  route("/api/teachers", "routes/_api/teachers/route.tsx"),

  // Pages publiques
  layout("routes/layouts/public-layout.tsx", [
    route("/auth", "routes/pages/auth/page.tsx"),
  ]),

  // Pages authentifiées
  layout("routes/layouts/auth-layout.tsx", [
    index("routes/pages/dashboard/page.tsx"),
    route("/courses/create", "routes/pages/courses/create.tsx"),
  ]),
] satisfies RouteConfig;
```

---

## Authentification

### Helper `authentifyUser`

**Toujours** utiliser `authentifyUser` dans les loaders protégés :

```tsx
import { authentifyUser } from "~/server/utils/authentify-user.server";
import type { Route } from "./+types/page";

export async function loader({ request }: Route.LoaderArgs) {
  // Avec redirection automatique
  const session = await authentifyUser(request, { redirectTo: "/auth" });
  return { user: session.user };
}
```

### Dans les actions

```tsx
export async function action({ request }: Route.ActionArgs) {
  // Sans redirection (retourne 401)
  const session = await authentifyUser(request);
  // ...
}
```

### Ce qu'il ne faut PAS faire

```tsx
// ❌ Auth dans les layouts
export function AuthLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" />;
}

// ❌ Redirections côté client
return <Navigate to="/auth" replace />;

// ❌ Vérification auth directe dans loader
const session = await auth.api.getSession({ headers: request.headers });
if (!session) throw redirect("/auth");
```

---

## Routes API

### Structure type

```tsx
// app/routes/_api/courses/route.tsx
import { data, type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
import { authentifyUser } from "~/server/utils/authentify-user.server";
import { createCourseSchema, validateJsonBody } from "~/lib/validation";
import { createCourse } from "~/services/courses/create-course.server";
import { getCourses } from "~/services/courses/get-courses.server";

// GET - Lecture (peut être publique)
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  return getCourses(category);
}

// POST/PUT/DELETE - Mutations (auth obligatoire)
export async function action({ request }: ActionFunctionArgs) {
  await authentifyUser(request);

  const method = request.method.toUpperCase();

  switch (method) {
    case "POST": {
      const body = await validateJsonBody(request, createCourseSchema);
      return createCourse(body);
    }
    // ...
  }
}
```

---

## Validation centralisée

### Fichier `lib/validation.ts`

Tous les schémas Zod sont centralisés :

```tsx
// app/lib/validation.ts
import { z } from "zod";
import { categoryValues, levelValues } from "~/server/lib/db/schema-definition/courses";

// Schémas
export const courseFormSchema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  description: z.string().min(1, "La description est requise."),
  duration: z.coerce.number().min(1, "La durée est requise."),
  level: z.enum(levelValues),
  price: z.coerce.number().min(0).transform((val) => val.toString()),
  category: z.enum(categoryValues),
});

export const createCourseSchema = courseFormSchema.extend({
  id: z.string().uuid(),
  teacherId: z.string().min(1),
  isPublished: z.coerce.boolean().default(false),
});

// Types inférés
export type CourseFormInput = z.infer<typeof courseFormSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;

// Helpers de validation
export function validateSearchParams<T extends z.ZodTypeAny>(url: URL, schema: T): z.infer<T>;
export async function validateFormData<T extends z.ZodTypeAny>(request: Request, schema: T): Promise<z.infer<T>>;
export async function validateJsonBody<T extends z.ZodTypeAny>(request: Request, schema: T): Promise<z.infer<T>>;
export function validateParams<T extends z.ZodTypeAny>(params: Record<string, string | undefined>, schema: T): z.infer<T>;
```

### Utilisation

```tsx
import { createCourseSchema, validateFormData } from "~/lib/validation";

export async function action({ request }: Route.ActionArgs) {
  const data = await validateFormData(request, createCourseSchema);
  // data est typé automatiquement
  return createCourse(data);
}
```

---

## TanStack Query

### Configuration

```tsx
// app/root.tsx ou layout
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
```

### Appels API côté client

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Lecture
export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: () => fetch("/api/courses").then((r) => r.json()),
  });
}

// Mutation
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCourseInput) =>
      fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
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

## Layouts

### Layouts simples (sans auth)

```tsx
// app/routes/layouts/auth-layout.tsx
import { Outlet } from "react-router";

export default function AuthLayout() {
  // PAS de vérification auth ici
  // L'auth est gérée dans chaque loader avec authentifyUser
  return <Outlet />;
}
```

---

## Résumé des règles

| Règle | Description |
|-------|-------------|
| **kebab-case** | Tous les fichiers en kebab-case |
| **`.server.ts`** | Code serveur uniquement |
| **`authentifyUser`** | Dans chaque loader protégé |
| **Validation** | Centralisée dans `lib/validation.ts` |
| **Routes API** | Dans `routes/_api/` avec loader/action |
| **TanStack Query** | Pour les appels API côté client |
| **Layouts** | Simples, sans vérification auth |
| **Redirections** | Côté serveur uniquement |

---

## Arborescence complète

```
app/
├── auth.server.ts                    # Config Better Auth
├── root.tsx                          # Layout racine + ErrorBoundary
├── routes.ts                         # Configuration des routes
├── lib/
│   ├── auth-client.ts                # Client auth
│   └── validation.ts                 # Schémas Zod centralisés
├── routes/
│   ├── _api/                         # Routes API
│   │   ├── auth/route.tsx
│   │   ├── courses/route.tsx
│   │   └── teachers/route.tsx
│   ├── layouts/                      # Layouts (kebab-case)
│   │   ├── auth-layout.tsx
│   │   └── public-layout.tsx
│   └── pages/                        # Pages UI (kebab-case)
│       ├── auth/
│       │   ├── page.tsx
│       │   ├── login-form.tsx
│       │   └── sign-up-form.tsx
│       ├── courses/
│       │   ├── create.tsx
│       │   ├── course-form.tsx
│       │   └── course-validation.tsx
│       └── dashboard/
│           └── page.tsx
├── server/
│   ├── lib/
│   │   └── db/
│   │       ├── index.server.ts
│   │       └── schema-definition/
│   └── utils/
│       ├── authentify-user.server.ts
│       └── env.server.ts
├── services/                         # Services métier (kebab-case)
│   ├── courses/
│   │   ├── create-course.server.ts
│   │   ├── get-course.server.ts
│   │   └── get-courses.server.ts
│   └── teachers/
│       ├── create-teacher.server.ts
│       └── get-teacher.server.ts
├── types/
│   ├── course.ts
│   ├── teacher.ts
│   └── api-route.ts
├── components/
│   └── auth/
│       └── user-profile.tsx
└── hooks/
    └── use-auth.ts
```
