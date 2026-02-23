import { eq, sql } from "drizzle-orm";
import { db } from "~/server/lib/db/index.server";
import * as schema from "~/server/lib/db/schema";
import type { UpdateTeacherInput } from "~/lib/validation";

/**
 * Update an existing teacher profile in database
 */
export async function updateTeacher(
  teacherId: string,
  data: UpdateTeacherInput,
) {
  try {
    const [updatedTeacher] = await db
      .update(schema.teachers)
      .set({ ...data, updatedAt: sql`NOW()` })
      .where(eq(schema.teachers.id, teacherId))
      .returning();

    return {
      success: true,
      message: "Enseignant mis à jour avec succès.",
      teacher: updatedTeacher,
    };
  } catch (error) {
    console.error("Error updating teacher:", error);
    return {
      success: false,
      error:
        "Une erreur s'est produite lors de la mise à jour de l'enseignant.",
    };
  }
}
