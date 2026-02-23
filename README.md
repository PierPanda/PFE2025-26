# Maestro

Plateforme de mise en relation entre enseignants et apprenants pour des cours de musique.

## Stack technique

- **Framework**: React Router v7 (SSR)
- **UI**: HeroUI + Tailwind CSS v4
- **Base de données**: PostgreSQL + Drizzle ORM
- **Authentification**: Better Auth
- **Validation**: Zod
- **State management**: TanStack Query
- **Langage**: TypeScript

## Prérequis

- Node.js 20+
- pnpm
- Docker (pour PostgreSQL)

## Installation

```bash
# Installer les dépendances
pnpm install

# Lancer PostgreSQL avec Docker
docker-compose up -d

# Configurer les variables d'environnement
cp .env.example .env

# Appliquer les migrations
pnpm db:push

# (Optionnel) Seed la base de données
pnpm db:seed
```

## Développement

```bash
# Lancer le serveur de développement
pnpm dev
```

L'application sera disponible sur `http://localhost:5173`.

## Scripts disponibles

| Script | Description |
|--------|-------------|
| `pnpm dev` | Serveur de développement |
| `pnpm build` | Build de production |
| `pnpm start` | Serveur de production |
| `pnpm typecheck` | Vérification TypeScript |
| `pnpm lint` | Linter (oxlint) avec auto-fix |
| `pnpm lint:check` | Linter sans auto-fix |
| `pnpm test` | Tests (vitest) |
| `pnpm test:coverage` | Tests avec couverture |
| `pnpm db:generate` | Générer les migrations |
| `pnpm db:push` | Appliquer le schéma |
| `pnpm db:studio` | Interface Drizzle Studio |

## Structure du projet

```
app/
├── auth.server.ts              # Configuration Better Auth
├── lib/
│   ├── auth-client.ts          # Client auth (côté client)
│   └── validation.ts           # Schémas Zod centralisés
├── routes/
│   ├── _api/                   # Routes API
│   │   ├── auth/route.tsx      # Endpoints Better Auth
│   │   ├── courses/route.tsx   # CRUD courses
│   │   └── teachers/route.tsx  # CRUD teachers
│   ├── layouts/                # Layouts (kebab-case)
│   │   ├── auth-layout.tsx
│   │   └── public-layout.tsx
│   └── pages/                  # Pages UI
│       ├── auth/
│       ├── courses/
│       └── dashboard/
├── server/
│   ├── lib/db/                 # Drizzle ORM
│   └── utils/
│       ├── authentify-user.server.ts  # Helper auth
│       └── env.server.ts
├── services/                   # Services métier (kebab-case)
│   ├── courses/
│   └── teachers/
├── types/
│   └── api-route.ts            # Types API typés
├── components/
└── hooks/
```

## Conventions

### Nommage des fichiers

- **kebab-case** pour tous les fichiers : `create-course.server.ts`
- **`.server.ts`** pour le code serveur uniquement

### Authentification

Utiliser `authentifyUser` dans chaque loader :

```tsx
import { authentifyUser } from "~/server/utils/authentify-user.server";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await authentifyUser(request, { redirectTo: "/auth" });
  return { user: session.user };
}
```

### Validation

Schémas centralisés dans `app/lib/validation.ts` :

```tsx
import { createCourseSchema, validateFormData } from "~/lib/validation";

export async function action({ request }: Route.ActionArgs) {
  const data = await validateFormData(request, createCourseSchema);
  // ...
}
```

### Routes API

Structure loader/action pour les routes API :

```tsx
// GET → loader
export async function loader({ request }: LoaderFunctionArgs) {
  // Récupération de données
}

// POST/PUT/DELETE → action
export async function action({ request }: ActionFunctionArgs) {
  await authentifyUser(request);
  // Mutation
}
```

## Qualité de code

- **Linting**: oxlint (pre-commit)
- **Type checking**: TypeScript strict
- **Pre-commit hooks**: husky + lint-staged

## Licence

Projet privé - ECV Digital 2025
