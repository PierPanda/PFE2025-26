import { useEffect, useState } from 'react';
import { InlineIcon } from '@iconify/react';
import {
  addToast,
  Button,
  Card,
  CardBody,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';
import { useAuth } from '~/hooks/use-auth';
import type { AvailableSlot, CourseWithTeacher, TeacherWithUserAndCoursesCount } from '~/services/types';
import { cn, formatDateLabel, formatHourLabel, formatPrice, getDateKey } from '~/lib/utils';
import { BookingConfirmModal } from '../booking/booking-confirm-modal';
import TeacherCard from './teacher-card';
import { useFetcher, useNavigate } from 'react-router';

type BookingCardProps = {
  course: CourseWithTeacher;
  teacher: TeacherWithUserAndCoursesCount | null;
  availableSlots?: AvailableSlot[] | null;
};

type SlotOption = AvailableSlot & {
  endDate: Date;
  key: string;
  startDate: Date;
  dayKey: string;
};

type DayOption = {
  key: string;
  label: string;
  slots: SlotOption[];
  summaryLabel: string;
};

function formatSlotsCount(count: number) {
  return `${count} ${count > 1 ? 'créneaux' : 'créneau'}`;
}

export default function BookingCard({ course, teacher, availableSlots }: BookingCardProps) {
  const { user } = useAuth();
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [selectedSlotKey, setSelectedSlotKey] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const deleteFetcher = useFetcher<{ success?: boolean; error?: string }>();
  const navigate = useNavigate();
  const now = new Date();
  const cardColumnClasses = 'w-full lg:sticky lg:top-24 lg:self-start lg:w-[24rem] lg:min-w-[24rem]';
  const isCourseTeacher = user?.id === course.teacher.user.id;
  const isDeleting = deleteFetcher.state === 'submitting';

  const slots = (availableSlots ?? [])
    .map((slot) => {
      const startDate = new Date(slot.startTime);
      const endDate = new Date(slot.endTime);

      return {
        ...slot,
        endDate,
        key: `${slot.availabilityId}-${startDate.toISOString()}`,
        startDate,
        dayKey: getDateKey(startDate),
      };
    })
    .filter((slot) => slot.startDate.getTime() > now.getTime())
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const daysMap = new Map<string, DayOption>();

  for (const slot of slots) {
    const existingDay = daysMap.get(slot.dayKey);

    if (existingDay) {
      existingDay.slots.push(slot);
      continue;
    }

    daysMap.set(slot.dayKey, {
      key: slot.dayKey,
      label: formatDateLabel(slot.startDate, {
        day: 'numeric',
        month: 'long',
        weekday: 'long',
      }),
      slots: [slot],
      summaryLabel: formatDateLabel(slot.startDate, {
        day: 'numeric',
        month: 'long',
        weekday: 'long',
        year: 'numeric',
      }),
    });
  }

  const dayOptions = Array.from(daysMap.values());
  const selectedDay = dayOptions.find((day) => day.key === selectedDayKey) ?? null;
  const selectedSlot = selectedDay?.slots.find((slot) => slot.key === selectedSlotKey) ?? null;
  const totalLabel = Number(course.price) > 0 ? formatPrice(course.price) : 'Gratuit';

  useEffect(() => {
    if (deleteFetcher.state !== 'idle' || !deleteFetcher.data) return;

    if (deleteFetcher.data.success) {
      addToast({
        title: 'Cours supprimé',
        description: 'Le cours a bien été supprimé.',
        color: 'success',
      });
      navigate('/profile');
      return;
    }

    if (deleteFetcher.data.error) {
      addToast({
        title: 'Erreur',
        description: deleteFetcher.data.error,
        color: 'danger',
      });
    }
  }, [deleteFetcher.state, deleteFetcher.data, navigate]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      addToast({
        title: 'Lien copié',
        description: 'Le lien du cours a été copié dans le presse-papiers.',
        color: 'success',
      });
    } catch {
      addToast({
        title: 'Erreur',
        description: 'Impossible de copier le lien du cours.',
        color: 'danger',
      });
    }
  };

  const handleDelete = () => {
    deleteFetcher.submit({ courseId: course.id }, { method: 'post', action: '/profile' });
    setIsDeleteModalOpen(false);
  };

  return (
    <aside className={cardColumnClasses}>
      <Card className="border border-brand/15 bg-white/95 shadow-lg shadow-brand/5 backdrop-blur-sm">
        <CardBody className="flex flex-col gap-6 p-6 lg:overflow-y-auto">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="mb-0 text-2xl font-bold text-brand-dark">Réservez le cours</h2>
              <p className="text-sm text-brand-dark/80">Sélectionnez une date et un créneau</p>
            </div>

            {isCourseTeacher ? (
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    radius="full"
                    aria-label="Options du cours"
                    className="shrink-0 border border-brand/15 bg-white/80 text-brand-dark"
                  >
                    <InlineIcon icon="mdi:dots-vertical" width="20" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Gestion du cours">
                  <DropdownItem key="edit" startContent={<InlineIcon icon="mdi:pencil" width="16" />}>
                    Modifier
                  </DropdownItem>
                  <DropdownItem
                    key="share"
                    startContent={<InlineIcon icon="mdi:share-variant" width="16" />}
                    onPress={handleShare}
                  >
                    Partager
                  </DropdownItem>
                  <DropdownItem
                    key="delete"
                    color="danger"
                    className="text-danger"
                    startContent={<InlineIcon icon="mdi:trash-can-outline" width="16" />}
                    onPress={() => setIsDeleteModalOpen(true)}
                  >
                    Supprimer
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : null}
          </div>

          {isCourseTeacher ? (
            <div className="rounded-2xl border border-dashed border-brand/25 bg-brand-tertiary/60 px-4 py-4 text-sm text-brand-dark/65">
              Vous êtes l’enseignant de ce cours. Vous ne pouvez pas réserver votre propre créneau.
            </div>
          ) : (
            <>
              <div className="space-y-6">
                <section className="space-y-3">
                  <div className="flex items-center gap-2 text-md font-medium text-brand-dark">
                    <InlineIcon icon="mdi:calendar-clock-outline" className="text-lg text-brand-dark" />
                    <span>Choisissez une date</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {dayOptions.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-brand/25 bg-brand-tertiary/60 px-4 py-4 text-sm text-brand-dark/65">
                        Aucun créneau disponible pour le moment.
                      </div>
                    ) : (
                      dayOptions.map((day) => {
                        const isSelected = day.key === selectedDayKey;

                        return (
                          <Button
                            key={day.key}
                            fullWidth
                            radius="sm"
                            variant="bordered"
                            onPress={() => {
                              setSelectedDayKey(day.key);
                              setSelectedSlotKey(null);
                            }}
                            className={cn(
                              'justify-between px-4 py-4 text-left transition',
                              isSelected
                                ? 'border-brand bg-brand/10 text-brand-dark shadow-sm shadow-brand/10'
                                : 'border-brand/20 bg-white text-brand-dark hover:border-brand/60 hover:bg-brand/5',
                            )}
                          >
                            <span className="text-sm font-medium">{day.label}</span>
                            <span className={cn('text-sm', isSelected ? 'text-brand' : 'text-brand-dark/50')}>
                              {formatSlotsCount(day.slots.length)}
                            </span>
                          </Button>
                        );
                      })
                    )}
                  </div>
                </section>

                {selectedDay ? (
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-md font-medium text-brand-dark">
                      <InlineIcon icon="mdi:clock-time-four-outline" className="text-lg text-brand-dark" />
                      <span>Choisissez une heure</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {selectedDay.slots.map((slot) => {
                        const isSelected = slot.key === selectedSlotKey;

                        return (
                          <Button
                            key={slot.key}
                            fullWidth
                            radius="sm"
                            variant="bordered"
                            onPress={() => setSelectedSlotKey(slot.key)}
                            className={cn(
                              'px-4 py-4 text-center text-sm font-medium transition',
                              isSelected
                                ? 'border-brand bg-brand/10 text-brand-dark shadow-sm shadow-brand/10'
                                : 'border-brand/20 bg-white text-brand-dark hover:border-brand/60 hover:bg-brand/5',
                            )}
                          >
                            {formatHourLabel(slot.startDate)}
                          </Button>
                        );
                      })}
                    </div>
                  </section>
                ) : null}

                {selectedSlot ? (
                  <section className="overflow-hidden rounded-lg border border-brand-dark/10 bg-brand-dark/2">
                    <div className="px-4 py-4">
                      <p className="text-sm text-brand-dark/50">Votre réservation</p>
                      <div className="mt-1">
                        <p className="text-lg font-semibold leading-tight text-brand-dark">
                          {selectedDay?.summaryLabel}
                        </p>
                        <p className="text-lg font-semibold text-brand-dark">
                          à {formatHourLabel(selectedSlot.startDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-brand-dark/10 px-4 py-4">
                      <span className="text-lg text-brand-dark/65">Total</span>
                      <span className="text-xl font-bold text-brand-dark">{totalLabel}</span>
                    </div>
                  </section>
                ) : null}
              </div>

              <Button
                fullWidth
                size="lg"
                radius="sm"
                variant="solid"
                isDisabled={!selectedSlot}
                onPress={() => setIsConfirmModalOpen(true)}
                className={cn(
                  'font-semibold shadow-none transition',
                  selectedSlot
                    ? 'border-brand-secondary bg-brand-secondary text-brand-dark'
                    : 'border-brand/10 bg-brand-tertiary text-brand-dark/40',
                )}
              >
                Confirmez et payez
              </Button>
            </>
          )}

          {teacher ? (
            <>
              <div className="h-px bg-brand/10" />
              <TeacherCard teacher={teacher} />
            </>
          ) : null}
        </CardBody>
      </Card>

      {selectedSlot && isConfirmModalOpen ? (
        <BookingConfirmModal
          slot={selectedSlot}
          course={course}
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
        />
      ) : null}

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} size="sm">
        <ModalContent>
          <ModalHeader>Supprimer le cours</ModalHeader>
          <ModalBody>
            <p className="text-gray-600">
              Êtes-vous sûr de vouloir supprimer <span className="font-semibold">{course.title}</span> ? Cette action
              est irréversible.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsDeleteModalOpen(false)}>
              Annuler
            </Button>
            <Button color="danger" onPress={handleDelete} isLoading={isDeleting}>
              Supprimer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </aside>
  );
}
