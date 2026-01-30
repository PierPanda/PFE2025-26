export type User = {
  id: string;
  name: string;
  email: string;
  image?: string;
};

export type AuthState = {
  user: User | null;
  session: unknown;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: any;
};
