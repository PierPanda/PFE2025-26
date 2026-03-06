import { sql } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { teachers } from '~/server/lib/db/schema';
import type { CreateTeacherInput } from '~/lib/validation';
import type { CreateTeacherResponse } from '../types';

/**
 * Create a new teacher profile in database
 */
export async function createTeacher(teacherData: CreateTeacherInput): Promise<CreateTeacherResponse> {
  try {
    const [createdTeacher] = await db
      .insert(teachers)
      .values({
        ...teacherData,
        createdAt: sql`NOW()`,
        updatedAt: sql`NOW()`,
      })
      .returning();

    return {
      success: true,
      message: 'Enseignant créé avec succès.',
      teacher: createdTeacher,
    };
  } catch (error) {
    console.error('Error creating teacher:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la création de l'enseignant.",
    };
  }
}
