import { and, desc, eq, gte, ilike, inArray, lte, max, min, sql } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { bookings, courses } from '~/server/lib/db/schema';
import type { CourseCategory, CourseLevel } from '~/types/course';
import type { PaginatedResponse } from '~/types/pagination';
import type { CourseWithTeacherAndRatings } from '../types';

type CourseFilters = {
  category?: CourseCategory | null;
  level?: CourseLevel | null;
  minPrice?: string | null;
  maxPrice?: string | null;
  search?: string | null;
};

type PriceBounds = {
  minPrice: number;
  maxPrice: number;
};

type OffsetPagination = {
  page: number;
  limit: number;
};

const activeBookingsCountSql = sql<number>`count(case when ${bookings.status} <> 'cancelled' then 1 end)`;

function buildFilterConditions(filters: CourseFilters): SQL[] {
  const conditions: SQL[] = [];

  if (filters.category) {
    conditions.push(eq(courses.category, filters.category));
  }

  if (filters.level) {
    conditions.push(eq(courses.level, filters.level));
  }

  if (filters.minPrice) {
    conditions.push(gte(courses.price, filters.minPrice));
  }

  if (filters.maxPrice) {
    conditions.push(lte(courses.price, filters.maxPrice));
  }

  if (filters.search) {
    conditions.push(ilike(courses.title, `%${filters.search}%`));
  }

  return conditions;
}

export async function getCoursesPriceBounds(): Promise<PriceBounds> {
  const [priceBounds] = await db
    .select({
      minPrice: min(courses.price),
      maxPrice: max(courses.price),
    })
    .from(courses);

  return {
    minPrice: Number(priceBounds?.minPrice ?? 0),
    maxPrice: Number(priceBounds?.maxPrice ?? 0),
  };
}

export async function getCoursesPaginated(
  filters: CourseFilters,
  pagination: OffsetPagination,
): Promise<PaginatedResponse<CourseWithTeacherAndRatings>> {
  const { page, limit } = pagination;
  const offset = (page - 1) * limit;
  const filterConditions = buildFilterConditions(filters);
  const baseWhere = filterConditions.length > 0 ? and(...filterConditions) : undefined;

  const rawRows = await db
    .select({
      id: courses.id,
      totalCount: sql<number>`count(*) over()`,
    })
    .from(courses)
    .leftJoin(bookings, eq(bookings.courseId, courses.id))
    .where(baseWhere)
    .groupBy(courses.id, courses.createdAt)
    .orderBy(desc(activeBookingsCountSql), desc(courses.createdAt), desc(courses.id))
    .limit(limit)
    .offset(offset);

  const courseIds = rawRows.map((row) => row.id);

  // Window function returns total BEFORE LIMIT; if page is out of range, rows are empty
  let total = rawRows.length > 0 ? Number(rawRows[0].totalCount) : 0;

  if (rawRows.length === 0 && offset > 0) {
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(baseWhere);
    total = Number(countResult?.count ?? 0);
  }

  const fullCourses = courseIds.length
    ? await db.query.courses.findMany({
        where: inArray(courses.id, courseIds),
        with: {
          teacher: {
            with: {
              user: true,
            },
          },
          ratings: true,
        },
      })
    : [];

  const coursesById = new Map(fullCourses.map((course) => [course.id, course]));
  const items = rawRows
    .map((row) => coursesById.get(row.id))
    .filter((course): course is CourseWithTeacherAndRatings => Boolean(course));

  return {
    items,
    hasMore: offset + items.length < total,
    total,
  };
}
