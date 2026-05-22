import { Chip, Button } from '@heroui/react';
import { Icon, InlineIcon } from '@iconify/react';
import type { DbUser, TeacherWithUserAndCourses } from '~/services/types';
import { useState } from 'react';
import EditProfileModal from './edit-profile-modal';

type UserProfileProps = {
  user: DbUser;
  teacher: TeacherWithUserAndCourses | null;
  rating?: number | null;
  reviewCount?: number;
};

export default function UserProfile({ user, teacher, rating, reviewCount }: UserProfileProps) {
  const [isEditProfileOpen, setEditProfileOpen] = useState(false);

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
    <>
      <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4 border-b border-dark/10 pb-6">
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center text-3xl font-bold text-amber-600 shrink-0">
              {user.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}

          <div className="flex flex-col items-center md:items-start gap-2">
            <h2 className="text-2xl font-bold">{user.name}</h2>

            <div className="flex items-center gap-3 text-sm text-gray-500 text-center md:text-left">
              {rating !== null && rating !== undefined && rating > 0 && (
                <>
                  <span className="flex items-center gap-1">
                    <InlineIcon icon="mdi:star" className="text-amber-400" width="18" />
                    <span className="font-semibold text-gray-800">{rating.toFixed(1).replace('.', ',')}</span>
                    {reviewCount !== undefined && <span>({reviewCount} avis)</span>}
                  </span>
                  <span className="text-gray-300">|</span>
                </>
              )}
              <span className="text-center md:text-left">Membre depuis {memberSince}</span>
            </div>

            {teacher?.description && <p>{teacher.description}</p>}

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Chip key={skill} className="text-chip-dark bg-chip-light" variant="flat" size="sm" radius="sm">
                    {skill}
                  </Chip>
                ))}
              </div>
            )}

            {graduations.length > 0 && (
              <ul className="flex flex-wrap gap-x-4 gap-y-1">
                {graduations.map((grad, i) => (
                  <li key={i} className="text-xs text-dark flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                    {grad}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <Button
          size="md"
          variant="flat"
          className="p-4 bg-secondary"
          onPress={() => setEditProfileOpen(true)}
          startContent={<Icon icon="mdi:pencil" width="16" />}
        >
          Modifier mes informations
        </Button>
      </div>
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        user={user}
        teacher={teacher}
      />
    </>
  );
}
