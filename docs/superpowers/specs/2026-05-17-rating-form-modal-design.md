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

```
profile/page.tsx (loader)
  ├── getRatingsByLearner(learner.id)   ← nouvelle fonction service
  └── retourne learnerRatings: Rating[]

BookingsTable (composant existant, étendu)
  ├── prop learnerRatings: Rating[]     ← nouvelle prop (optionnelle, absente vue teacher)
  ├── onglet "Terminé" ajouté côté apprenant
  ├── colonne "Avis" ajoutée (hidden quand isTeacher=true)
  └── pour chaque ligne status='completed':
        ├── pas de rating → bouton "Rédiger un avis"
        └── rating existant → bouton "Modifier mon avis"

RatingFormModal (nouveau composant)
  ├── props: isOpen, onClose, courseId, courseTitle, existingRating?
  ├── champs: StarRatingInput (1-5), titre (requis), description (optionnelle)
  ├── POST /api/ratings     si création   (body JSON)
  └── PUT  /api/ratings?id= si édition    (body JSON)
```

---

## Fichiers à modifier / créer

| Fichier | Action |
|---|---|
| `app/services/ratings/get-ratings.ts` | Ajouter `getRatingsByLearner(learnerId)` |
| `app/routes/pages/profile/page.tsx` | Appeler `getRatingsByLearner` dans le loader, passer `learnerRatings` en prop à `BookingsTable` |
| `app/routes/pages/profile/bookings-table.tsx` | Prop `learnerRatings`, filtre `completed`, colonne "Avis", intégration modal |
| `app/components/ratings/rating-form-modal.tsx` | **Nouveau** — modal formulaire |

---

## Détail des composants

### `getRatingsByLearner(learnerId: string)`

Requête Drizzle sur la table `ratings` filtrée par `learnerId`. Retourne le pattern service standard `{ success: true, ratings: Rating[] }`.

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
- Mode création : `fetch.submit(body, { method: 'POST', encType: 'application/json', action: '/api/ratings' })`
- Mode édition : `fetch.submit(body, { method: 'PUT', encType: 'application/json', action: '/api/ratings?id=...'})`
- On success : `addToast` succès + `onClose()` + `revalidator.revalidate()`
- On error : `addToast` danger avec le message serveur

**État du bouton submit :**
- Désactivé + spinner quand `fetcher.state === 'submitting'`

### `BookingsTable` — modifications

- Nouvelle prop : `learnerRatings?: Rating[]`
- Filtre `completed` ajouté dans `FILTERS` (visible seulement si `!isTeacher`)
- Nouvelle colonne `TableColumn` "Avis" (rendue uniquement si `!isTeacher`)
- Dans `TableBody`, pour les bookings `completed` : afficher le bouton via un `useState` local `{ courseId, courseTitle, existingRating }` qui contrôle l'ouverture du modal
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
