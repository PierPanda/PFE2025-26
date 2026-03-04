import type { TeacherWithUserAndCourses } from '~/services/types';

type TeacherCardProps = {
  teacher: TeacherWithUserAndCourses | null;
};

export default function TeacherCard({ teacher }: TeacherCardProps) {
  if (!teacher) return null;

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-gray-500">Votre professeur</p>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg font-bold text-amber-600">
          {teacher.user.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{teacher.user.name}</p>
          <p className="text-sm text-gray-500">
            {teacher.courses.length} cours disponible{teacher.courses.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
