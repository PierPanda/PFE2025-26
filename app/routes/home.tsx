import type { Route } from './+types/home';
import { redirect } from 'react-router';
import { auth } from '../server/lib/auth';
import { UserProfile } from '../components/auth/UserProfile';

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      throw redirect('/auth');
    }

    return { user: session.user };
  } catch {
    throw redirect('/auth');
  }
}

export function meta(_args: Route.MetaArgs) {
  return [{ title: 'Accueil' }, { name: 'description', content: 'Bienvenue sur Imulator!' }];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold text-gray-900">Maestr👀</h1>
            <UserProfile />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Bienvenue!</h2>
          <p className="text-gray-600">Vous êtes maintenant connecté à l'application.</p>
        </div>
      </main>
    </div>
  );
}
