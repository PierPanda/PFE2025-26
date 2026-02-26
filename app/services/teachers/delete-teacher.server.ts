import { eq } from "drizzle-orm";
import { db } from "~/server/lib/db/index.server";
import { teachers } from "~/server/lib/db/schema";
import type { DeleteTeacherResponse } from "../types";

/**
 * Delete a teacher profile from database
 */
export async function deleteTeacher(
  teacherId: string,
): Promise<DeleteTeacherResponse> {
  try {
    await db.delete(teachers).where(eq(teachers.id, teacherId));

    return {
      success: true,
      message: "Enseignant supprimé avec succès.",
    };
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return {
      success: false,
      error:
        "Une erreur s'est produite lors de la suppression de l'enseignant.",
    };
  }
}
