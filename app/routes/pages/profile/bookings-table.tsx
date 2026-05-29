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

const ALL_FILTERS: { key: BookingFilter; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'upcoming', label: 'À venir' },
  { key: 'completed', label: 'Terminé' },
  { key: 'cancelled', label: 'Annulé' },
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
          <Chip variant="flat" size="sm" radius="sm" className="font-semibold bg-blue-100 text-blue-700">
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
        {ALL_FILTERS.map(({ key, label }) => (
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
          {isTeacher ? (
            <TableColumn className="hidden w-0 p-0">{''}</TableColumn>
          ) : (
            <TableColumn className="w-40">Avis</TableColumn>
          )}
        </TableHeader>
        <TableBody items={bookings} emptyContent="Aucune réservation trouvée.">
          {(booking) => {
            const start = new Date(booking.startTime);
            const end = new Date(booking.endTime);
            const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
            const person = isTeacher ? booking.learner.user : booking.course.teacher.user;
            const teacherUserId = booking.course.teacher.user.id;
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
                  {isTeacher ? (
                    <div className="flex items-center gap-2">
                      <Avatar src={person.image ?? undefined} name={person.name} size="sm" className="flex-none" />
                      <span className="text-sm">{person.name}</span>
                    </div>
                  ) : (
                    <Link to={`/profile/${teacherUserId}`} className="flex items-center gap-2 hover:underline">
                      <Avatar src={person.image ?? undefined} name={person.name} size="sm" className="flex-none" />
                      <span className="text-sm">{person.name}</span>
                    </Link>
                  )}
                </TableCell>
                <TableCell className="text-sm">{formatPrice(booking.course.price)}</TableCell>
                <TableCell>{getStatusChip(booking.status)}</TableCell>
                {isTeacher ? (
                  <TableCell className="hidden w-0 p-0">{''}</TableCell>
                ) : (
                  <TableCell>
                    {booking.status === 'completed' ? (
                      <Button
                        size="sm"
                        variant="light"
                        color={booking.rating ? 'default' : 'primary'}
                        startContent={
                          <InlineIcon
                            icon={booking.rating ? 'mdi:pencil-outline' : 'mdi:star-plus-outline'}
                            width="16"
                          />
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
