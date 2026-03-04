import type { LoaderFunctionArgs } from 'react-router';
import { Card, CardBody } from '@heroui/react';
import { authentifyUser } from '~/server/utils/authentify-user.server';
import { useLoaderData, useSearchParams } from 'react-router';
import CourseCard from '~/components/ui/course-card';
import Filters from '~/components/dashboard/filters';
import Banner from '~/components/dashboard/banner';
import { getCourses } from '~/services/courses/get-courses.server';
import { getAppStats } from '~/services/stats/get-app-stats.server';
import type { CourseWithTeacher } from '~/services/types';
import type { CourseCategory, CourseLevel } from '~/types/course';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await authentifyUser(request, { redirectTo: '/auth' });

  const url = new URL(request.url);
  const category = (url.searchParams.get('category') as CourseCategory | undefined) ?? undefined;
  const level = (url.searchParams.get('level') as CourseLevel | undefined) ?? undefined;
  const minPrice = url.searchParams.get('minPrice') ?? undefined;
  const maxPrice = url.searchParams.get('maxPrice') ?? undefined;

  const [result, statsResult] = await Promise.all([getCourses(category, level, minPrice, maxPrice), getAppStats()]);

  return {
    user: session.user,
    courses: result.success ? result.courses : [],
    filters: result.success ? result.filters : undefined,
    stats: statsResult.success ? statsResult.stats : { coursesCount: 0, teachersCount: 0, learnersCount: 0 },
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
                {courses.map((course: CourseWithTeacher) => (
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
