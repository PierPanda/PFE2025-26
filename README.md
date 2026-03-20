# Maestroo

Plateforme de mise en relation entre enseignants et apprenants pour des cours de musique. Maestroo permet aux professeurs de publier leurs disponibilités et aux élèves de réserver des créneaux selon leurs besoins.

## Stack technique

| Catégorie | Technologie |
|-----------|-------------|
| Framework | React Router v7 (SSR) |
| UI | HeroUI + Tailwind CSS v4 |
| Base de données | PostgreSQL + Drizzle ORM |
| Authentification | Better Auth |
| Validation | Zod v4 |
| State management | TanStack Query |
| Langage | TypeScript (strict) |
| Bundler | Vite |
| Package manager | pnpm |
| Linter / Formatter | oxlint + oxfmt |
| Tests | Vitest |
| Git hooks | Husky + lint-staged |

## Prérequis

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose (pour PostgreSQL)

## Installation

```bash
# Cloner le repository
git clone https://github.com/PierPanda/PFE2025-26.git
cd PFE2025-26

# Installer les dépendances
pnpm install

# Lancer PostgreSQL avec Docker
docker-compose up -d

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Appliquer le schéma à la base de données
pnpm "db push"

# (Optionnel) Seed la base de données avec des données de test
pnpm "db seed"
```

## Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet (basé sur `.env.example`) :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://user:password@localhost:5432/maestroo` |
| `BETTER_AUTH_SECRET` | Clé secrète pour Better Auth (min. 32 caractères) | `votre-cle-secrete-aleatoire` |
| `BETTER_AUTH_URL` | URL de base de l'application | `http://localhost:5173` |

## Développement

```bash
# Lancer le serveur de développement (SSR + HMR)
pnpm dev
```

L'application sera disponible sur `http://localhost:5173`.

## Scripts disponibles

| Script | Description |
|--------|-------------|
| `pnpm dev` | Serveur de développement |
| `pnpm build` | Build de production |
| `pnpm start` | Serveur de production |
| `pnpm typecheck` | Génère les types routes puis vérifie TypeScript |
| `pnpm lint` | Linter (oxlint) avec auto-fix |
| `pnpm "lint check"` | Linter sans auto-fix (CI) |
| `pnpm format` | Formatter (oxfmt) |
| `pnpm test` | Tests interactifs (vitest) |
| `pnpm "test run"` | Tests en une passe (CI) |
| `pnpm "test coverage"` | Tests avec couverture |
| `pnpm "db generate"` | Générer les migrations Drizzle |
| `pnpm "db migrate"` | Appliquer les migrations |
| `pnpm "db push"` | Push le schéma directement (dev) |
| `pnpm "db studio"` | Interface Drizzle Studio |
| `pnpm "db seed"` | Seed la base de données |
| `pnpm "db reset"` | Reset et re-seed la base |

## Architecture

### Principes

- **SSR-first** : Le rendu côté serveur est activé par défaut (`ssr: true`)
- **Routing impératif** : Les routes sont définies dans `app/routes.ts` (pas de file-system routing)
- **Séparation stricte** : Le code serveur vit dans `app/server/`, la logique métier dans `app/services/`
- **Validation centralisée** : Tous les schémas Zod sont dans `app/lib/validation.ts`

### Flux de données

```
Client Request
     ↓
Route (loader/action)
     ↓
Service (logique métier)
     ↓
Drizzle ORM → PostgreSQL
```

## Structure du projet

```
app/
├── auth.server.ts              # Configuration Better Auth
├── root.tsx                    # Layout racine + providers
├── routes.ts                   # Configuration des routes (imperative routing)
├── lib/
│   ├── auth-client.ts          # Client auth (côté client)
│   ├── constant.ts             # Constantes partagées (catégories, niveaux)
│   ├── utils.ts                # Utilitaires (cn helper, etc.)
│   └── validation.ts           # Schémas Zod centralisés
├── routes/
│   ├── _api/                   # Routes API (loader/action, pas de JSX)
│   │   ├── auth/route.ts       # Endpoints Better Auth
│   │   ├── courses/route.ts    # CRUD courses
│   │   ├── teachers/route.ts   # CRUD teachers
│   │   ├── learners/route.ts   # CRUD learners
│   │   ├── availabilities/     # CRUD disponibilités
│   │   └── stats/              # Statistiques
│   ├── layouts/                # Layouts partagés
│   │   ├── auth-layout.tsx
│   │   ├── public-layout.tsx
│   │   ├── admin-layout.tsx
│   │   └── teacher-layout.tsx
│   └── pages/                  # Pages UI
│       ├── auth/               # Login, register
│       ├── courses/            # Liste et détail des cours
│       ├── dashboard/          # Tableau de bord
│       ├── profile/            # Profil utilisateur
│       └── admin/              # Administration
├── server/
│   ├── lib/
│   │   └── db/                 # Drizzle ORM (schema, client)
│   └── utils/
│       ├── authentify-user.server.ts  # Helper auth
│       ├── check-permission.server.ts # Vérification permissions
│       └── env.server.ts              # Variables d'environnement
├── services/                   # Logique métier (un fichier par opération)
│   ├── courses/
│   │   ├── create-course.ts
│   │   ├── get-course.ts
│   │   ├── get-courses.ts
│   │   ├── update-course.ts
│   │   └── delete-course.ts
│   ├── teachers/
│   ├── learners/
│   ├── availabilities/
│   └── stats/
├── types/                      # Types TypeScript partagés
├── components/                 # Composants React réutilisables
└── hooks/                      # Custom hooks

drizzle/
├── seed.ts                     # Script de seed
├── seed.config.ts              # Configuration du seed
└── *.sql                       # Fichiers de migration

tests/
└── *.test.ts                   # Tests unitaires
```

## Conventions

### Nommage des fichiers

- **kebab-case** pour tous les fichiers et dossiers : `create-course.ts`, `auth-layout.tsx`
- **`.server.ts`** uniquement pour le code qui ne peut pas tourner côté client (auth, env)
- **Pas de `.server.ts`** sur les services (ils sont importés côté serveur seulement)

### Authentification

Utiliser `authentifyUser` dans chaque loader/action protégé :

```tsx
import { authentifyUser } from "~/server/utils/authentify-user.server";

// Avec redirection (pages)
export async function loader({ request }: Route.LoaderArgs) {
  const session = await authentifyUser(request, { redirectTo: "/auth" });
  return { user: session.user };
}

// Sans redirection — retourne 401 (API routes)
export async function action({ request }: Route.ActionArgs) {
  const session = await authentifyUser(request);
  // ...
}
```

### Validation

Schémas centralisés dans `app/lib/validation.ts` :

```tsx
import { createCourseSchema, validateFormData } from "~/lib/validation";

export async function action({ request }: Route.ActionArgs) {
  const data = await validateFormData(request, createCourseSchema);
  // data est typé automatiquement
}
```

### Routes API (`routes/_api/`)

- Extension `.ts` (pas de JSX)
- `loader` pour GET, `action` pour POST/PUT/DELETE

```tsx
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

### Routes Pages (`routes/pages/`)

Toujours utiliser les types auto-générés `Route.LoaderArgs` / `Route.ActionArgs` :

```tsx
// app/routes/pages/profile/page.tsx
import type { Route } from './+types/page';

export async function loader({ request }: Route.LoaderArgs) {
  const session = await authentifyUser(request, { redirectTo: '/auth' });
  return { user: session.user };
}

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data?.user ? 'Profil | Maestroo' : 'Maestroo' }];
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  // ...
}
```

### Commits (Angular Convention)

Format : `type(scope): message`

**Types** : `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`

**Exemples** :
- `feat(courses): add course filtering by category`
- `fix(auth): redirect to login on expired session`
- `refactor(services): extract validation helpers`
- `chore(deps): upgrade drizzle-orm to v0.45.1`

**Règles** :
- Message < 50 caractères
- Mode impératif ("add" pas "added")
- Pas de majuscule au début
- Pas de point final

## Tests

```bash
# Lancer les tests en mode watch
pnpm test

# Lancer les tests une fois (CI)
pnpm "test run"

# Avec couverture
pnpm "test coverage"
```

Les tests sont colocalisés avec le code dans le dossier `tests/`.

## Qualité de code

| Outil | Usage |
|-------|-------|
| **oxlint** | Linting rapide (pre-commit) |
| **oxfmt** | Formatage du code |
| **TypeScript** | Mode strict activé |
| **Husky** | Git hooks |
| **lint-staged** | Lint uniquement les fichiers modifiés |

### Pre-commit hooks

À chaque commit, les fichiers `.ts` et `.tsx` modifiés sont automatiquement :
1. Lintés avec oxlint (avec auto-fix)
2. Formatés avec oxfmt

## Contribution

1. Créer une branche depuis `main` : `git checkout -b feat/ma-feature`
2. Faire vos modifications
3. Vérifier le code : `pnpm typecheck && pnpm lint && pnpm test`
4. Commiter en suivant la convention Angular
5. Ouvrir une Pull Request vers `main`

## Licence

Projet privé - ECV Digital 2025
