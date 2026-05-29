import { Button } from '@heroui/react';
import { Link } from 'react-router';
import type { CourseWithTeacherAndRatings } from '~/services/types';
import { InlineIcon } from '@iconify/react';
import CourseCard from '~/components/ui/course-card';

type CourseSectionProps = {
  courses: CourseWithTeacherAndRatings[];
  currentUserId?: string | null;
  isOwnProfile?: boolean;
  deleteAction?: string;
};

export default function CourseSection({
  courses,
  currentUserId = null,
  isOwnProfile = false,
  deleteAction,
}: CourseSectionProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">{isOwnProfile ? 'Mes cours' : 'Cours'}</h3>
        {isOwnProfile && courses.length > 0 && (
          <Link to="/course/create">
            <Button size="sm" className="bg-secondary" startContent={<InlineIcon icon="mdi:plus" width="20" />}>
              Créer un cours
            </Button>
          </Link>
        )}
      </div>

      {courses.length === 0 && isOwnProfile && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-gray-500 mb-4">Vous n'avez pas encore de cours.</p>
          <Link to="/course/create">
            <Button size="sm" className="bg-secondary" startContent={<InlineIcon icon="mdi:plus" width="20" />}>
              Créer mon premier cours
            </Button>
          </Link>
        </div>
      )}
      {courses.length === 0 && !isOwnProfile && (
        <p className="text-gray-500 py-12 text-center">Aucun cours disponible.</p>
      )}
      {courses.length > 0 && (
        <div className="w-full">
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} currentUserId={currentUserId} deleteAction={deleteAction} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
