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
    <div className="min-h-screen bg-brand/10">
      <header className="sticky top-0 z-50 bg-white p-2">
        <div className="flex h-16 w-full items-center justify-between px-12">
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
