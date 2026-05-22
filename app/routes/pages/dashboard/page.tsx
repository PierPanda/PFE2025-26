import { getPopularCourses, getTopRatedCourses, getNewestCourses } from '~/services/courses/get-courses';
import { getAppStats } from '~/services/stats/get-app-stats';
import type { LoaderFunctionArgs } from 'react-router';
import { Card, CardBody } from '@heroui/react';
import { authentifyUser } from '~/server/utils/authentify-user';
import { useLoaderData, useNavigate } from 'react-router';
import { useState } from 'react';
import CourseCard from '~/components/ui/course-card';
import Banner from '~/components/dashboard/banner';

import { InlineIcon } from '@iconify/react';

const HIGHLIGHT_COURSES_PER_SECTION = 4;

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await authentifyUser(request, { redirectTo: '/auth' });

  const [popularCourses, topRatedCourses, newestCourses, statsResult] = await Promise.all([
    getPopularCourses(HIGHLIGHT_COURSES_PER_SECTION),
    getTopRatedCourses(HIGHLIGHT_COURSES_PER_SECTION),
    getNewestCourses(HIGHLIGHT_COURSES_PER_SECTION),
    getAppStats(),
  ]);

  return {
    user: session.user,
    popularCourses,
    topRatedCourses,
    newestCourses,
    stats: statsResult.success ? statsResult.stats : { coursesCount: 0, teachersCount: 0, learnersCount: 0 },
  };
}

export function meta() {
  return [{ title: 'Maestroo - Accueil' }, { name: 'description', content: 'Votre musique commence ici.' }];
}

export default function Home() {
  const initialData = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { user, stats, popularCourses, topRatedCourses, newestCourses } = initialData;
  const [searchParams, setSearchParams] = useState(new URLSearchParams());

  const handleFindCourses = () => {
    navigate(`/search?${searchParams.toString()}`);
  };

  return (
    <main className="mx-auto max-w-screen-2xl px-14 py-8 pb-20 md:px-14">
      <Banner
        userName={user?.name}
        stats={stats}
        onFindCourses={handleFindCourses}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
      />

      <section id="popular-courses" className="mt-14">
        <Card radius="lg" shadow="none">
          <CardBody className="bg-tertiary p-6 md:p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-dark">
                <InlineIcon icon="tabler:flame-filled" className="mr-2 inline-block align-middle text-orange-500" />
                Cours populaires
              </h2>
            </div>

            {popularCourses.length === 0 ? (
              <p className="py-10 text-center text-default-500">Aucun cours populaire disponible pour le moment.</p>
            ) : (
              <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {popularCourses.map((course) => (
                  <CourseCard key={course.id} course={course} currentUserId={user.id} />
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </section>

      <section id="top-rated-courses" className="mt-8 md:mt-16">
        <Card radius="lg" shadow="none">
          <CardBody className="bg-tertiary  p-0 md:p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-dark">Cours les mieux notés</h2>
            </div>

            {topRatedCourses.length === 0 ? (
              <p className="py-10 text-center text-default-500">Aucun cours noté pour le moment.</p>
            ) : (
              <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {topRatedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} currentUserId={user.id} />
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </section>

      {/* Section: Nouveautés (cours les plus récents) */}
      <section id="new-courses" className="mt-8 md:mt-16">
        <Card radius="lg" shadow="none">
          <CardBody className="bg-tertiary p-0 md:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-dark">Nouveautés</h2>
            </div>

            {newestCourses.length === 0 ? (
              <p className="py-10 text-center text-default-500">Aucune nouveauté pour le moment.</p>
            ) : (
              <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {newestCourses.map((course) => (
                  <CourseCard key={course.id} course={course} currentUserId={user.id} />
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </section>
    </main>
  );
}
