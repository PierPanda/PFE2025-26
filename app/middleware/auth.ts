import { auth } from "~/lib/auth/config";
import { redirect } from "react-router";

export async function requireAuth(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    throw redirect("/auth");
  }

  return session;
}

export async function redirectIfAuthenticated(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session) {
    throw redirect("/");
  }

  return null;
}
