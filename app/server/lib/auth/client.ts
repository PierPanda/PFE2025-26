import { createAuthClient } from "better-auth/react";
import { env } from "../../utils/env";

export const { signIn, signUp, signOut, useSession, getSession } = createAuthClient({
  baseURL: env.BETTER_AUTH_URL,
  basePath: "/api/auth", // Doit correspondre au serveur
});
