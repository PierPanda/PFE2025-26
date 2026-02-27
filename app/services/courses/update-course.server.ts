import { eq, sql } from "drizzle-orm";
import { db } from "~/server/lib/db/index.server";
import { courses } from "~/server/lib/db/schema";
import type { UpdateCourseInput } from "~/lib/validation";
import type { UpdateCourseResponse } from "../types";

/**
 * Update an existing course in database
 */
export async function updateCourse(
  courseId: string,
  data: UpdateCourseInput
): Promise<UpdateCourseResponse> {
  try {
    const [updatedCourse] = await db
      .update(courses)
      .set({ ...data, updatedAt: sql`NOW()` })
      .where(eq(courses.id, courseId))
      .returning();

    if (!updatedCourse) {
      return {
        success: false,
        error: "Cours introuvable.",
      };
    }

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
