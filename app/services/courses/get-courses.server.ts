import { eq, and } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { courses } from '~/server/lib/db/schema';
import type { CourseCategory, CourseLevel } from '~/server/lib/db/schema-definition/courses';
import type { GetCoursesResponse } from '../types';

/**
 * Get all courses with optional filters and teacher info
 */
export async function getCourses(category?: CourseCategory, level?: CourseLevel): Promise<GetCoursesResponse> {
  try {
    const result = await db.query.courses.findMany({
      where: and(category ? eq(courses.category, category) : undefined, level ? eq(courses.level, level) : undefined),
      with: {
        teacher: {
          with: {
            user: true,
          },
        },
      },
    });

    return {
      success: true,
      courses: result,
    };
  } catch (error) {
    console.error('Error fetching courses:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la récupération des cours.",
    };
  }
}
