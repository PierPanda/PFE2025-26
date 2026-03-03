import { Outlet, Link } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { authentifyUser } from '~/server/utils/authentify-user.server';
import { UserProfile } from '~/components/auth/user-profile';
import logo from '~/assets/images/LOGO_MAESTROO.png';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await authentifyUser(request, { redirectTo: '/auth' });
  return { user: session.user };
}

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white border-b-2 border-brand">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="shrink-0">
            <img src={logo} alt="Maestroo" className="h-9 w-auto" />
          </Link>

          <div className="flex items-center gap-4">
            <UserProfile />
          </div>
        </div>
      </header>

      <Outlet />
    </div>
  );
}
