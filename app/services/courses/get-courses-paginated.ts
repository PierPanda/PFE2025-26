import { and, asc, desc, eq, gte, ilike, inArray, lte, max, min, or, sql } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { bookings, courses, ratings } from '~/server/lib/db/schema';
import type { CursorPagination } from '~/lib/validation';
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

type CourseCursor = {
  bookingsCount: number;
  createdAt: Date;
  id: string;
};

const activeBookingsCountSql = sql<number>`count(case when ${bookings.status} <> 'cancelled' then 1 end)`;

function encodeCursor(item: CourseCursor) {
  return `${item.bookingsCount}_${item.createdAt.toISOString()}_${item.id}`;
}

function parseCursor(cursor: string): CourseCursor {
  const firstSeparator = cursor.indexOf('_');
  const secondSeparator = cursor.indexOf('_', firstSeparator + 1);

  if (firstSeparator === -1 || secondSeparator === -1) {
    throw new Error('Cursor invalide.');
  }

  const bookingCountPart = cursor.slice(0, firstSeparator);
  const datePart = cursor.slice(firstSeparator + 1, secondSeparator);
  const idPart = cursor.slice(secondSeparator + 1);

  const bookingsCount = Number(bookingCountPart);
  const createdAt = new Date(datePart);

  if (Number.isNaN(bookingsCount) || Number.isNaN(createdAt.getTime()) || !idPart) {
    throw new Error('Cursor invalide.');
  }

  return { bookingsCount, createdAt, id: idPart };
}

function buildOrderCondition(cursor: CourseCursor, direction: 'next' | 'prev'): SQL {
  if (direction === 'next') {
    return or(
      sql`${activeBookingsCountSql} < ${cursor.bookingsCount}`,
      and(
        sql`${activeBookingsCountSql} = ${cursor.bookingsCount}`,
        or(
          sql`${courses.createdAt} < ${cursor.createdAt}`,
          and(sql`${courses.createdAt} = ${cursor.createdAt}`, sql`${courses.id} < ${cursor.id}`),
        ),
      ),
    ) as SQL;
  }

  return or(
    sql`${activeBookingsCountSql} > ${cursor.bookingsCount}`,
    and(
      sql`${activeBookingsCountSql} = ${cursor.bookingsCount}`,
      or(
        sql`${courses.createdAt} > ${cursor.createdAt}`,
        and(sql`${courses.createdAt} = ${cursor.createdAt}`, sql`${courses.id} > ${cursor.id}`),
      ),
    ),
  ) as SQL;
}

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
  pagination: CursorPagination,
): Promise<PaginatedResponse<CourseWithTeacherAndRatings>> {
  const { cursor, limit, direction } = pagination;
  const filterConditions = buildFilterConditions(filters);
  const baseWhere = filterConditions.length > 0 ? and(...filterConditions) : undefined;

  const parsedCursor = cursor ? parseCursor(cursor) : null;
  const cursorCondition = parsedCursor ? buildOrderCondition(parsedCursor, direction) : undefined;

  const rawRows = await db
    .select({
      id: courses.id,
      createdAt: courses.createdAt,
      bookingsCount: activeBookingsCountSql,
    })
    .from(courses)
    .leftJoin(bookings, eq(bookings.courseId, courses.id))
    .where(baseWhere)
    .groupBy(courses.id, courses.createdAt)
    .having(cursorCondition)
    .orderBy(
      direction === 'next' ? desc(activeBookingsCountSql) : asc(activeBookingsCountSql),
      direction === 'next' ? desc(courses.createdAt) : asc(courses.createdAt),
      direction === 'next' ? desc(courses.id) : asc(courses.id),
    )
    .limit(limit);

  const rows = rawRows.map((row) => ({
    ...row,
    bookingsCount: Number(row.bookingsCount ?? 0),
  }));
  const orderedRows = direction === 'prev' ? [...rows].reverse() : rows;

  const rawItems = await db.query.courses.findMany({
    where: whereCondition,
    with: {
      teacher: {
        with: {
          user: true,
        },
      },
      ratings: true,
    },
    orderBy:
      direction === 'next' ? [desc(courses.createdAt), desc(courses.id)] : [asc(courses.createdAt), asc(courses.id)],
    limit,
  });
      })
    : [];

  const coursesById = new Map(fullCourses.map((course) => [course.id, course]));
  const items = orderedRows
    .map((row) => coursesById.get(row.id))
    .filter((course): course is CourseWithTeacher => Boolean(course));

  const firstItem = orderedRows[0];
  const lastItem = orderedRows[orderedRows.length - 1];

  const [countResult, olderExists, newerExists] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(baseWhere),
    lastItem
      ? db
          .select({ id: courses.id })
          .from(courses)
          .leftJoin(bookings, eq(bookings.courseId, courses.id))
          .where(baseWhere)
          .groupBy(courses.id, courses.createdAt)
          .having(buildOrderCondition(lastItem, 'next'))
          .limit(1)
      : Promise.resolve([]),
    firstItem
      ? db
          .select({ id: courses.id })
          .from(courses)
          .leftJoin(bookings, eq(bookings.courseId, courses.id))
          .where(baseWhere)
          .groupBy(courses.id, courses.createdAt)
          .having(buildOrderCondition(firstItem, 'prev'))
          .limit(1)
      : Promise.resolve([]),
  ]);

  const hasOlder = olderExists.length > 0;
  const hasNewer = newerExists.length > 0;

  return {
    items,
    nextCursor: hasOlder && lastItem ? encodeCursor(lastItem) : null,
    prevCursor: hasNewer && firstItem ? encodeCursor(firstItem) : null,
    hasMore: hasOlder,
    total: Number(countResult[0]?.count ?? 0),
  };
}

export async function getTopRatedCourses(limit = 4): Promise<CourseWithTeacher[]> {
  const rows = await db
    .select({
      id: courses.id,
      averageRate: sql<number>`avg(${ratings.rate})`,
      ratingsCount: sql<number>`count(${ratings.id})`,
    })
    .from(courses)
    .innerJoin(ratings, eq(ratings.courseId, courses.id))
    .groupBy(courses.id, courses.createdAt)
    .orderBy(
      desc(sql`avg(${ratings.rate})`),
      desc(sql`count(${ratings.id})`),
      desc(courses.createdAt),
      desc(courses.id),
    )
    .limit(limit);

  const courseIds = rows.map((row) => row.id);

  const fullCourses = courseIds.length
    ? await db.query.courses.findMany({
        where: inArray(courses.id, courseIds),
        with: {
          teacher: {
            with: {
              user: true,
            },
          },
        },
      })
    : [];

  const coursesById = new Map(fullCourses.map((course) => [course.id, course]));

  return courseIds.map((id) => coursesById.get(id)).filter((course): course is CourseWithTeacher => Boolean(course));
}

export async function getNewestCourses(limit = 4): Promise<CourseWithTeacher[]> {
  return db.query.courses.findMany({
    with: {
      teacher: {
        with: {
          user: true,
        },
      },
    },
    orderBy: [desc(courses.createdAt), desc(courses.id)],
    limit,
  });
}
