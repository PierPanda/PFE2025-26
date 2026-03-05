import { Chip } from '@heroui/react';
import type { DbUser, TeacherWithUserAndCourses } from '~/services/types';

type UserProfileProps = {
  user: DbUser;
  teacher: TeacherWithUserAndCourses | null;
};

export default function UserProfile({ user, teacher }: UserProfileProps) {
  const memberSince = new Date(user.createdAt).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  const skills = teacher?.skills
    ? teacher.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const graduations = Array.isArray(teacher?.graduations) ? (teacher.graduations as string[]) : [];

  return (
    <div className="flex items-start gap-8">
      {user.image ? (
        <img src={user.image} alt={user.name} className="w-20 h-20 rounded-full object-cover shrink-0" />
      ) : (
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-2xl font-bold text-amber-600 shrink-0">
          {user.name?.[0]?.toUpperCase() ?? '?'}
        </div>
      )}

      <div className="flex flex-col gap-1 min-w-48">
        <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
        <p className="text-sm text-gray-500">{user.email}</p>
        <p className="text-xs text-gray-400">Membre depuis {memberSince}</p>
      </div>

      {teacher && <div className="w-px bg-gray-200 self-stretch mx-2" />}

      {teacher && (
        <div className="flex flex-col gap-3 flex-1">
          {teacher.description && <p className="text-sm text-gray-600 leading-relaxed">{teacher.description}</p>}

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <Chip key={skill} color="warning" variant="flat" size="sm">
                  {skill}
                </Chip>
              ))}
            </div>
          )}

          {graduations.length > 0 && (
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {graduations.map((grad, i) => (
                <li key={i} className="text-xs text-gray-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  {grad}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
