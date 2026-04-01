import { getCoursesPaginated, getCoursesPriceBounds } from '~/services/courses/get-courses-paginated';
import { getAppStats } from '~/services/stats/get-app-stats';
import { cursorPaginationSchema, validateSearchParams } from '~/lib/validation';
import type { LoaderFunctionArgs } from 'react-router';
import { Card, CardBody } from '@heroui/react';
import { authentifyUser } from '~/server/utils/authentify-user.server';
import { useFetcher, useLoaderData, useSearchParams } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import CourseCard from '~/components/ui/course-card';
import Filters from '~/components/dashboard/filters';
import Banner from '~/components/dashboard/banner';
import CoursesPagination from '~/components/dashboard/courses-pagination';
import heroBannerImage from '~/assets/images/silhouette-of-a-woman-with-raised-hands-on-a-conce-2026-01-09-08-42-41-utc.jpg';

import type { CourseCategory, CourseLevel } from '~/types/course';
import { SearchBar } from '~/components/dashboard/search-bar';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await authentifyUser(request, { redirectTo: '/auth' });

  const url = new URL(request.url);
  const rawPagination = validateSearchParams(url, cursorPaginationSchema);
  const pagination = { ...rawPagination, limit: COURSES_PER_PAGE };

  const category = (url.searchParams.get('category') as CourseCategory | null) ?? null;
  const level = (url.searchParams.get('level') as CourseLevel | null) ?? null;
  const minPrice = url.searchParams.get('minPrice');
  const maxPrice = url.searchParams.get('maxPrice');
  const search = url.searchParams.get('search');

  const [coursesPage, priceBounds, statsResult] = await Promise.all([
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
    getAppStats(),
  ]);

  return {
    user: session.user,
    coursesPage,
    filters: priceBounds,
    stats: statsResult.success ? statsResult.stats : { coursesCount: 0, teachersCount: 0, learnersCount: 0 },
  };
}

export function meta() {
  return [{ title: 'Maestroo - Accueil' }, { name: 'description', content: 'Votre musique commence ici.' }];
}

const HEADER_HEIGHT = 100;
const COURSES_PER_PAGE = 4;

export default function Home() {
  const initialData = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, user, stats } = initialData;
  const [coursesPage, setCoursesPage] = useState(initialData.coursesPage);
  const [currentPage, setCurrentPage] = useState(1);
  const minPrice = filters.minPrice ?? 0;
  const maxPrice = filters.maxPrice ?? 1000;
  const searchBarRef = useRef<HTMLInputElement>(null);
  const pendingPage = useRef<number | null>(null);
  const pageTokens = useRef<Record<number, string | null>>({
    1: null,
    2: initialData.coursesPage.nextCursor,
  });

  useEffect(() => {
    setCoursesPage(initialData.coursesPage);
    setCurrentPage(1);
    pendingPage.current = null;
    pageTokens.current = {
      1: null,
      2: initialData.coursesPage.nextCursor,
    };
  }, [initialData.coursesPage]);

  useEffect(() => {
    if (fetcher.data?.coursesPage) {
      setCoursesPage(fetcher.data.coursesPage);
      if (pendingPage.current !== null) {
        const targetPage = pendingPage.current;
        setCurrentPage(targetPage);
        pageTokens.current[targetPage + 1] = fetcher.data.coursesPage.nextCursor;
      }
      pendingPage.current = null;
    }
  }, [fetcher.data]);

  const isLoadingPage = fetcher.state !== 'idle';
  const totalPages = Math.max(1, Math.ceil(coursesPage.total / COURSES_PER_PAGE));

  const loadPage = (targetPage: number) => {
    pendingPage.current = targetPage;
    const nextParams = new URLSearchParams(searchParams);
    const targetCursor = targetPage === 1 ? null : pageTokens.current[targetPage];

    if (targetPage > 1 && !targetCursor) {
      pendingPage.current = null;
      return;
    }

    nextParams.set('index', '');

    if (targetCursor) {
      nextParams.set('cursor', targetCursor);
      nextParams.set('direction', 'next');
    } else {
      nextParams.delete('cursor');
      nextParams.delete('direction');
    }

    fetcher.load(`/?${nextParams.toString()}`);
  };

  const handlePaginationChange = (page: number) => {
    if (isLoadingPage || page === currentPage) return;

    loadPage(page);
  };

  const handleFindCourses = () => {
    const coursesSection = document.getElementById('courses');
    if (!coursesSection) return;

    const sectionTop = coursesSection.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: sectionTop - HEADER_HEIGHT, behavior: 'smooth' });
    setTimeout(() => {
      searchBarRef.current?.focus();
    }, 300);
  };

  return (
    <main className="mx-auto max-w-full px-14 py-10">
      <section
        className="relative h-180 rounded-2xl bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBannerImage})` }}
      >
        <div className="absolute inset-0 rounded-2xl bg-black/45" />
        <div className="relative z-10 flex h-full items-center justify-center">
          <Banner userName={user?.name} stats={stats} onFindCourses={handleFindCourses} />
        </div>
      </section>
      <section id="courses" className="mt-48">
        <Card radius="lg" shadow="none">
          <CardBody className="p-6 md:p-8 bg-tertiary">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-tertiary">Cours disponibles</h2>
                <p className="text-sm text-tertiary">
                  {coursesPage.total} résultat
                  {coursesPage.total > 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <SearchBar ref={searchBarRef} searchParams={searchParams} setSearchParams={setSearchParams} />
                <Filters
                  searchParams={searchParams}
                  setSearchParams={setSearchParams}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                />
              </div>
            </div>

            {coursesPage.items.length === 0 ? (
              <p className="py-10 text-center text-default-500">Aucun cours disponible pour le moment.</p>
            ) : (
              <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {coursesPage.items.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </ul>
            )}
          </CardBody>
          <CoursesPagination
            currentPage={currentPage}
            totalPages={totalPages}
            isLoading={isLoadingPage}
            onPageChange={handlePaginationChange}
          />
        </Card>
      </section>
    </main>
  );
}
