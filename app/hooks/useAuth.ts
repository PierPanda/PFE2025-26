import { useSession as useBetterAuthSession } from "~/lib/auth/client";

export function useAuth() {
  const { data: session, isPending, error } = useBetterAuthSession();

  return {
    user: session?.user || null,
    session,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
    error,
  };
}
