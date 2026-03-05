import { Button } from '@heroui/react';

export default function UserProfileCard({ user }: { user: any }) {
  return (
    <div className="flex w-full items-center">
      <div className="flex flex-col gap-2 items-start justify-between w-full">
        <img src={user.image || undefined} alt="Profile" className="w-15 h-15 rounded-full" />
        <h2 className="text-2xl font-bold">{user.name}</h2>
      </div>
      <Button radius="sm" color="default">
        Paramètres du profil
      </Button>
    </div>
  );
}
