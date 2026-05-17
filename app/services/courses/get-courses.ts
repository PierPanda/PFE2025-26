import { eq, and, gte, lte, min, max, ilike, desc, inArray, sql } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { bookings, courses, ratings } from '~/server/lib/db/schema';
import type { GetCoursesResponse, GetCoursesByTeacherResponse, CourseWithTeacherAndRatings } from '../types';
import type { CourseLevel, CourseCategory } from '~/types/course';

const activeBookingsCountSql = sql<number>`count(case when ${bookings.status} <> 'cancelled' then 1 end)`;

export async function getCourses(
  category?: CourseCategory | null,
  level?: CourseLevel | null,
  minPrice?: string | null,
  maxPrice?: string | null,
  search?: string | null,
): Promise<GetCoursesResponse> {
  try {
    const result = await db.query.courses.findMany({
      where: and(
        category ? eq(courses.category, category) : undefined,
        level ? eq(courses.level, level) : undefined,
        minPrice ? gte(courses.price, minPrice) : undefined,
        maxPrice ? lte(courses.price, maxPrice) : undefined,
        search ? ilike(courses.title, `%${search}%`) : undefined,
      ),
      with: {
        teacher: { with: { user: true } },
        ratings: true,
      },
    });

    const [priceBounds] = await db.select({ minPrice: min(courses.price), maxPrice: max(courses.price) }).from(courses);

    return {
      success: true,
      courses: result,
      filters: {
        minPrice: Number(priceBounds?.minPrice ?? 0),
        maxPrice: Number(priceBounds?.maxPrice ?? 0),
      },
    };
  } catch (error) {
    console.error('Error fetching courses:', error);
    return { success: false, error: "Une erreur s'est produite lors de la récupération des cours." };
  }
}

export async function getCoursesByTeacher(teacherId: string): Promise<GetCoursesByTeacherResponse> {
  try {
    const result = await db.query.courses.findMany({
      where: eq(courses.teacherId, teacherId),
      with: {
        teacher: { with: { user: true } },
        ratings: true,
      },
    });

    return { success: true, courses: result };
  } catch (error) {
    console.error('Error fetching courses by teacher:', error);
    return { success: false, error: "Une erreur s'est produite lors de la récupération des cours." };
  }
}

export async function getPopularCourses(limit = 4): Promise<CourseWithTeacherAndRatings[]> {
  const rows = await db
    .select({ id: courses.id, bookingsCount: activeBookingsCountSql })
    .from(courses)
    .leftJoin(bookings, eq(bookings.courseId, courses.id))
    .groupBy(courses.id)
    .orderBy(desc(activeBookingsCountSql), desc(courses.createdAt), desc(courses.id))
    .limit(limit);

  const courseIds = rows.map((row) => row.id);

  const fullCourses = courseIds.length
    ? await db.query.courses.findMany({
        where: inArray(courses.id, courseIds),
        with: {
          teacher: { with: { user: true } },
          ratings: true,
        },
      })
    : [];

  const coursesById = new Map(fullCourses.map((course) => [course.id, course]));

  return courseIds
    .map((id) => coursesById.get(id))
    .filter((course): course is CourseWithTeacherAndRatings => Boolean(course));
}

export async function getTopRatedCourses(limit = 4): Promise<CourseWithTeacherAndRatings[]> {
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
          teacher: { with: { user: true } },
          ratings: true,
        },
      })
    : [];

  const coursesById = new Map(fullCourses.map((course) => [course.id, course]));

  return courseIds
    .map((id) => coursesById.get(id))
    .filter((course): course is CourseWithTeacherAndRatings => Boolean(course));
}

export async function getNewestCourses(limit = 4): Promise<CourseWithTeacherAndRatings[]> {
  return db.query.courses.findMany({
    with: {
      teacher: { with: { user: true } },
      ratings: true,
    },
    orderBy: [desc(courses.createdAt), desc(courses.id)],
    limit,
  });
}
