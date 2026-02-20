import { redirect } from "react-router";
import { auth } from "~/server/lib/auth.server";

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
};

export type AuthResult = {
  user: AuthenticatedUser;
  session: Awaited<ReturnType<typeof auth.api.getSession>>;
};

/**
 * Authenticate user from request headers
 * Throws redirect to /auth if not authenticated
 */
export async function authenticateUser(
  request: Request,
  redirectTo = "/auth",
): Promise<AuthResult> {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      throw redirect(redirectTo);
    }

    return {
      user: session.user as AuthenticatedUser,
      session,
    };
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    console.error("Authentication error:", error);
    throw redirect(redirectTo);
  }
}

/**
 * Get optional user session (doesn't throw if not authenticated)
 */
export async function getOptionalUser(
  request: Request,
): Promise<AuthResult | null> {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return null;
    }

    return {
      user: session.user as AuthenticatedUser,
      session,
    };
  } catch (error) {
    console.error("Error getting optional user:", error);
    return null;
  }
}

/**
 * Check if user is authenticated (boolean check)
 */
export async function isAuthenticated(request: Request): Promise<boolean> {
  const result = await getOptionalUser(request);
  return result !== null;
}
