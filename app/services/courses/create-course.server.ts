import { sql } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { courses } from '~/server/lib/db/schema';
import type { CreateCourseInput } from '~/lib/validation';
import type { CreateCourseResponse } from '../types';

/**
 * Create a new course in database
 */
export async function createCourse(courseData: CreateCourseInput): Promise<CreateCourseResponse> {
  try {
    const [createdCourse] = await db
      .insert(courses)
      .values({
        ...courseData,
        createdAt: sql`NOW()`,
        updatedAt: sql`NOW()`,
      })
      .returning();

    return {
      success: true,
      message: 'Cours créé avec succès.',
      course: createdCourse,
    };
  } catch (error) {
    console.error('Error creating course:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la création du cours.",
    };
  }
}
