import type { Route } from './+types/pages';
import { Card, CardBody } from '@heroui/react';
import { useFetcher, useLoaderData, useSearchParams } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import { SearchBar } from '~/components/dashboard/search-bar';
import Filters from '~/components/dashboard/filters';
import CourseCard from '~/components/ui/course-card';
import CoursesPagination from '~/components/dashboard/courses-pagination';
import { getCoursesPaginated, getCoursesPriceBounds } from '~/services/courses/get-courses-paginated';
import { authentifyUser } from '~/server/utils/authentify-user';
import type { CourseLevel, CourseCategory } from '~/types/course';
import { cursorPaginationSchema, validateSearchParams } from '~/lib/validation';

const ALL_COURSES_PER_PAGE = 16;

export async function loader({ request }: Route.LoaderArgs) {
  const session = await authentifyUser(request, { redirectTo: '/auth' });

  const url = new URL(request.url);
  const rawPagination = validateSearchParams(url, cursorPaginationSchema);
  const pagination = { ...rawPagination, limit: ALL_COURSES_PER_PAGE };

  const category = (url.searchParams.get('category') as CourseCategory | null) ?? null;
  const level = (url.searchParams.get('level') as CourseLevel | null) ?? null;
  const minPrice = url.searchParams.get('minPrice');
  const maxPrice = url.searchParams.get('maxPrice');
  const search = url.searchParams.get('search');

  const [coursesPage, priceBounds] = await Promise.all([
    getCoursesPaginated({ category, level, minPrice, maxPrice, search }, pagination),
    getCoursesPriceBounds(),
  ]);

  return {
    user: session.user,
    coursesPage,
    filters: priceBounds,
  };
}

export function meta() {
  return [{ title: 'Maestroo - Recherche' }, { name: 'description', content: 'Recherchez parmi nos cours.' }];
}

type LoaderData = typeof loader;

export default function SearchPage() {
  const { user, coursesPage: initialCoursesPage, filters } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);

  const pendingPage = useRef<number | null>(null);
  const pageTokens = useRef<Record<number, string | null>>({
    1: null,
    2: initialCoursesPage.nextCursor,
  });

  useEffect(() => {
    setCurrentPage(1);
    pendingPage.current = null;
    pageTokens.current = { 1: null, 2: initialCoursesPage.nextCursor };
  }, [initialCoursesPage]);

  useEffect(() => {
    if (fetcher.data?.coursesPage && pendingPage.current !== null) {
      const loadedPage = pendingPage.current;
      setCurrentPage(loadedPage);
      pageTokens.current[loadedPage + 1] = (fetcher.data as Awaited<ReturnType<LoaderData>>).coursesPage.nextCursor;
      pendingPage.current = null;
    }
  }, [fetcher.data]);

  const coursesPage = (fetcher.data as Awaited<ReturnType<LoaderData>> | undefined)?.coursesPage ?? initialCoursesPage;

  const isLoadingPage = fetcher.state !== 'idle';
  const totalPages = coursesPage.total > 0 ? Math.ceil(coursesPage.total / ALL_COURSES_PER_PAGE) : 1;

  const loadPage = (targetPage: number) => {
    const cursor = pageTokens.current[targetPage];
    if (targetPage > 1 && cursor === undefined) return;

    pendingPage.current = targetPage;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('index', '');

    if (cursor) {
      nextParams.set('cursor', cursor);
      nextParams.set('direction', 'next');
    } else {
      nextParams.delete('cursor');
      nextParams.delete('direction');
    }

    fetcher.load(`/search?${nextParams.toString()}`);
  };

  const handlePaginationChange = (page: number) => {
    if (isLoadingPage || page === currentPage) return;
    loadPage(page);
  };

  return (
    <main className="mx-auto max-w-screen-2xl p-4 md:px-14 md:py-2">
      <section id="all-courses" className="mt-10">
        <Card radius="lg" shadow="none">
          <CardBody className="p-0 md:p-8 bg-tertiary">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-dark">Listes des cours</h2>
                <p className="mt-1 text-sm text-dark/50">{String(coursesPage.total).padStart(2, '0')} résultats</p>
              </div>
              <div className="flex gap-2">
                <SearchBar searchParams={searchParams} setSearchParams={setSearchParams} />
                <Filters
                  searchParams={searchParams}
                  setSearchParams={setSearchParams}
                  minPrice={filters.minPrice}
                  maxPrice={filters.maxPrice}
                />
              </div>
            </div>

            {coursesPage.items.length === 0 ? (
              <p className="py-10 text-center text-default-500">Aucun cours disponible pour le moment.</p>
            ) : (
              <>
                <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-8">
                  {coursesPage.items.map((course) => (
                    <CourseCard key={course.id} course={course} currentUserId={user.id} />
                  ))}
                </ul>

                <CoursesPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  isLoading={isLoadingPage}
                  onPageChange={handlePaginationChange}
                />
              </>
            )}
          </CardBody>
        </Card>
      </section>
    </main>
  );
}
