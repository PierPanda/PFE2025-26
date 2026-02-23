import { eq, sql } from "drizzle-orm";
import { db } from "~/server/lib/db/index.server";
import * as schema from "~/server/lib/db/schema";
import type { UpdateCourseInput } from "~/lib/validation";

/**
 * Update an existing course in database
 */
export async function updateCourse(courseId: string, data: UpdateCourseInput) {
  try {
    const [updatedCourse] = await db
      .update(schema.courses)
      .set({ ...data, updatedAt: sql`NOW()` })
      .where(eq(schema.courses.id, courseId))
      .returning();

    return {
      success: true,
      message: "Cours mis à jour avec succès.",
      course: updatedCourse,
    };
  } catch (error) {
    console.error("Error updating course:", error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la mise à jour du cours.",
    };
  }
}
