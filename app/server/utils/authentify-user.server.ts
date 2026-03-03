import { auth } from '~/auth.server';
import { redirect, href } from 'react-router';

type AuthentifyUserOptions = {
  redirectTo?: string;
};

/**
 * Vérifie l'authentification de l'utilisateur.
 * À utiliser dans chaque loader qui nécessite une authentification.
 *
 * @param request - La requête HTTP
 * @param options - Options de configuration
 * @returns La session de l'utilisateur authentifié
 * @throws Redirect vers la page de login ou Response 401
 */

export async function authentifyUser(request: Request, { redirectTo }: AuthentifyUserOptions = {}) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    if (redirectTo) {
      throw redirect(href(redirectTo as '/auth'));
    }
    throw new Response('Non authentifié', { status: 401 });
  }

  return session;
}

export default authentifyUser;
