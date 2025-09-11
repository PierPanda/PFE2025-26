import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { useAuth } from "~/hooks/useAuth";
import { UserProfile } from "~/components/auth/UserProfile";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const { isAuthenticated, user, isLoading } = useAuth();

  return (
    <div>
      <div className="p-4 border-b">
        {isLoading ? (
          <div>Chargement de l'état d'authentification...</div>
        ) : isAuthenticated ? (
          <UserProfile />
        ) : (
          <div className="text-center">
            <p className="mb-4">Vous n'êtes pas connecté.</p>
            <Link
              to="/auth"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Se connecter
            </Link>
          </div>
        )}
      </div>
      <Welcome />
    </div>
  );
}
