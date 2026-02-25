import type { Route } from "./+types/page";
import { Link } from "react-router";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Maestroo - Accueil" },
    { name: "description", content: "Bienvenue sur Maestroo" },
  ];
}

export default function Home() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Bienvenue!</h2>
      <p className="text-gray-600">
        Vous êtes maintenant connecté à l'application.
      </p>
      <Link to="/courses/create">Créer un cours</Link>
    </div>
  );
}
