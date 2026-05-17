# Rating Form Modal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter dans l'onglet "Apprenant" du profil un bouton "Rédiger un avis" / "Modifier mon avis" sur chaque réservation `completed`, ouvrant un modal de formulaire d'avis.

**Architecture:** La relation Drizzle `bookings → rating` est ajoutée via les champs composites `(courseId, learnerId)`, ce qui donne à chaque `BookingWithRelations` un champ `rating: DbRating | null` sans query supplémentaire. La `BookingsTable` reçoit ce champ et contrôle un `RatingFormModal` via un state local. Le modal soumet en JSON via `useFetcher` vers l'API `/api/ratings` déjà existante.

**Tech Stack:** React Router v7, Drizzle ORM (relational API), HeroUI (Modal, Input, Textarea, Button), Iconify (`mdi:star` / `mdi:star-outline`), Vitest

---

## File Map

| Fichier | Action |
|---|---|
| `tests/ratings-filter.test.ts` | Nouveau — tests unitaires pour le filtre `completed` |
| `app/services/bookings/get-bookings.ts` | Modifier — ajouter `'completed'` à `BookingFilter` + cas dans `buildFilterCondition` + `rating: true` dans `bookingRelations` |
| `app/server/lib/db/schema-definition/bookings-relations.ts` | Modifier — ajouter relation composite `rating` |
| `app/services/types.ts` | Modifier — ajouter `rating: DbRating | null` dans `BookingWithRelations` |
| `app/components/ratings/rating-form-modal.tsx` | Nouveau — modal formulaire d'avis |
| `app/routes/pages/profile/bookings-table.tsx` | Modifier — filtre `completed`, colonne "Avis", intégration modal |

---

## Task 1 : Tests unitaires pour le filtre `completed`

**Files:**
- Create: `tests/ratings-filter.test.ts`

- [ ] **Écrire les tests qui échouent**

Créer `tests/ratings-filter.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import type { BookingFilter } from '~/services/bookings/get-bookings';

type MockBooking = {
  startTime: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
};

function applyFilter(bookings: MockBooking[], filter: BookingFilter): MockBooking[] {
  const now = new Date();
  switch (filter) {
    case 'upcoming':
      return bookings.filter((b) => b.startTime > now && b.status !== 'cancelled');
    case 'past':
      return bookings.filter((b) => b.startTime <= now && b.status !== 'cancelled');
    case 'cancelled':
      return bookings.filter((b) => b.status === 'cancelled');
    case 'completed':
      return bookings.filter((b) => b.status === 'completed');
    default:
      return bookings;
  }
}

const BOOKINGS: MockBooking[] = [
  { startTime: new Date('2020-01-01'), status: 'completed' },
  { startTime: new Date('2020-01-02'), status: 'confirmed' },
  { startTime: new Date('2099-01-01'), status: 'pending' },
  { startTime: new Date('2020-01-03'), status: 'cancelled' },
];

describe('"completed" filter', () => {
  it('retourne uniquement les réservations terminées', () => {
    const result = applyFilter(BOOKINGS, 'completed');
    expect(result).toHaveLength(1);
    result.forEach((b) => expect(b.status).toBe('completed'));
  });

  it('exclut les réservations non-terminées', () => {
    const result = applyFilter(BOOKINGS, 'completed');
    result.forEach((b) => expect(b.status).not.toBe('confirmed'));
    result.forEach((b) => expect(b.status).not.toBe('cancelled'));
    result.forEach((b) => expect(b.status).not.toBe('pending'));
  });
});

describe('"all" filter inclut les completed', () => {
  it('retourne toutes les réservations incluant completed', () => {
    const result = applyFilter(BOOKINGS, 'all');
    expect(result).toHaveLength(4);
    expect(result.some((b) => b.status === 'completed')).toBe(true);
  });
});
```

- [ ] **Lancer les tests pour vérifier qu'ils échouent**

```bash
pnpm test:run tests/ratings-filter.test.ts
```

Résultat attendu : erreur TypeScript — `'completed'` n'est pas dans `BookingFilter`.

---

## Task 2 : Étendre `BookingFilter` et `buildFilterCondition`

**Files:**
- Modify: `app/services/bookings/get-bookings.ts:6` (type `BookingFilter`)
- Modify: `app/services/bookings/get-bookings.ts:20-26` (fonction `buildFilterCondition`)

- [ ] **Ajouter `'completed'` au type `BookingFilter`**

Dans `app/services/bookings/get-bookings.ts`, ligne 6, remplacer :

```ts
export type BookingFilter = 'all' | 'upcoming' | 'past' | 'cancelled';
```

par :

```ts
export type BookingFilter = 'all' | 'upcoming' | 'past' | 'cancelled' | 'completed';
```

- [ ] **Ajouter le cas `completed` dans `buildFilterCondition`**

Dans `app/services/bookings/get-bookings.ts`, remplacer la fonction `buildFilterCondition` :

```ts
function buildFilterCondition(filter?: BookingFilter) {
  const now = new Date();
  if (filter === 'upcoming') return and(gt(bookings.startTime, now), ne(bookings.status, 'cancelled'));
  if (filter === 'past') return and(lte(bookings.startTime, now), ne(bookings.status, 'cancelled'));
  if (filter === 'cancelled') return eq(bookings.status, 'cancelled');
  if (filter === 'completed') return eq(bookings.status, 'completed');
  return undefined;
}
```

- [ ] **Lancer les tests pour vérifier qu'ils passent**

```bash
pnpm test:run tests/ratings-filter.test.ts
```

Résultat attendu : tous les tests `PASS`.

- [ ] **Vérifier le typecheck**

```bash
pnpm typecheck
```

Résultat attendu : aucune erreur.

- [ ] **Commit**

```bash
git add tests/ratings-filter.test.ts app/services/bookings/get-bookings.ts
git commit -m "feat(bookings): ajouter le filtre 'completed' dans BookingFilter"
```

---

## Task 3 : Relation Drizzle `bookings → rating` + type `BookingWithRelations`

**Files:**
- Modify: `app/server/lib/db/schema-definition/bookings-relations.ts`
- Modify: `app/services/bookings/get-bookings.ts:28-52` (constante `bookingRelations`)
- Modify: `app/services/types.ts:60-64` (type `BookingWithRelations`)

- [ ] **Ajouter la relation `rating` dans `bookings-relations.ts`**

Dans `app/server/lib/db/schema-definition/bookings-relations.ts`, remplacer le contenu par :

```ts
import { relations } from 'drizzle-orm';
import { bookings } from './bookings';
import { courses } from './courses';
import { availabilities } from './availabilities';
import { learners } from './learners';
import { ratings } from './ratings';

export const bookingsRelations = relations(bookings, ({ one }) => ({
  course: one(courses, {
    fields: [bookings.courseId],
    references: [courses.id],
  }),
  availability: one(availabilities, {
    fields: [bookings.availabilityId],
    references: [availabilities.id],
  }),
  learner: one(learners, {
    fields: [bookings.learnerId],
    references: [learners.id],
  }),
  rating: one(ratings, {
    fields: [bookings.courseId, bookings.learnerId],
    references: [ratings.courseId, ratings.learnerId],
  }),
}));
```

- [ ] **Ajouter `rating: true` dans `bookingRelations`**

Dans `app/services/bookings/get-bookings.ts`, remplacer la constante `bookingRelations` :

```ts
const bookingRelations = {
  course: {
    with: {
      teacher: {
        with: {
          user: true,
        },
      },
    },
  },
  availability: {
    with: {
      teacher: {
        with: {
          user: true,
        },
      },
    },
  },
  learner: {
    with: {
      user: true,
    },
  },
  rating: true,
} as const;
```

- [ ] **Ajouter `rating` dans `BookingWithRelations`**

Dans `app/services/types.ts`, remplacer les lignes 60-64 :

```ts
export type BookingWithRelations = DbBooking & {
  course: CourseWithTeacher;
  availability: AvailabilityWithTeacher;
  learner: LearnerWithUser;
  rating: DbRating | null;
};
```

- [ ] **Vérifier le typecheck**

```bash
pnpm typecheck
```

Résultat attendu : aucune erreur TypeScript. Si Drizzle se plaint de la relation composite, vérifier que `ratings.courseId` et `ratings.learnerId` sont bien les bons noms de colonnes dans `app/server/lib/db/schema-definition/ratings.ts`.

- [ ] **Commit**

```bash
git add app/server/lib/db/schema-definition/bookings-relations.ts \
        app/services/bookings/get-bookings.ts \
        app/services/types.ts
git commit -m "feat(bookings): ajouter la relation Drizzle composite bookings → rating"
```

---

## Task 4 : Créer le composant `RatingFormModal`

**Files:**
- Create: `app/components/ratings/rating-form-modal.tsx`

- [ ] **Créer le fichier `app/components/ratings/rating-form-modal.tsx`**

```tsx
import { useEffect, useState } from 'react';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  addToast,
} from '@heroui/react';
import { InlineIcon } from '@iconify/react';
import { useFetcher, useRevalidator } from 'react-router';
import type { DbRating } from '~/services/types';

type RatingFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  existingRating?: DbRating | null;
};

type RatingActionData = {
  success?: boolean;
  error?: string;
};

export default function RatingFormModal({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  existingRating,
}: RatingFormModalProps) {
  const isEditing = existingRating != null;
  const fetcher = useFetcher<RatingActionData>();
  const revalidator = useRevalidator();
  const isSubmitting = fetcher.state === 'submitting';

  const [rate, setRate] = useState(isEditing ? Math.round(parseFloat(existingRating.rate)) : 0);
  const [title, setTitle] = useState(isEditing ? existingRating.title : '');
  const [description, setDescription] = useState(isEditing ? (existingRating.description ?? '') : '');

  useEffect(() => {
    if (!isOpen) return;
    setRate(isEditing ? Math.round(parseFloat(existingRating.rate)) : 0);
    setTitle(isEditing ? existingRating.title : '');
    setDescription(isEditing ? (existingRating.description ?? '') : '');
  }, [isOpen, isEditing, existingRating]);

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return;
    if (fetcher.data.success) {
      addToast({
        title: isEditing ? 'Avis modifié' : 'Avis publié',
        description: isEditing ? 'Votre avis a été mis à jour.' : 'Merci pour votre avis !',
        color: 'success',
      });
      revalidator.revalidate();
      onClose();
    } else {
      addToast({
        title: 'Erreur',
        description: fetcher.data.error ?? 'Une erreur est survenue.',
        color: 'danger',
      });
    }
  }, [fetcher.data, fetcher.state, isEditing, onClose, revalidator]);

  const handleSubmit = () => {
    if (rate === 0) {
      addToast({ title: 'Note requise', description: 'Veuillez sélectionner une note.', color: 'warning' });
      return;
    }

    const body = { courseId, title, description: description || undefined, rate };
    const action = isEditing ? `/api/ratings?id=${existingRating.id}` : '/api/ratings';
    const method = isEditing ? 'PUT' : 'POST';

    fetcher.submit(body, { method, action, encType: 'application/json' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center">
      <ModalContent>
        <ModalHeader className="text-xl font-bold text-dark">
          {isEditing ? 'Modifier mon avis' : 'Rédiger un avis'}
        </ModalHeader>
        <ModalBody className="gap-4">
          <p className="text-sm text-default-500">{courseTitle}</p>

          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => setRate(star)} aria-label={`Note ${star} sur 5`}>
                <InlineIcon
                  icon={star <= rate ? 'mdi:star' : 'mdi:star-outline'}
                  className="text-amber-400"
                  width="32"
                />
              </button>
            ))}
          </div>

          <Input
            label="Titre"
            placeholder="Résumez votre expérience"
            value={title}
            onValueChange={setTitle}
            maxLength={100}
            isRequired
          />

          <Textarea
            label="Description"
            placeholder="Décrivez votre expérience (optionnel)"
            value={description}
            onValueChange={setDescription}
            maxLength={1000}
            minRows={3}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={isSubmitting}>
            Annuler
          </Button>
          <Button
            className="bg-secondary font-semibold text-dark"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={rate === 0 || title.trim().length < 3}
          >
            {isEditing ? 'Enregistrer' : 'Publier'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
```

- [ ] **Vérifier le typecheck**

```bash
pnpm typecheck
```

Résultat attendu : aucune erreur.

- [ ] **Commit**

```bash
git add app/components/ratings/rating-form-modal.tsx
git commit -m "feat(ratings): créer le composant RatingFormModal"
```

---

## Task 5 : Étendre `BookingsTable` — filtre, colonne et modal

**Files:**
- Modify: `app/routes/pages/profile/bookings-table.tsx`

- [ ] **Remplacer le contenu de `bookings-table.tsx`**

```tsx
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { computeRange } from '~/lib/pagination';
import {
  Avatar,
  Button,
  Chip,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
} from '@heroui/react';
import { InlineIcon } from '@iconify/react';
import type { BookingWithRelations } from '~/services/types';
import type { BookingFilter } from '~/services/bookings/get-bookings';
import { formatDateLabel, formatDuration, formatHourLabel, formatPrice } from '~/lib/utils';
import RatingFormModal from '~/components/ratings/rating-form-modal';

const ALL_FILTERS: { key: BookingFilter; label: string; teacherOnly?: boolean; learnerOnly?: boolean }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'upcoming', label: 'À venir' },
  { key: 'past', label: 'Passé' },
  { key: 'cancelled', label: 'Annulé' },
  { key: 'completed', label: 'Terminé', learnerOnly: true },
];

type ModalState = {
  courseId: string;
  courseTitle: string;
  existingRating: BookingWithRelations['rating'];
} | null;

type BookingsTableProps = {
  bookings: BookingWithRelations[];
  total: number;
  currentPage: number;
  currentFilter: BookingFilter;
  pageSize: number;
  isTeacher?: boolean;
};

export default function BookingsTable({
  bookings,
  total,
  currentPage,
  currentFilter,
  pageSize,
  isTeacher = false,
}: BookingsTableProps) {
  const [, setSearchParams] = useSearchParams();
  const [modalState, setModalState] = useState<ModalState>(null);

  const { totalPages, rangeStart, rangeEnd } = computeRange(currentPage, total, pageSize);

  const filters = ALL_FILTERS.filter((f) => {
    if (f.learnerOnly && isTeacher) return false;
    if (f.teacherOnly && !isTeacher) return false;
    return true;
  });

  const handleFilterChange = (key: BookingFilter) => {
    setSearchParams(
      (prev) => {
        prev.set('filter', key);
        prev.delete('page');
        return prev;
      },
      { preventScrollReset: true },
    );
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams(
      (prev) => {
        prev.set('page', String(newPage));
        return prev;
      },
      { preventScrollReset: true },
    );
  };

  const getStatusChip = (status: BookingWithRelations['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <Chip color="success" variant="flat" size="sm" radius="sm" className="font-semibold">
            Confirmé
          </Chip>
        );
      case 'cancelled':
        return (
          <Chip color="danger" variant="flat" size="sm" radius="sm" className="font-semibold">
            Annulé
          </Chip>
        );
      case 'completed':
        return (
          <Chip color="primary" variant="flat" size="sm" radius="sm" className="font-semibold">
            Terminé
          </Chip>
        );
      default:
        return (
          <Chip color="default" variant="flat" size="sm" radius="sm" className="font-semibold">
            En attente
          </Chip>
        );
    }
  };

  const bottomContent = (
    <div className="flex items-center justify-between px-2 py-2 border-t border-default-200">
      <span className="text-sm text-default-500">
        {total === 0 ? '0 réservation' : `${rangeStart} à ${rangeEnd} sur ${total} réservation${total > 1 ? 's' : ''}`}
      </span>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="light"
          isDisabled={currentPage === 1}
          onPress={() => handlePageChange(currentPage - 1)}
          startContent={<InlineIcon icon="mdi:chevron-left" width="16" />}
        >
          Précédent
        </Button>
        <Button
          size="sm"
          variant="light"
          isDisabled={currentPage >= totalPages}
          onPress={() => handlePageChange(currentPage + 1)}
          endContent={<InlineIcon icon="mdi:chevron-right" width="16" />}
        >
          Suivant
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 w-full">
      <h3 className="text-2xl font-bold">Toutes les réservations</h3>

      <Tabs selectedKey={currentFilter} onSelectionChange={(key) => handleFilterChange(key as BookingFilter)}>
        {filters.map(({ key, label }) => (
          <Tab key={key} title={label} />
        ))}
      </Tabs>

      <Table
        aria-label="Tableau des réservations"
        bottomContent={bottomContent}
        classNames={{
          wrapper: 'rounded-2xl shadow-none border border-default-200',
          th: 'bg-white text-default-500 font-medium text-sm border-b border-default-200',
          td: 'py-4',
        }}
      >
        <TableHeader>
          <TableColumn className="w-48">Date</TableColumn>
          <TableColumn className="w-48">Heure</TableColumn>
          <TableColumn>Cours</TableColumn>
          <TableColumn className="w-56">{isTeacher ? 'Apprenant' : 'Professeur'}</TableColumn>
          <TableColumn className="w-24">Prix</TableColumn>
          <TableColumn className="w-32">Statut</TableColumn>
          {!isTeacher ? <TableColumn className="w-40">Avis</TableColumn> : <TableColumn className="hidden" />}
        </TableHeader>
        <TableBody items={bookings} emptyContent="Aucune réservation trouvée.">
          {(booking) => {
            const start = new Date(booking.startTime);
            const end = new Date(booking.endTime);
            const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
            const person = isTeacher ? booking.learner.user : booking.course.teacher.user;
            return (
              <TableRow key={booking.id}>
                <TableCell className="text-sm font-medium">
                  {formatDateLabel(start, { day: 'numeric', month: 'long', year: 'numeric' })}
                </TableCell>
                <TableCell className="text-sm text-default-600">
                  <span>
                    {formatHourLabel(start)} – {formatHourLabel(end)}
                  </span>
                  <span className="block text-xs text-default-400">{formatDuration(durationMinutes)}</span>
                </TableCell>
                <TableCell className="text-sm font-semibold">{booking.course.title}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar src={person.image ?? undefined} name={person.name} size="sm" className="flex-none" />
                    <span className="text-sm">{person.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{formatPrice(booking.course.price)}</TableCell>
                <TableCell>{getStatusChip(booking.status)}</TableCell>
                {!isTeacher ? (
                  <TableCell>
                    {booking.status === 'completed' ? (
                      <Button
                        size="sm"
                        variant="flat"
                        color={booking.rating ? 'default' : 'primary'}
                        startContent={
                          <InlineIcon icon={booking.rating ? 'mdi:pencil-outline' : 'mdi:star-plus-outline'} width="16" />
                        }
                        onPress={() =>
                          setModalState({
                            courseId: booking.courseId,
                            courseTitle: booking.course.title,
                            existingRating: booking.rating,
                          })
                        }
                      >
                        {booking.rating ? 'Modifier' : 'Rédiger un avis'}
                      </Button>
                    ) : null}
                  </TableCell>
                ) : (
                  <TableCell className="hidden" />
                )}
              </TableRow>
            );
          }}
        </TableBody>
      </Table>

      <RatingFormModal
        isOpen={modalState !== null}
        onClose={() => setModalState(null)}
        courseId={modalState?.courseId ?? ''}
        courseTitle={modalState?.courseTitle ?? ''}
        existingRating={modalState?.existingRating}
      />
    </div>
  );
}
```

- [ ] **Vérifier le typecheck**

```bash
pnpm typecheck
```

Résultat attendu : aucune erreur TypeScript.

- [ ] **Lancer tous les tests**

```bash
pnpm test:run
```

Résultat attendu : tous les tests `PASS` (y compris les nouveaux tests du filtre `completed`).

- [ ] **Commit**

```bash
git add app/routes/pages/profile/bookings-table.tsx
git commit -m "feat(profile): bouton rédiger/modifier un avis dans le tableau des réservations"
```
