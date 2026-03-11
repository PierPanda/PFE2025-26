import { Chip } from '@heroui/react';
import type { AvailabilityWithTeacher } from '~/services/types';
import { formatTime } from '~/lib/utils';

type CalendarBooking = {
  id: string;
  startTime: Date | string;
  endTime: Date | string;
  status?: 'pending' | 'confirmed' | 'cancelled';
  title?: string;
};

type WeeklyCalendarProps = {
  availabilities: AvailabilityWithTeacher[];
  bookings?: CalendarBooking[];
};

type CalendarEvent = {
  id: string;
  type: 'availability' | 'booking';
  startTime: Date;
  endTime: Date;
  status?: CalendarBooking['status'];
  title: string;
};

function getWeekDays(baseDate = new Date()): Date[] {
  const current = new Date(baseDate);
  current.setHours(0, 0, 0, 0);

  const day = current.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(current);
  monday.setDate(current.getDate() + diffToMonday);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
}

function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function getBookingChipColor(status?: CalendarBooking['status']): 'warning' | 'success' | 'danger' {
  if (status === 'cancelled') return 'danger';
  if (status === 'pending') return 'warning';
  return 'success';
}

export function WeeklyCalendar({ availabilities }: WeeklyCalendarProps) {
  const weekDays = getWeekDays();

  const events: CalendarEvent[] = [
    ...availabilities.map((availability) => ({
      id: availability.id,
      type: 'availability' as const,
      startTime: toDate(availability.startTime),
      endTime: toDate(availability.endTime),
      title: 'Disponibilité',
    })),
  ];

  const eventsByDay = weekDays.map((day) => {
    const dayEvents = events
      .filter((event) => isSameDay(event.startTime, day))
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    return {
      day,
      events: dayEvents,
    };
  });

  const hasEvents = eventsByDay.some((d) => d.events.length > 0);

  return (
    <div className="bg-amber-50 rounded-2xl p-6 h-full">
      <h3 className="text-xl font-bold">Semaine</h3>
      <p className="text-xs text-gray-500 mt-1">Disponibilités et réservations</p>

      {!hasEvents ? (
        <div className="h-full min-h-60 flex items-center justify-center">
          <p className="text-sm text-gray-400 text-center">Aucun créneau cette semaine</p>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {eventsByDay.map(({ day, events: dayEvents }) => (
            <li key={day.toISOString()} className="rounded-xl border border-amber-100 bg-white p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-800 capitalize">
                  {day.toLocaleDateString('fr-FR', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
                <p className="text-xs text-gray-400">
                  {dayEvents.length} créneau{dayEvents.length > 1 ? 'x' : ''}
                </p>
              </div>

              {dayEvents.length === 0 ? (
                <p className="text-xs text-gray-400">Aucun créneau</p>
              ) : (
                <ul className="space-y-2">
                  {dayEvents.map((event) => (
                    <li key={`${event.type}-${event.id}`} className="flex items-center justify-between gap-2">
                      <p className="text-sm text-gray-700">
                        {formatTime(event.startTime)} - {formatTime(event.endTime)}
                      </p>
                      {event.type === 'availability' ? (
                        <Chip size="sm" variant="flat" color="warning">
                          Disponibilité
                        </Chip>
                      ) : (
                        <Chip size="sm" variant="flat" color={getBookingChipColor(event.status)}>
                          {event.title}
                        </Chip>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
