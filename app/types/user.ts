import type { InferSelectModel } from 'drizzle-orm';
import type { user, session } from '../server/lib/db/schema';

export type User = InferSelectModel<typeof user>;
export type Session = InferSelectModel<typeof session>;

export type AuthState = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
};
