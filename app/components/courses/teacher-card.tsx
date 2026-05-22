import { Link } from 'react-router';
import type { TeacherWithUserAndCoursesCount } from '~/services/types';

type TeacherCardProps = {
  teacher: TeacherWithUserAndCoursesCount | null;
};

export default function TeacherCard({ teacher }: TeacherCardProps) {
  if (!teacher) return null;

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-dark/80">Votre professeur</p>
      <Link to={`/profile/${teacher.user.id}`} className="block rounded-lg p-4 transition-colors hover:bg-primary/5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
            {teacher.user.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="font-semibold text-dark">{teacher.user.name}</p>
            <p className="text-sm text-dark/80">
              {teacher.coursesCount} cours disponible{teacher.coursesCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
