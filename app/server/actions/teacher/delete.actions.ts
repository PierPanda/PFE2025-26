import { eq } from "drizzle-orm";
import { db } from "~/server/lib/db";
import { teacher } from "~/server/lib/db/schema";

export async function deleteTeacher(teacherId: string) {
  try {
    await db.delete(teacher).where(eq(teacher.id, teacherId));
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
