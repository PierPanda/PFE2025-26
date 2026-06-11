import { getCoursesPaginated, getCoursesPriceBounds } from '~/services/courses/get-courses-paginated';
import { authentifyUser } from '~/server/utils/authentify-user';
import type { LoaderFunctionArgs } from 'react-router';
import { Card, CardBody, Spinner } from '@heroui/react';
import { useLoaderData, useNavigation, useSearchParams } from 'react-router';
import { SearchBar } from '~/components/dashboard/search-bar';
import Filters from '~/components/dashboard/filters';
import CourseCard from '~/components/ui/course-card';
import CoursesPagination from '~/components/dashboard/courses-pagination';
import type { CourseCategory, CourseLevel } from '~/types/course';

const ALL_COURSES_PER_PAGE = 12;

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await authentifyUser(request, { redirectTo: '/auth' });

  const url = new URL(request.url);
  const rawPage = Number(url.searchParams.get('page') ?? '1');
  const page = Math.max(1, Number.isNaN(rawPage) ? 1 : rawPage);

  const category = (url.searchParams.get('category') as CourseCategory | null) ?? null;
  const level = (url.searchParams.get('level') as CourseLevel | null) ?? null;
  const minPrice = url.searchParams.get('minPrice');
  const maxPrice = url.searchParams.get('maxPrice');
  const search = url.searchParams.get('search');

  const [coursesPage, priceBounds] = await Promise.all([
    getCoursesPaginated({ category, level, minPrice, maxPrice, search }, { page, limit: ALL_COURSES_PER_PAGE }),
    getCoursesPriceBounds(),
  ]);

  return {
    user: session.user,
    coursesPage,
    filters: priceBounds,
    currentPage: page,
  };
}

export function meta() {
  return [{ title: 'Maestroo - Cours' }, { name: 'description', content: 'Recherchez parmi nos cours.' }];
}

export default function CoursesListing() {
  const { coursesPage, filters, user, currentPage } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();

  const isLoading = navigation.state !== 'idle';
  const totalPages = Math.max(1, Math.ceil(coursesPage.total / ALL_COURSES_PER_PAGE));

  const handlePaginationChange = (page: number) => {
    if (page === currentPage) return;

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (page === 1) {
        next.delete('page');
      } else {
        next.set('page', String(page));
      }
      return next;
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="mx-auto max-w-screen-2xl p-4 md:px-14 md:py-2">
      <section id="all-courses" className="mt-10">
        <Card radius="lg" shadow="none">
          <CardBody className="p-0 md:p-8 bg-tertiary">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-dark">Liste des cours</h2>
                <p className="mt-1 text-sm text-dark/50">{String(coursesPage.total)} résultats</p>
              </div>
              <div className="flex gap-2">
                <SearchBar searchParams={searchParams} setSearchParams={setSearchParams} />
                <Filters
                  searchParams={searchParams}
                  setSearchParams={setSearchParams}
                  minPrice={filters.minPrice ?? 0}
                  maxPrice={filters.maxPrice ?? 1000}
                />
              </div>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <Spinner size="lg" color="primary" />
              </div>
            )}

            {!isLoading && coursesPage.items.length === 0 && (
              <p className="py-10 text-center text-default-500">Aucun cours disponible pour le moment.</p>
            )}

            {!isLoading && coursesPage.items.length > 0 && (
              <>
                <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-8">
                  {coursesPage.items.map((course) => (
                    <CourseCard key={course.id} course={course} currentUserId={user.id} />
                  ))}
                </ul>

                <CoursesPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  isLoading={isLoading}
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
