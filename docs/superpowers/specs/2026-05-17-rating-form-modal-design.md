# Spec : Formulaire de création/édition d'avis pour les apprenants

**Date :** 2026-05-17
**Branche :** loicstr56/pfe-123-crud-services-ratings-route-api

---

## Contexte

Les apprenants peuvent réserver des cours. Quand une réservation passe au statut `completed` (géré par le cron job `complete-expired-bookings`), l'API `/api/ratings` autorise déjà la création d'un avis. Il manque seulement le point d'entrée UI pour déclencher cette action depuis le profil.

L'infrastructure backend est déjà en place :

- Table `ratings` : `id`, `courseId`, `learnerId`, `title`, `description`, `rate`
- Contrainte d'unicité `(learnerId, courseId)` — un seul avis par apprenant par cours
- `POST /api/ratings` — crée un avis (vérifie booking complété + absence d'avis existant)
- `PUT /api/ratings?id=...` — modifie un avis existant

---

## Périmètre

Ajouter dans la page profil (`/profile`) un bouton "Rédiger un avis" sur chaque ligne de réservation `completed` côté apprenant. Si l'apprenant a déjà noté ce cours, le bouton affiche "Modifier mon avis". Les deux ouvrent un modal de formulaire.

---

## Architecture & Data Flow

La relation Drizzle entre `bookings` et `ratings` n'existe pas encore. On l'ajoute via les champs composites `(courseId, learnerId)` — le lien naturel entre une réservation et son avis. Drizzle supporte les relations multi-champs :

```ts
// bookings-relations.ts
rating: one(ratings, {
  fields: [bookings.courseId, bookings.learnerId],
  references: [ratings.courseId, ratings.learnerId],
})
```

Ensuite, `bookingRelations` dans `get-bookings.ts` inclut `rating: true`, ce qui fait que chaque booking retourné porte déjà son `rating: DbRating | null`. Zéro query supplémentaire, zéro matching JS côté client.

```
bookings-relations.ts
  └── + relation rating (composite courseId + learnerId)

get-bookings.ts
  └── bookingRelations += { rating: true }

BookingWithRelations (types.ts)
  └── + rating: DbRating | null   (inféré automatiquement par Drizzle)

BookingsTable (composant existant, étendu)
  ├── onglet "Terminé" ajouté côté apprenant
  ├── colonne "Avis" ajoutée (hidden quand isTeacher=true)
  └── pour chaque ligne status='completed':
        ├── booking.rating === null → bouton "Rédiger un avis"
        └── booking.rating !== null → bouton "Modifier mon avis"

RatingFormModal (nouveau composant)
  ├── props: isOpen, onClose, courseId, courseTitle, existingRating?
  ├── champs: StarRatingInput (1-5), titre (requis), description (optionnelle)
  ├── POST /api/ratings     si création   (body JSON)
  └── PUT  /api/ratings?id= si édition    (body JSON)
```

Le loader du profil n'a rien à changer : `getBookingsByLearnerId` retourne déjà les ratings via la relation.

---

## Fichiers à modifier / créer

| Fichier | Action |
|---|---|
| `app/server/lib/db/schema-definition/bookings-relations.ts` | Ajouter relation `rating` (composite courseId + learnerId) |
| `app/services/bookings/get-bookings.ts` | Ajouter `rating: true` dans `bookingRelations` |
| `app/routes/pages/profile/bookings-table.tsx` | Filtre `completed`, colonne "Avis", intégration modal |
| `app/components/ratings/rating-form-modal.tsx` | **Nouveau** — modal formulaire |

---

## Détail des composants

### Relation Drizzle `bookings → rating`

Dans `bookings-relations.ts`, ajouter `rating: one(ratings, { fields: [bookings.courseId, bookings.learnerId], references: [ratings.courseId, ratings.learnerId] })`. Ajouter l'import de `ratings`.

Dans `get-bookings.ts`, ajouter `rating: true` dans la constante `bookingRelations`. Le type `BookingWithRelations` est inféré automatiquement par Drizzle via les relations déclarées.

### `RatingFormModal`

**Props :**

```ts
type RatingFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  existingRating?: {
    id: string;
    title: string;
    description?: string | null;
    rate: number;
  } | null;
};
```

**Champs :**

- `rate` : 5 étoiles cliquables (état local React, entiers 1–5). La `StarRating` existante est display-only ; ce composant gère son propre input étoile inline.
- `title` : `<Input>` HeroUI, requis, min 3 / max 100 caractères
- `description` : `<Textarea>` HeroUI, optionnelle, max 1000 caractères

**Soumission :**

- `useFetcher` sur `/api/ratings`
- Mode création : `fetcher.submit(body, { method: 'POST', encType: 'application/json', action: '/api/ratings' })`
- Mode édition : `fetcher.submit(body, { method: 'PUT', encType: 'application/json', action: \`/api/ratings?id=...\` })`
- On success : `addToast` succès + `onClose()` + `revalidator.revalidate()`
- On error : `addToast` danger avec le message serveur
- Bouton submit désactivé + spinner quand `fetcher.state === 'submitting'`

### `BookingsTable` — modifications

- Filtre `completed` ajouté dans `FILTERS` (affiché seulement si `!isTeacher`)
- Nouvelle colonne `TableColumn` "Avis" (rendue uniquement si `!isTeacher`)
- Un `useState` local `{ courseId, courseTitle, existingRating } | null` contrôle quel booking est en cours d'édition
- Pour les bookings `completed` : bouton "Rédiger un avis" ou "Modifier mon avis" selon `booking.rating`
- Le `RatingFormModal` est rendu une seule fois en dehors du tableau, contrôlé par cet état

---

## Règles métier (déjà gérées côté API)

- Un avis n'est possible que si le booking est `completed`
- Un seul avis par apprenant par cours (contrainte DB + vérification API)
- La note est un entier entre 1 et 5

---

## Ce qui n'est pas dans le scope

- Suppression d'un avis depuis le profil
- Affichage de la liste des avis reçus par un enseignant (feature séparée)
- Avis sur la page de détail du cours
