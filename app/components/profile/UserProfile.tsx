import { Button } from '@heroui/react';
import type { DbUser } from '~/services/types';

export default function UserProfile({ user }: { user: DbUser }) {
  return (
    <div className="flex w-full items-center">
      <div className="flex flex-col gap-2 items-start justify-between w-full">
        {user.image ? (
          <img src={user.image} alt={user.name} className="w-15 h-15 rounded-full" />
        ) : (
          <div className="w-15 h-15 rounded-full bg-amber-100 flex items-center justify-center text-lg font-bold text-amber-600">
            {user.name?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
        <h2 className="text-2xl font-bold">{user.name}</h2>
      </div>
      <Button radius="sm" color="default">
        Paramètres du profil
      </Button>
    </div>
  );
}
