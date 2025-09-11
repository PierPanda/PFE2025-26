import React from "react";
import { useAuth } from "~/hooks/useAuth";
import { signOut } from "~/lib/auth/client";

export function UserProfile() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
      {user.image && (
        <img
          src={user.image}
          alt={user.name}
          className="w-10 h-10 rounded-full"
        />
      )}
      <div className="flex-1">
        <p className="font-medium text-gray-900">{user.name}</p>
        <p className="text-sm text-gray-600">{user.email}</p>
      </div>
      <button
        onClick={handleSignOut}
        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Se déconnecter
      </button>
    </div>
  );
}
