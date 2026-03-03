import { eq } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { teachers } from '~/server/lib/db/schema';
import type { GetTeacherResponse } from '../types';

/**
 * Get a single teacher by ID with user info and courses
 */
export async function getTeacher(teacherId: string): Promise<GetTeacherResponse> {
  try {
    const teacher = await db.query.teachers.findFirst({
      where: eq(teachers.id, teacherId),
      with: {
        user: true,
        courses: true,
      },
    });

    return {
      success: true,
      teacher: teacher ?? null,
    };
  } catch (error) {
    console.error('Error fetching teacher:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la récupération de l'enseignant.",
    };
  }
}

/**
 * Get teacher by user ID with user info and courses
 */
export async function getTeacherByUserId(userId: string): Promise<GetTeacherResponse> {
  try {
    const teacher = await db.query.teachers.findFirst({
      where: eq(teachers.userId, userId),
      with: {
        user: true,
        courses: true,
      },
    });

    return {
      success: true,
      teacher: teacher ?? null,
    };
  } catch (error) {
    console.error('Error fetching teacher by user ID:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la récupération de l'enseignant.",
    };
  }
}
