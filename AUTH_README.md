# Configuration de l'authentification

Ce projet utilise [Better Auth](https://www.better-auth.com/) avec [Neon](https://neon.com/) comme base de données.

## Configuration requise

### 1. Variables d'environnement

Mettez à jour votre fichier `.env` avec vos vraies valeurs :

```env
# Better Auth
BETTER_AUTH_SECRET=your-secret-key-here-change-this-in-production
BETTER_AUTH_URL=http://localhost:5173

# Neon Database
DATABASE_URL=postgresql://username:password@hostname/dbname?sslmode=require
```

### 2. Configuration de la base de données Neon

1. Créez un compte sur [Neon](https://neon.com/)
2. Créez une nouvelle base de données
3. Copiez l'URL de connexion dans votre fichier `.env`

### 3. Migration de la base de données

Générez et exécutez les migrations :

```bash
pnpm db:generate
pnpm db:migrate
```

## Utilisation

### Hooks disponibles

```tsx
import { useAuth } from "~/hooks/useAuth";

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Chargement...</div>;
  if (!isAuthenticated) return <div>Non connecté</div>;

  return <div>Bonjour {user.name}!</div>;
}
```

### Composants d'authentification

- `LoginForm` - Formulaire de connexion
- `SignUpForm` - Formulaire d'inscription
- `UserProfile` - Profil utilisateur avec déconnexion

### Actions d'authentification

```tsx
import { signIn, signUp, signOut } from "~/lib/auth/client";

// Connexion
await signIn.email({
  email: "user@example.com",
  password: "password",
  callbackURL: "/",
});

// Inscription
await signUp.email({
  name: "John Doe",
  email: "user@example.com",
  password: "password",
  callbackURL: "/",
});

// Déconnexion
await signOut();
```

## Routes

- `/auth` - Page d'authentification (connexion/inscription)
- `/api/auth/*` - Endpoints API pour l'authentification

## Scripts de base de données

- `pnpm db:generate` - Génère les migrations
- `pnpm db:migrate` - Exécute les migrations
- `pnpm db:push` - Pousse les changements directement (dev)
- `pnpm db:studio` - Ouvre Drizzle Studio

## Sécurité

- Changez `BETTER_AUTH_SECRET` en production
- Utilisez HTTPS en production
- Configurez les CORS appropriés
