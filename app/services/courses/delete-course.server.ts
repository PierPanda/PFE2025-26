import { eq } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { courses } from '~/server/lib/db/schema';
import type { DeleteCourseResponse } from '../types';

/**
 * Delete a course from database
 */
export async function deleteCourse(courseId: string): Promise<DeleteCourseResponse> {
  try {
    await db.delete(courses).where(eq(courses.id, courseId));

    return {
      success: true,
      message: 'Cours supprimé avec succès.',
    };
  } catch (error) {
    console.error('Error deleting course:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la suppression du cours.",
    };
  }
}
