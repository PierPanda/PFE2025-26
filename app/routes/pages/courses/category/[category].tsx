import type { Route } from './+types/[category]';
import { authentifyUser } from '~/server/utils/authentify-user';
import { cursorPaginationSchema, validateSearchParams } from '~/lib/validation';
import { getCoursesPaginated, getCoursesPriceBounds } from '~/services/courses/get-courses-paginated';
import type { CourseCategory, CourseLevel } from '~/types/course';
import { Card, CardBody } from '@heroui/react';
import { useFetcher, useLoaderData, useSearchParams } from 'react-router';
import { useRef, useState } from 'react';
import CourseCard from '~/components/ui/course-card';
import Filters from '~/components/dashboard/filters';
import CoursesPagination from '~/components/dashboard/courses-pagination';
import { SearchBar } from '~/components/dashboard/search-bar';

const ALL_COURSES_PER_PAGE = 12;

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await authentifyUser(request, { redirectTo: '/auth' });

  const url = new URL(request.url);
  const rawPagination = validateSearchParams(url, cursorPaginationSchema);
  const pagination = { ...rawPagination, limit: ALL_COURSES_PER_PAGE };

  const category = (params.category as CourseCategory | null) ?? null;
  const level = (url.searchParams.get('level') as CourseLevel | null) ?? null;
  const minPrice = url.searchParams.get('minPrice');
  const maxPrice = url.searchParams.get('maxPrice');
  const search = url.searchParams.get('search');

  const [coursesPage, priceBounds] = await Promise.all([
    getCoursesPaginated(
      {
        category,
        level,
        minPrice,
        maxPrice,
        search,
      },
      pagination,
    ),
    getCoursesPriceBounds(),
  ]);

  return {
    user: session.user,
    coursesPage,
    filters: priceBounds,
    category,
    level,
    minPrice,
    maxPrice,
    search,
  };
}

export function meta({ data }: Route.MetaArgs) {
  const categoryLabel = data?.category ? ` - ${data.category.charAt(0).toUpperCase() + data.category.slice(1)}` : '';
  return [{ title: `Tous les cours${categoryLabel} | Maestroo` }];
}

export default function CategoryCoursesPage() {
  const { coursesPage, filters, category, user } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const searchBarRef = useRef<HTMLInputElement>(null);

  type LoaderData = typeof loader;
  const coursesData = (fetcher.data as Awaited<ReturnType<LoaderData>> | undefined) ?? {
    coursesPage,
  };
  const displayCourses = coursesData.coursesPage ?? coursesPage;

  const isLoadingPage = fetcher.state !== 'idle';

  const loadPage = (targetCursor: string | null) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('index', '');

    if (targetCursor) {
      nextParams.set('cursor', targetCursor);
      nextParams.set('direction', 'next');
    } else {
      nextParams.delete('cursor');
      nextParams.delete('direction');
    }

    fetcher.load(`/cours/${category}?${nextParams.toString()}`);
  };

  const handlePaginationChange = (page: number) => {
    if (isLoadingPage || page === currentPage) return;

    loadPage(page === 1 ? null : displayCourses.nextCursor);
  };

  const categoryLabel = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Tous les cours';

  return (
    <main className="mx-auto max-w-full px-14 py-2">
      <section id="all-courses" className="mt-10">
        <Card radius="lg" shadow="none">
          <CardBody className="p-6 md:p-8 bg-tertiary">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-dark">Cours de {categoryLabel}</h2>
                <p className="text-lg text-dark/60">{String(displayCourses.total).padStart(2, '0')} résultats</p>
              </div>
              <div className="flex gap-2">
                <SearchBar ref={searchBarRef} searchParams={searchParams} setSearchParams={setSearchParams} />
                <Filters
                  searchParams={searchParams}
                  setSearchParams={setSearchParams}
                  minPrice={filters.minPrice}
                  maxPrice={filters.maxPrice}
                />
              </div>
            </div>

            {displayCourses.items.length === 0 ? (
              <p className="py-10 text-center text-default-500">Aucun cours disponible pour le moment.</p>
            ) : (
              <>
                <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-8">
                  {displayCourses.items.map((course) => (
                    <CourseCard key={course.id} course={course} currentUserId={user.id} />
                  ))}
                </ul>

                <CoursesPagination
                  onPageChange={handlePaginationChange}
                  isLoading={isLoadingPage}
                  totalPages={displayCourses.total > 0 ? Math.ceil(displayCourses.total / ALL_COURSES_PER_PAGE) : 1}
                  currentPage={currentPage}
                />
              </>
            )}
          </CardBody>
        </Card>
      </section>
    </main>
  );
}
