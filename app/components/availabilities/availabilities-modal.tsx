import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Calendar,
  Select,
  SelectItem,
  Switch,
  cn,
} from '@heroui/react';
import { uuidv7 } from 'uuidv7';
import { useFetcher } from 'react-router';
import { useEffect, useState } from 'react';
import { addToast } from '@heroui/react';
import { today, getLocalTimeZone } from '@internationalized/date';
import type { CalendarDate } from '@internationalized/date';
import { InlineIcon } from '@iconify/react';
import type { AvailabilityWithTeacher } from '~/services/types';
import { TIME_SLOTS, type TimeSlot } from '~/lib/constant';
import { formatTime } from '~/lib/utils';

type AvailabilitiesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  teacherId: string;
  availabilities: AvailabilityWithTeacher[];
};

type PendingSlot = {
  id: string;
  startTime: string;
  endTime: string;
  isException: boolean;
};

function timeSlotToISO(date: CalendarDate, time: TimeSlot): string {
  const [h, m] = time.split(':').map(Number);
  return new Date(date.year, date.month - 1, date.day, h, m).toISOString();
}

function getDuration(start: TimeSlot, end: TimeSlot): string {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const diff = eh * 60 + em - (sh * 60 + sm);
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h === 0) return `${m}min`;
  return m === 0 ? `${h}h` : `${h}h${m.toString().padStart(2, '0')}`;
}

function dayKey(date: Date | string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function AvailabilitiesModal({ isOpen, onClose, teacherId, availabilities }: AvailabilitiesModalProps) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === 'submitting';

  const [selectedDate, setSelectedDate] = useState<CalendarDate | null>(null);
  const [startTime, setStartTime] = useState<TimeSlot | null>(null);
  const [endTime, setEndTime] = useState<TimeSlot | null>(null);

  const [pendingAdd, setPendingAdd] = useState<PendingSlot[]>([]);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
  const [isException, setIsException] = useState(false);

  const hasChanges = pendingAdd.length > 0 || pendingDeleteIds.length > 0;

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return;

    if (fetcher.data.success) {
      addToast({
        title: 'Disponibilités enregistrées',
        description: 'Vos créneaux ont bien été mis à jour.',
        color: 'success',
      });
      setPendingAdd([]);
      setPendingDeleteIds([]);
      setStartTime(null);
      setEndTime(null);
      setSelectedDate(null);
      setIsException(false);
    } else {
      addToast({
        title: 'Erreur',
        description: fetcher.data.error ?? 'Une erreur est survenue.',
        color: 'danger',
      });
    }
  }, [fetcher.state, fetcher.data]);

  const handleStageAdd = () => {
    if (!selectedDate || !startTime || !endTime) return;
    setPendingAdd((prev) => [
      ...prev,
      {
        id: uuidv7(),
        startTime: timeSlotToISO(selectedDate, startTime),
        endTime: timeSlotToISO(selectedDate, endTime),
        isException,
      },
    ]);
    setStartTime(null);
    setEndTime(null);
    setIsException(false);
  };

  const handleToggleDelete = (id: string) => {
    setPendingDeleteIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleRemovePending = (id: string) => {
    setPendingAdd((prev) => prev.filter((s) => s.id !== id));
  };

  const handleClose = () => {
    setPendingAdd([]);
    setPendingDeleteIds([]);
    setStartTime(null);
    setEndTime(null);
    setSelectedDate(null);
    setIsException(false);
    onClose();
  };

  const handleSave = () => {
    if (!hasChanges) return;
    fetcher.submit(
      {
        add: pendingAdd.map((s) => ({ ...s, id: s.id, teacherId })),
        delete: pendingDeleteIds,
      },
      {
        method: 'PATCH',
        action: '/api/availabilities',
        encType: 'application/json',
      },
    );
  };

  const duration = startTime && endTime ? getDuration(startTime, endTime) : null;
  const endTimeSlots = TIME_SLOTS.filter((s) => s > (startTime ?? ''));

  const formattedSelectedDate = selectedDate
    ? new Date(selectedDate.year, selectedDate.month - 1, selectedDate.day).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : null;

  const groupedByDay = availabilities.reduce<Record<string, AvailabilityWithTeacher[]>>((acc, a) => {
    const key = dayKey(a.startTime);
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  const pendingGroupedByDay = pendingAdd.reduce<Record<string, PendingSlot[]>>((acc, s) => {
    const key = dayKey(s.startTime);
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const allDays = Array.from(new Set([...Object.keys(groupedByDay), ...Object.keys(pendingGroupedByDay)]));
  const daysWithSlotsCount = allDays.length;
  const totalSlots = availabilities.length + pendingAdd.length;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="4xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="px-8 pt-7 pb-0 text-xl font-bold">Mes disponibilités</ModalHeader>

        <ModalBody className="gap-8 px-8 py-6">
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            <div className="shrink-0 flex flex-col gap-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Nouveau créneau</p>
              {availabilities.length === 0 && pendingAdd.length === 0 && (
                <p className="text-sm text-gray-400 text-center">Sélectionnez une date pour créer un créneau</p>
              )}
              <Calendar
                value={selectedDate}
                firstDayOfWeek="mon"
                calendarWidth={350}
                onChange={(d) => setSelectedDate(d as CalendarDate)}
                minValue={today(getLocalTimeZone()) as CalendarDate}
                classNames={{ gridBodyRow: 'last:mb-0' }}
              />
            </div>

            <div className="flex flex-1 flex-col gap-6">
              {totalSlots > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">Tous les créneaux</p>
                  <p className="text-xs text-gray-400">
                    {totalSlots} créneau{totalSlots > 1 ? 'x' : ''} sur {daysWithSlotsCount} jour
                    {daysWithSlotsCount > 1 ? 's' : ''}
                  </p>
                </div>
              )}

              {selectedDate ? (
                <>
                  <div className="flex items-center gap-2 border-b pb-4">
                    <InlineIcon icon="mdi:calendar-check" className="text-warning shrink-0" width="22" />
                    <span className="text-base font-semibold capitalize text-gray-800">{formattedSelectedDate}</span>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-end gap-3">
                      <Select
                        label="Début"
                        labelPlacement="outside"
                        selectedKeys={startTime ? [startTime] : []}
                        onSelectionChange={(keys) => {
                          const val = [...keys][0] as TimeSlot;
                          setStartTime(val);
                          if (!endTime || val >= endTime) {
                            const next = TIME_SLOTS.find((s) => s > val);
                            if (next) setEndTime(next);
                          }
                        }}
                        size="md"
                        className="flex-1"
                      >
                        {TIME_SLOTS.map((s) => (
                          <SelectItem key={s}>{s}</SelectItem>
                        ))}
                      </Select>

                      <InlineIcon icon="mdi:arrow-right" width="18" className="mb-3 shrink-0 text-gray-400" />

                      <Select
                        label="Fin"
                        labelPlacement="outside"
                        selectedKeys={endTime ? [endTime] : []}
                        onSelectionChange={(keys) => {
                          setEndTime([...keys][0] as TimeSlot);
                        }}
                        size="md"
                        className="flex-1"
                      >
                        {endTimeSlots.map((s) => (
                          <SelectItem key={s}>{s}</SelectItem>
                        ))}
                      </Select>
                    </div>

                    <Switch isSelected={isException} onValueChange={setIsException} size="sm">
                      Bloquer ce créneau
                    </Switch>

                    <div className="flex items-center justify-between">
                      {duration ? (
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <InlineIcon icon="mdi:timer-outline" width="16" />
                          <span>
                            Durée : <span className="font-semibold text-gray-700">{duration}</span>
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm text-danger">Sélectionnez un début et une fin de créneau</p>
                      )}
                      <Button
                        size="sm"
                        color="warning"
                        variant="flat"
                        isDisabled={!duration}
                        onPress={handleStageAdd}
                        startContent={<InlineIcon icon="mdi:plus" width="16" />}
                      >
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </>
              ) : null}

              {availabilities.length === 0 && pendingAdd.length === 0 && !selectedDate && (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
                  <div className="rounded-full bg-amber-50 p-5">
                    <InlineIcon icon="mdi:calendar-cursor" className="text-warning" width="32" />
                  </div>
                  <p className="text-sm text-gray-400">Aucun créneau pour le moment</p>
                </div>
              )}

              {allDays.length > 0 && (
                <div className="border-t pt-4 flex flex-col gap-3">
                  <ul className="flex max-h-52 flex-col gap-3 overflow-y-auto pr-1">
                    {allDays.map((day) => {
                      const existing = groupedByDay[day] ?? [];
                      const pending = pendingGroupedByDay[day] ?? [];
                      return (
                        <li key={day} className="flex flex-col gap-1.5">
                          <span className="text-xs font-semibold capitalize text-gray-600">{day}</span>
                          <div className="flex flex-wrap gap-2">
                            {existing.map((a) => {
                              const isMarked = pendingDeleteIds.includes(a.id);
                              const isExceptionSlot = a.isException;
                              const slotBgClass = (() => {
                                if (isMarked) return 'bg-danger-50 text-danger-600 line-through opacity-60';
                                if (isExceptionSlot) return 'bg-danger-50 text-danger-600';
                                return 'bg-amber-50 text-gray-700';
                              })();
                              const iconColorClass = (() => {
                                if (isMarked) return 'text-danger';
                                if (isExceptionSlot) return 'text-danger';
                                return 'text-warning';
                              })();
                              return (
                                <span
                                  key={a.id}
                                  className={cn(
                                    'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors',
                                    slotBgClass,
                                  )}
                                >
                                  <InlineIcon
                                    icon={isExceptionSlot ? 'mdi:lock' : 'mdi:clock-outline'}
                                    width="14"
                                    className={iconColorClass}
                                  />
                                  {formatTime(new Date(a.startTime))} – {formatTime(new Date(a.endTime))}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleDelete(a.id)}
                                    className={cn(
                                      'ml-0.5 transition-colors',
                                      isMarked
                                        ? 'text-danger hover:text-danger-700'
                                        : 'text-gray-400 hover:text-danger',
                                    )}
                                    aria-label={isMarked ? 'Annuler la suppression' : 'Marquer pour suppression'}
                                  >
                                    <InlineIcon icon={isMarked ? 'mdi:arrow-u-left-top' : 'mdi:close'} width="13" />
                                  </button>
                                </span>
                              );
                            })}
                            {pending.map((s) => (
                              <span
                                key={s.id}
                                className={cn(
                                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm',
                                  s.isException ? 'bg-danger-50 text-danger-600' : 'bg-success-50 text-success-700',
                                )}
                              >
                                <InlineIcon
                                  icon={s.isException ? 'mdi:lock' : 'mdi:plus'}
                                  width="14"
                                  className={s.isException ? 'text-danger' : 'text-success'}
                                />
                                {formatTime(new Date(s.startTime))} – {formatTime(new Date(s.endTime))}
                                <button
                                  type="button"
                                  onClick={() => handleRemovePending(s.id)}
                                  className={cn(
                                    'ml-0.5 transition-colors hover:text-danger',
                                    s.isException ? 'text-danger-400' : 'text-success-400',
                                  )}
                                  aria-label="Retirer ce créneau"
                                >
                                  <InlineIcon icon="mdi:close" width="13" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="px-8 pb-7">
          <Button variant="light" onPress={handleClose}>
            Fermer
          </Button>
          <Button
            color="warning"
            className="text-white"
            onPress={handleSave}
            isLoading={isSubmitting}
            isDisabled={!hasChanges}
          >
            Enregistrer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
