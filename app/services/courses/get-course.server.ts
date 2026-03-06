import { eq } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { courses } from '~/server/lib/db/schema';
import type { GetCourseResponse } from '../types';

/**
 * Get a single course by ID with teacher and user info
 */
export async function getCourseById(courseId: string): Promise<GetCourseResponse> {
  try {
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
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
      course: course ?? null,
    };
  } catch (error) {
    console.error('Error fetching course:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la récupération du cours.",
    };
  }
}
