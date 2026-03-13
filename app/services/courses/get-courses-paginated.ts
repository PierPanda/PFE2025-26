import { and, asc, desc, eq, gte, ilike, lte, max, min, or, gt, lt, sql } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { courses } from '~/server/lib/db/schema';
import type { CursorPagination } from '~/lib/validation';
import type { CourseCategory, CourseLevel } from '~/types/course';
import type { PaginatedResponse } from '~/types/pagination';
import type { CourseWithTeacher } from '../types';

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

function encodeCursor(item: { createdAt: Date; id: string }) {
  return `${item.createdAt.toISOString()}_${item.id}`;
}

function parseCursor(cursor: string): { createdAt: Date; id: string } {
  const splitIndex = cursor.lastIndexOf('_');
  if (splitIndex === -1) {
    throw new Error('Cursor invalide.');
  }

  const datePart = cursor.slice(0, splitIndex);
  const idPart = cursor.slice(splitIndex + 1);
  const createdAt = new Date(datePart);

  if (Number.isNaN(createdAt.getTime()) || !idPart) {
    throw new Error('Cursor invalide.');
  }

  return { createdAt, id: idPart };
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
): Promise<PaginatedResponse<CourseWithTeacher>> {
  const { cursor, limit, direction } = pagination;
  const filterConditions = buildFilterConditions(filters);

  const cursorCondition = (() => {
    if (!cursor) return undefined;

    const parsedCursor = parseCursor(cursor);

    if (direction === 'next') {
      return or(
        lt(courses.createdAt, parsedCursor.createdAt),
        and(eq(courses.createdAt, parsedCursor.createdAt), lt(courses.id, parsedCursor.id)),
      );
    }

    return or(
      gt(courses.createdAt, parsedCursor.createdAt),
      and(eq(courses.createdAt, parsedCursor.createdAt), gt(courses.id, parsedCursor.id)),
    );
  })();

  const whereCondition = and(...filterConditions, cursorCondition);

  const rawItems = await db.query.courses.findMany({
    where: whereCondition,
    with: {
      teacher: {
        with: {
          user: true,
        },
      },
    },
    orderBy:
      direction === 'next' ? [desc(courses.createdAt), desc(courses.id)] : [asc(courses.createdAt), asc(courses.id)],
    limit,
  });

  const items = direction === 'prev' ? [...rawItems].reverse() : rawItems;

  const firstItem = items[0];
  const lastItem = items[items.length - 1];

  const [countResult, olderExists, newerExists] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(filterConditions.length > 0 ? and(...filterConditions) : undefined),
    lastItem
      ? db.query.courses.findFirst({
          columns: { id: true },
          where: and(
            ...filterConditions,
            or(
              lt(courses.createdAt, lastItem.createdAt),
              and(eq(courses.createdAt, lastItem.createdAt), lt(courses.id, lastItem.id)),
            ),
          ),
        })
      : Promise.resolve(null),
    firstItem
      ? db.query.courses.findFirst({
          columns: { id: true },
          where: and(
            ...filterConditions,
            or(
              gt(courses.createdAt, firstItem.createdAt),
              and(eq(courses.createdAt, firstItem.createdAt), gt(courses.id, firstItem.id)),
            ),
          ),
        })
      : Promise.resolve(null),
  ]);

  const hasOlder = Boolean(olderExists);
  const hasNewer = Boolean(newerExists);

  return {
    items,
    nextCursor: hasOlder && lastItem ? encodeCursor(lastItem) : null,
    prevCursor: hasNewer && firstItem ? encodeCursor(firstItem) : null,
    hasMore: hasOlder,
    total: Number(countResult[0]?.count ?? 0),
  };
}
