import { Button, Card, CardBody } from '@heroui/react';
import type { CourseWithTeacher, TeacherWithUserAndCoursesCount, AvailableSlot } from '~/services/types';
import TeacherCard from './teacher-card';
import { formatSlot } from '~/lib/utils';

type BookingCardProps = {
  course: CourseWithTeacher;
  teacher: TeacherWithUserAndCoursesCount | null;
  availableSlots?: AvailableSlot[] | null;
};

export default function BookingCard({ course, teacher, availableSlots }: BookingCardProps) {
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

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Créneaux restants</p>
          <p className="mt-1 text-lg font-bold text-emerald-700">{freeSlots.length}</p>
          <ul className="mt-2 max-h-32 space-y-1 overflow-auto pr-1 text-xs text-emerald-800">
            {freeSlots.length === 0 ? <li>Aucun créneau libre.</li> : null}
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
