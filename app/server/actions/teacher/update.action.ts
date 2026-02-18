import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db } from "~/server/lib/db";
import { teacher } from "~/server/lib/db/schema";
import type { Teacher } from "~/types/teacher";

export const updateTeacherSchema = z.object({
  description: z.string().min(1, "La description est requise.").optional(),
  graduation: z.record(z.string(), z.string()).optional(),
  skill: z.string().min(1, "La compétence est requise.").optional(),
  updatedAt: z.date().optional(),
});

export async function updateTeacher(
  teacherId: string,
  updatedTeacher: Teacher,
) {
  try {
    const result = await db
      .update(teacher)
      .set({ ...updatedTeacher, updatedAt: sql`NOW()` })
      .where(eq(teacher.id, teacherId));
    return {
      success: true,
      message: "Enseignant mis à jour avec succès.",
      teacher: result,
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
