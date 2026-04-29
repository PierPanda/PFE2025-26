import type { BookingWithRelations } from '~/services/types';
import { InlineIcon } from '@iconify/react';
import { Card, CardBody, Button, Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { formatHourLabel, formatDateLabel, formatDuration, capitalize } from '~/lib/utils';
import { useFetcher, useRevalidator } from 'react-router';
import { useEffect } from 'react';

type BookingCardProps = {
  booking: BookingWithRelations;
  isTeacher: boolean;
  action?: string;
};

export default function BookingCard({ booking, isTeacher, action = '/profile' }: BookingCardProps) {
  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);
  const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
  const fetcher = useFetcher<{ success?: boolean }>();
  const revalidator = useRevalidator();

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
      revalidator.revalidate();
    }
  }, [fetcher.data, fetcher.state, revalidator]);

  const handleUpdateStatus = (status: 'confirmed' | 'cancelled') => {
    fetcher.submit({ _action: 'updateBooking', bookingId: booking.id, status }, { method: 'post', action });
  };

  const getLabelForStatus = (status: BookingWithRelations['status']) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'confirmed':
        return 'Confirmé';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const statusLabel = getLabelForStatus(booking.status);
  let statusColor: 'success' | 'danger' | 'default' = 'default';
  if (booking.status === 'confirmed') statusColor = 'success';
  else if (booking.status === 'cancelled') statusColor = 'danger';

  return (
    <Card className="border border-primary/10 bg-white/95 shadow-sm">
      <CardBody className="p-0">
        <div className="flex items-stretch gap-4 p-4">
          <div className="w-32 flex-none flex flex-col items-center justify-center p-3 rounded-lg bg-chip-light text-sm font-bold text-chip-dark text-center">
            <span className="text-xs">
              {formatDateLabel(start, { weekday: 'short', day: '2-digit', month: 'short' })}
            </span>
            <span className="mt-1 text-3xl font-bold">{formatHourLabel(start)}</span>
          </div>

          <div className="w-px bg-dark/30 rounded" aria-hidden="true" />

          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold mb-0">{booking.course.title}</h3>
                <div className="mt-2 text-sm flex flex-col gap-1">
                  <span className="flex items-center gap-2">
                    <InlineIcon icon={`mdi:${isTeacher ? 'graduation-cap' : 'account'}`} width="16" />
                    {isTeacher ? booking.learner.user.name : booking.course.teacher.user.name}
                  </span>
                  <span className="flex items-center gap-2">
                    <InlineIcon icon="mdi:tag" width="16" /> {capitalize(booking.course.category)}
                  </span>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Chip
                    className="text-tiny font-bold bg-dark/10"
                    startContent={<InlineIcon icon="mdi:clock-outline" width="16" />}
                    radius="sm"
                    size="sm"
                    variant="flat"
                  >
                    {formatDuration(durationMinutes)}
                  </Chip>
                  <Chip className="text-tiny font-bold" color={statusColor} radius="sm" size="sm" variant="flat">
                    {statusLabel}
                  </Chip>
                </div>

                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      radius="full"
                      aria-label="Modifier la réservation"
                      isLoading={fetcher.state === 'submitting'}
                    >
                      <InlineIcon icon="mdi:dots-vertical" width="16" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Actions de la réservation">
                    {isTeacher && booking.status === 'pending' ? (
                      <DropdownItem
                        key="confirm"
                        startContent={<InlineIcon icon="mdi:check-circle-outline" width="16" />}
                        onPress={() => handleUpdateStatus('confirmed')}
                      >
                        Confirmer
                      </DropdownItem>
                    ) : null}
                    {booking.status !== 'cancelled' ? (
                      <DropdownItem
                        key="cancel"
                        color="danger"
                        className="text-danger"
                        startContent={<InlineIcon icon="mdi:close-circle-outline" width="16" />}
                        onPress={() => handleUpdateStatus('cancelled')}
                      >
                        Annuler
                      </DropdownItem>
                    ) : null}
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
