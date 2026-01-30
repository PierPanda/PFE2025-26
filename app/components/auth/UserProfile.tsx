import { useState } from "react";
import { useNavigate } from "react-router";
import { signOut } from "../../server/lib/auth/client";
import { useAuth } from "../../hooks/useAuth";

export function UserProfile() {
  const { user, isLoading } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center space-x-4 p-4 rounded-lg">
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
        disabled={isSigningOut}
        className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isSigningOut ? "Déconnexion..." : "Se déconnecter"}
      </button>
    </div>
  );
}
