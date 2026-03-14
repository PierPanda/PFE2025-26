import { redirect } from 'react-router';
import { authentifyUser } from '~/server/utils/authentify-user.server';
import { getTeacherByUserId } from '~/services/teachers/get-teacher';

/**
 * Les permissions sont vérifiées de deux façons distinctes et intentionnelles :
 * - 'admin'   → via session.user.role (géré par le plugin better-auth admin)
 * - 'teacher' → via l'existence d'un profil en base (un user peut être teacher ET learner simultanément,
 *               ce qui rend impossible le stockage dans user.role qui est un champ unique)
 */
type Permission = 'teacher' | 'admin';

type CheckPermissionOptions = {
  requiredPermissions: Permission[];
  redirectTo: string;
};

export async function checkPermission(request: Request, { requiredPermissions, redirectTo }: CheckPermissionOptions) {
  const session = await authentifyUser(request, { redirectTo: '/auth' });

  if (requiredPermissions.includes('teacher')) {
    const result = await getTeacherByUserId(session.user.id);
    if (!result.success) {
      throw new Error('Failed to check teacher permissions');
    }
    if (result.teacher !== null) {
      return { user: session.user, session: session.session };
    }
  }

  if (requiredPermissions.includes('admin') && session.user.role === 'admin') {
    return { user: session.user, session: session.session };
  }

  throw redirect(redirectTo);
}
