import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  // API Routes
  route("/api/auth/*", "routes/_api/auth/$.tsx"),
  route("/api/courses", "routes/_api/courses/route.tsx"),
  route("/api/teachers", "routes/_api/teachers/route.tsx"),

  // Public Pages
  layout("routes/layouts/PublicLayout.tsx", [
    route("/auth", "routes/pages/auth/page.tsx"),
  ]),

  // Authenticated Pages
  layout("routes/layouts/AuthLayout.tsx", [
    index("routes/pages/dashboard/page.tsx"),
    route("/courses/create", "routes/pages/courses/create.tsx"),
  ]),

  // Catch-all
  route("*", "routes/$.tsx"),
] satisfies RouteConfig;
