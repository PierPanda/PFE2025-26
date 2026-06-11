import { and, count, eq, notInArray } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { bookings, courses, ratings } from '~/server/lib/db/schema';
import type { DeleteCourseResponse } from '../types';

export async function deleteCourse(courseId: string): Promise<DeleteCourseResponse> {
  try {
    const [{ activeCount }] = await db
      .select({ activeCount: count() })
      .from(bookings)
      .where(and(eq(bookings.courseId, courseId), notInArray(bookings.status, ['completed', 'cancelled'])));

    if (activeCount > 0) {
      return {
        success: false,
        error: 'Ce cours ne peut pas être supprimé car une réservation est en cours.',
      };
    }

    await db.delete(ratings).where(eq(ratings.courseId, courseId));
    await db.delete(bookings).where(eq(bookings.courseId, courseId));
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
