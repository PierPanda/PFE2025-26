import { Outlet } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { checkPermission } from '~/server/utils/check-permission';

export async function loader({ request }: LoaderFunctionArgs) {
  return await checkPermission(request, {
    requiredPermissions: ['teacher'],
    redirectTo: '/',
  });
}

export default function TeacherLayout() {
  return <Outlet />;
}
