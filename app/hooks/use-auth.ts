import { useLoaderData } from "react-router";
import type { AuthState, User } from "../types/user";

export function useAuth(): AuthState {
  try {
    const data = useLoaderData() as { user?: User };

    return {
      user: data?.user || null,
      session: null,
      isLoading: false,
      isAuthenticated: !!data?.user,
      error: null,
    };
  } catch {
    return {
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    };
  }
}
