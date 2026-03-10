import { Button, Card, CardBody } from '@heroui/react';
import type {
  CourseWithTeacher,
  TeacherWithUserAndCoursesCount,
  AvailabilityWithTeacher,
  AvailableSlot,
  BookingWithRelations,
} from '~/services/types';
import TeacherCard from './teacher-card';

type BookingCardProps = {
  course: CourseWithTeacher;
  teacher: TeacherWithUserAndCoursesCount | null;
  availabilities?: AvailabilityWithTeacher[] | null;
  bookings?: BookingWithRelations[] | null;
  availableSlots?: AvailableSlot[] | null;
};

function formatSlot(start: Date, end: Date) {
  const date = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(start);

  const startTime = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(start);

  const endTime = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(end);

  return `${date} - ${startTime} a ${endTime}`;
}

export default function BookingCard({ course, teacher, availabilities, bookings, availableSlots }: BookingCardProps) {
  const bookedSlots = bookings ?? [];
  const totalAvailabilities = availabilities ?? [];
  const freeSlots = availableSlots ?? [];

  return (
    <Card className="sticky top-6 shadow-md">
      <CardBody className="flex flex-col gap-5 p-6">
        <div>
          <p className="text-3xl font-bold text-gray-900">{course.price ? `${course.price} €` : 'Gratuit'}</p>
          <p className="text-sm text-gray-500">par séance</p>
        </div>

        <div className="flex flex-col gap-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Durée</span>
            <span className="font-medium">{course.duration} min</span>
          </div>
          <div className="flex justify-between">
            <span>Niveau</span>
            <span className="capitalize font-medium">{course.level}</span>
          </div>
          <div className="flex justify-between">
            <span>Instrument</span>
            <span className="capitalize font-medium">{course.category}</span>
          </div>
        </div>

        <Button color="warning" size="lg" className="w-full font-semibold text-white">
          Réserver
        </Button>

        <div className="grid gap-3 text-sm">
          <div className="rounded-xl border border-gray-200 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Disponibilites du prof</p>
            <p className="mt-1 text-lg font-bold text-gray-900">{totalAvailabilities.length}</p>
            <ul className="mt-2 max-h-32 space-y-1 overflow-auto pr-1 text-xs text-gray-700">
              {totalAvailabilities.length === 0 ? <li>Aucune disponibilite.</li> : null}
              {totalAvailabilities.map((slot) => (
                <li key={slot.id} className="rounded-md bg-gray-50 px-2 py-1">
                  {formatSlot(slot.startTime, slot.endTime)}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50/60 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Creneaux reserves</p>
            <p className="mt-1 text-lg font-bold text-red-700">{bookedSlots.length}</p>
            <ul className="mt-2 max-h-32 space-y-1 overflow-auto pr-1 text-xs text-red-800">
              {bookedSlots.length === 0 ? <li>Aucune reservation active.</li> : null}
              {bookedSlots.map((booking) => (
                <li key={booking.id} className="rounded-md bg-red-100/70 px-2 py-1">
                  {formatSlot(booking.startTime, booking.endTime)}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Creneaux restants</p>
            <p className="mt-1 text-lg font-bold text-emerald-700">{freeSlots.length}</p>
            <ul className="mt-2 max-h-32 space-y-1 overflow-auto pr-1 text-xs text-emerald-800">
              {freeSlots.length === 0 ? <li>Aucun creneau libre.</li> : null}
              {freeSlots.map((slot) => (
                <li
                  key={`${slot.availabilityId}-${slot.startTime.toISOString()}-${slot.endTime.toISOString()}`}
                  className="rounded-md bg-emerald-100/80 px-2 py-1"
                >
                  {formatSlot(slot.startTime, slot.endTime)}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {teacher && (
          <>
            <div className="h-px bg-gray-100" />
            <TeacherCard teacher={teacher} />
          </>
        )}
      </CardBody>
    </Card>
  );
}
