import { eq } from "drizzle-orm";
import { db } from "~/server/lib/db/index.server";
import * as schema from "~/server/lib/db/schema";

/**
 * Get a single teacher by ID from database
 */
export async function getTeacher(teacherId: string) {
  try {
    const result = await db
      .select()
      .from(schema.teachers)
      .where(eq(schema.teachers.id, teacherId));

    return {
      success: true,
      teacher: result[0] || null,
    };
  } catch (error) {
    console.error("Error fetching teacher:", error);
    return {
      success: false,
      error:
        "Une erreur s'est produite lors de la récupération de l'enseignant.",
    };
  }
}

/**
 * Get teacher by user ID from database
 */
export async function getTeacherByUserId(userId: string) {
  try {
    const result = await db
      .select()
      .from(schema.teachers)
      .where(eq(schema.teachers.userId, userId));

    return {
      success: true,
      teacher: result[0] || null,
    };
  } catch (error) {
    console.error("Error fetching teacher by user ID:", error);
    return {
      success: false,
      error:
        "Une erreur s'est produite lors de la récupération de l'enseignant.",
    };
  }
}
