import { Link } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { authentifyUser } from '~/server/utils/authentify-user.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await authentifyUser(request, { redirectTo: '/auth' });
  return { user: session.user };
}

export function meta() {
  return [{ title: 'Maestroo - Accueil' }, { name: 'description', content: 'Votre musique commence ici.' }];
}

export default function Home() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Bienvenue !</h2>
        <p className="text-gray-500">Votre musique commence ici.</p>
        <Link
          to="/courses/create"
          className="mt-6 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-black transition-opacity hover:opacity-90"
        >
          + Créer un cours
        </Link>
      </div>
    </main>
  );
}
