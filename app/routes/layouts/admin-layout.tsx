import { Outlet } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { checkPermission } from '~/server/utils/check-permission';

export async function loader({ request }: LoaderFunctionArgs) {
  return await checkPermission(request, {
    requiredPermissions: ['admin'],
    redirectTo: '/',
  });
}

export default function AdminLayout() {
  return <Outlet />;
}
