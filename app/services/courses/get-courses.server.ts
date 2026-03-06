import { eq, and, gte, lte, min, max, ilike } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';

import { courses, teachers, user } from '~/server/lib/db/schema';
import type { GetCoursesResponse } from '../types';
import type { CourseLevel, CourseCategory } from '~/types/course';
import type { GetCoursesByTeacherResponse } from '../types';

/**
 * Get all courses with optional filters and teacher info
 */
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
        teacher: {
          with: {
            user: true,
          },
        },
      },
    });

    const [priceBounds] = await db
      .select({
        minPrice: min(courses.price),
        maxPrice: max(courses.price),
      })
      .from(courses);

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
    return {
      success: false,
      error: "Une erreur s'est produite lors de la récupération des cours.",
    };
  }
}

/**
 * Get courses by teacher ID
 */
export async function getCoursesByTeacher(teacherId: string): Promise<GetCoursesByTeacherResponse> {
  try {
    const result = await db.query.courses.findMany({
      where: eq(courses.teacherId, teacherId),
    });

    return {
      success: true,
      courses: result,
    };
  } catch (error) {
    console.error('Error fetching courses by teacher:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la récupération des cours.",
    };
  }
}
