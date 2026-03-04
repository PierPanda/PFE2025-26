import { useRouteLoaderData } from 'react-router';
import type { AuthState, Session, User } from '../types/user';

export function useAuth(): AuthState {
  const data = useRouteLoaderData('routes/layouts/auth-layout') as { user?: User; session?: Session } | undefined;

  return {
    user: data?.user ?? null,
    session: data?.session ?? null,
    isLoading: false,
    isAuthenticated: !!data?.user,
    error: null,
  };
}
