import type { Route } from "./+types/page";
import { Link } from "react-router";
import { authentifyUser } from "~/server/utils/authentify-user.server";
import { UserProfile } from "~/components/auth/user-profile";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await authentifyUser(request, { redirectTo: "/auth" });
  return { user: session.user };
}

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Simulator - Accueil" },
    { name: "description", content: "Bienvenue sur Imulator!" },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Maestr👀</h1>
            <UserProfile />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Bienvenue!
          </h2>
          <p className="text-gray-600">
            Vous êtes maintenant connecté à l'application.
          </p>
          <Link to="/courses/create">Créer un cours</Link>
        </div>
      </main>
    </div>
  );
}
