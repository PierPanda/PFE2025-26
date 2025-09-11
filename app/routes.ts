import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  // API Better Auth (doit être avant les autres routes)
  route("/api/auth/*", "routes/api/auth/$.tsx"),
  
  // Routes publiques (pas besoin d'authentification)
  layout("routes/layouts/PublicLayout.tsx", [
    route("/auth", "routes/auth/page.tsx"),
  ]),

  // Routes protégées (authentification requise)
  layout("routes/layouts/AuthLayout.tsx", [index("routes/home.tsx")]),

  // Route catch-all pour gérer les 404 et requêtes DevTools
  route("*", "routes/$.tsx"),
] satisfies RouteConfig;
