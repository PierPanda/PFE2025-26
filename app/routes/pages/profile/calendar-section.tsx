import BookingCard from './booking-card';
import type { BookingWithRelations } from '~/services/types';

type CalendarSectionProps = {
  teacherBookings?: BookingWithRelations[];
  learnerBookings?: BookingWithRelations[];
  isTeacher?: boolean;
  action?: string;
};

export default function CalendarSection({
  teacherBookings,
  learnerBookings,
  isTeacher = false,
  action,
}: CalendarSectionProps) {
  const upcomingBookings = isTeacher ? (teacherBookings ?? []) : (learnerBookings ?? []);

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-2xl font-bold">Mes prochains cours</h3>
        {upcomingBookings.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun cours à venir.</p>
        ) : (
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} isTeacher={isTeacher} action={action} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
