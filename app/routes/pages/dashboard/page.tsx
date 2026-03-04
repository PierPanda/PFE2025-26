import { Link } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { authentifyUser } from '~/server/utils/authentify-user.server';
import type { Route } from './+types/page';
import { useLoaderData, useSearchParams } from 'react-router';
import CourseCard from '~/components/ui/CourseCard';
import { Filters } from '~/components/dashboard/Filters';

export async function loader({ request }: Route.LoaderArgs) {
  const session = await authentifyUser(request, { redirectTo: '/auth' });

  const url = new URL(request.url);
  const category = url.searchParams.get('category') ?? undefined;
  const level = url.searchParams.get('level') ?? undefined;
  const minPrice = url.searchParams.get('minPrice') ?? undefined;
  const maxPrice = url.searchParams.get('maxPrice') ?? undefined;

  const apiUrl = new URL('/api/courses', request.url);
  if (category) apiUrl.searchParams.append('category', category);
  if (level) apiUrl.searchParams.append('level', level);
  if (minPrice) apiUrl.searchParams.append('minPrice', minPrice);
  if (maxPrice) apiUrl.searchParams.append('maxPrice', maxPrice);
  const result = await fetch(apiUrl)
    .then((res) => res.json())
    .catch((error) => {
      console.error('Error fetching courses:', error);
      return { success: false, courses: [] };
    });

  return {
    user: session.user,
    courses: result.courses,
    filters: result.filters,
  };
}

export function meta() {
  return [{ title: 'Maestroo - Accueil' }, { name: 'description', content: 'Votre musique commence ici.' }];
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { courses, filters } = useLoaderData();
  const minPrice = filters?.minPrice ?? 0;
  const maxPrice = filters?.maxPrice ?? 1000;

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="rounded-2xl bg-brand/10 p-8 shadow-sm">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Bienvenue !</h2>
        <p className="text-gray-500">Votre musique commence ici.</p>
        <Link
          to="/courses/create"
          className="mt-6 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-black transition-opacity hover:opacity-90"
        >
          + Créer un cours
        </Link>
      </div>
      <>
        <Filters
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          minPrice={minPrice}
          maxPrice={maxPrice}
        />
        {courses?.length === 0 ? (
          <p className="text-center text-gray-500">Aucun cours disponible pour le moment.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {courses.map((course: any) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </ul>
        )}
      </>
    </main>
  );
}
