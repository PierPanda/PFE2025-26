import { useLoaderData } from "react-router";
import type { AuthState } from "../types/user";

export function useAuth(): AuthState {
  try {
    const data = useLoaderData() as { user?: any };
    
    return {
      user: data?.user || null,
      session: null,
      isLoading: false,
      isAuthenticated: !!data?.user,
      error: null,
    };
  } catch {
    // Si on ne peut pas accéder aux données du loader, on est pas authentifié
    return {
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    };
  }
}
