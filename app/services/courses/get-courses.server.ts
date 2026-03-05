import { eq, and, gte, lte, min, max } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';

import { courses, teachers, user } from '~/server/lib/db/schema';
import type { GetCoursesResponse } from '../types';
import type { CourseLevel, CourseCategory } from '~/types/course';

/**
 * Get all courses with optional filters and teacher info
 */
export async function getCourses(
  category?: CourseCategory,
  level?: CourseLevel,
  minPrice?: string,
  maxPrice?: string,
): Promise<GetCoursesResponse> {
  try {
    const result = await db.query.courses.findMany({
      where: and(
        category ? eq(courses.category, category) : undefined,
        level ? eq(courses.level, level) : undefined,
        minPrice ? gte(courses.price, minPrice) : undefined,
        maxPrice ? lte(courses.price, maxPrice) : undefined,
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
 * Get all courses by teacher ID
 */
export async function getCoursesByTeacher(teacherId: string) {
  try {
    const result = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        duration: courses.duration,
        price: courses.price,
        category: courses.category,
        level: courses.level,
        teacherName: user.name,
      })
      .from(courses)
      .leftJoin(teachers, eq(courses.teacherId, teachers.id))
      .leftJoin(user, eq(teachers.userId, user.id))
      .where(eq(courses.teacherId, teacherId));

    return {
      success: true,
      courses: result,
    };
  } catch (error) {
    console.error('Error fetching courses by teacher:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la récupération des cours de l'enseignant.",
    };
  }
}
