import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db } from "~/server/lib/db/index.server";
import * as schema from "~/server/lib/db/schema";
import type { Teacher } from "~/types/teacher";

export const updateTeacherSchema = z.object({
  description: z.string().min(1, "La description est requise.").optional(),
  graduations: z.record(z.string(), z.string()).optional(),
  skills: z.string().min(1, "La compétence est requise.").optional(),
});

export async function updateTeacher(
  teacherId: string,
  updatedTeacher: Partial<Teacher>,
) {
  try {
    const result = await db
      .update(schema.teachers)
      .set({ ...updatedTeacher, updatedAt: sql`NOW()` })
      .where(eq(schema.teachers.id, teacherId));
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
