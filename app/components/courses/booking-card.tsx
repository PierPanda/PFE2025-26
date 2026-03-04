import { Button, Card, CardBody } from '@heroui/react';
import type { CourseWithTeacher, TeacherWithUserAndCourses } from '~/services/types';
import TeacherCard from './teacher-card';

type BookingCardProps = {
  course: CourseWithTeacher;
  teacher: TeacherWithUserAndCourses | null;
};

export default function BookingCard({ course, teacher }: BookingCardProps) {
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
