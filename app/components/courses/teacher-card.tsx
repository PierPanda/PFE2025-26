import type { TeacherWithUserAndCoursesCount } from '~/services/types';

type TeacherCardProps = {
  teacher: TeacherWithUserAndCoursesCount | null;
};

export default function TeacherCard({ teacher }: TeacherCardProps) {
  if (!teacher) return null;

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-brand-dark/80">Votre professeur</p>
      <a href={`/teachers/${teacher.id}`} className="block rounded-lg p-4 transition-colors hover:bg-brand/5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/10 text-lg font-bold text-brand">
            {teacher.user.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="font-semibold text-brand-dark">{teacher.user.name}</p>
            <p className="text-sm text-brand-dark/80">
              {teacher.coursesCount} cours disponible{teacher.coursesCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </a>
    </div>
  );
}
