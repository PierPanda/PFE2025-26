import { auth } from '~/auth.server';
import { redirect, href } from 'react-router';

type AuthentifyUserOptions = {
  redirectTo?: string;
};

const SESSION_CACHE = Symbol('session');

export async function authentifyUser(request: Request, { redirectTo }: AuthentifyUserOptions = {}) {
  const cached = (request as any)[SESSION_CACHE];
  const session = cached ?? (await auth.api.getSession({ headers: request.headers }));

  if (!cached) {
    (request as any)[SESSION_CACHE] = session;
  }

  if (!session?.user) {
    if (redirectTo) {
      throw redirect(href(redirectTo as '/auth'));
    }
    throw new Response('Non authentifié', { status: 401 });
  }

  return session;
}

export default authentifyUser;
