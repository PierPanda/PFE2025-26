import type { Route } from "./+types/home";
import { redirect } from "react-router";
import { auth } from "../server/lib/auth";
import { UserProfile } from "../components/auth/UserProfile";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      throw redirect("/auth");
    }

    return { user: session.user };
  } catch (error) {
    throw redirect("/auth");
  }
}

export function meta({}: Route.MetaArgs) {
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
        </div>
      </main>
    </div>
  );
}
