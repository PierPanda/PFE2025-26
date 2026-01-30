import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  route("/api/auth/*", "routes/api/auth/$.tsx"),

  layout("routes/layouts/PublicLayout.tsx", [
    route("/auth", "routes/auth/page.tsx"),
  ]),

  layout("routes/layouts/AuthLayout.tsx", [index("routes/home.tsx")]),

  route("*", "routes/$.tsx"),
] satisfies RouteConfig;
