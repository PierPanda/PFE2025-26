import type { LoaderFunctionArgs } from 'react-router';
import { Card, CardBody } from '@heroui/react';
import { authentifyUser } from '~/server/utils/authentify-user.server';
import { useLoaderData, useSearchParams } from 'react-router';
import CourseCard from '~/components/ui/course-card';
import Filters from '~/components/dashboard/filters';
import Banner from '~/components/dashboard/banner';

export async function loader({ request }: LoaderFunctionArgs) {
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

  const statsApiUrl = new URL('/api/stats', request.url);

  const [result, statsResult] = await Promise.all([
    fetch(apiUrl)
      .then((res) => res.json())
      .catch((error) => {
        console.error('Error fetching courses:', error);
        return { success: false, courses: [] };
      }),
    fetch(statsApiUrl)
      .then((res) => res.json())
      .catch((error) => {
        console.error('Error fetching stats:', error);
        return {
          success: false,
          stats: { coursesCount: 0, teachersCount: 0, learnersCount: 0 },
        };
      }),
  ]);

  return {
    user: session.user,
    courses: result.courses,
    filters: result.filters,
    stats: statsResult.stats ?? {
      coursesCount: 0,
      teachersCount: 0,
      learnersCount: 0,
    },
  };
}

export function meta() {
  return [{ title: 'Maestroo - Accueil' }, { name: 'description', content: 'Votre musique commence ici.' }];
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { courses, filters, user, stats } = useLoaderData<typeof loader>();
  const minPrice = filters?.minPrice ?? 0;
  const maxPrice = filters?.maxPrice ?? 1000;

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <Banner userName={user?.name} stats={stats} />

      <section id="courses" className="mt-48">
        <Card radius="lg" shadow="none">
          <CardBody className="p-6 md:p-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Cours disponibles</h2>
                <p className="text-sm text-default-500">
                  {courses?.length ?? 0} résultat
                  {(courses?.length ?? 0) > 1 ? 's' : ''}
                </p>
              </div>

              <Filters
                searchParams={searchParams}
                setSearchParams={setSearchParams}
                minPrice={minPrice}
                maxPrice={maxPrice}
              />
            </div>

            {courses?.length === 0 ? (
              <p className="py-10 text-center text-default-500">Aucun cours disponible pour le moment.</p>
            ) : (
              <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {courses.map((course: any) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </section>
    </main>
  );
}
