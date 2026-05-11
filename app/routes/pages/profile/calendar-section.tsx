import { Button, Calendar } from '@heroui/react';
import { getLocalTimeZone, today, type CalendarDate } from '@internationalized/date';
import BookingCard from './booking-card';
import type { AvailabilityWithTeacher, BookingWithRelations, TeacherWithUser } from '~/services/types';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import { AvailabilitiesModal } from '~/components/availabilities/availabilities-modal';

type CalendarSectionProps = {
  teacherBookings?: BookingWithRelations[];
  learnerBookings?: BookingWithRelations[];
  teacher?: TeacherWithUser;
  availabilities?: AvailabilityWithTeacher[];
  isTeacher?: boolean;
};

export default function CalendarSection({
  teacherBookings,
  learnerBookings,
  teacher,
  availabilities = [],
  isTeacher = false,
}: CalendarSectionProps) {
  const [isAvailabilitiesOpen, setAvailabilitiesOpen] = useState(false);
  const upcomingBookings = isTeacher ? (teacherBookings ?? []) : (learnerBookings ?? []);

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-2xl font-bold">Mon calendrier</h3>
        <div className="flex flex-col gap-8 md:flex-row">
          {isTeacher && (
            <div className="flex flex-col items-stretch gap-4">
              <Calendar
                value={today(getLocalTimeZone()) as CalendarDate}
                minValue={today(getLocalTimeZone()) as CalendarDate}
                firstDayOfWeek="mon"
                className="flex-1"
                calendarWidth={350}
                classNames={{ gridBodyRow: 'last:mb-0' }}
                isReadOnly
              />
              <Button
                size="md"
                variant="flat"
                className="p-4 bg-secondary"
                startContent={<Icon icon="mdi:calendar-clock" width="16" />}
                onPress={() => setAvailabilitiesOpen(true)}
              >
                Modifier mes disponibilités
              </Button>
            </div>
          )}
          <div className="flex-1 space-y-4">
            <h4>Mes prochains cours</h4>
            {upcomingBookings.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun cours à venir.</p>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} isTeacher={isTeacher} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {teacher && isTeacher && (
        <AvailabilitiesModal
          isOpen={isAvailabilitiesOpen}
          onClose={() => setAvailabilitiesOpen(false)}
          teacherId={teacher.id}
          availabilities={availabilities}
        />
      )}
    </>
  );
}
