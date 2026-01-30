import { Outlet } from "react-router";

export function AuthLayout() {
  // La vérification d'authentification se fait dans le loader de chaque route
  // Si on arrive ici, c'est que l'utilisateur est authentifié
  return <Outlet />;
}
