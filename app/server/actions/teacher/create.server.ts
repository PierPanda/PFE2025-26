import { sql } from "drizzle-orm";
import { db } from "~/server/lib/db/index.server";
import { teachers } from "~/server/lib/db/schema";
import { z } from "zod";
import type { NewTeacher } from "~/types/teacher";

export const createTeacherSchema = z.object({
  id: z.string().uuid("L'ID est requis."),
  userId: z.string().min(1, "L'ID utilisateur est requis."),
  description: z.string().min(1, "La description est requise.").optional(),
  graduations: z.record(z.string(), z.string()).optional(),
  skills: z.string().min(1, "La compétence est requise.").optional(),
});

type CreateTeacherInput = Omit<NewTeacher, "createdAt" | "updatedAt">;

export async function createTeacher(teacherData: CreateTeacherInput) {
  try {
    const [createdTeacher] = await db
      .insert(teachers)
      .values({ ...teacherData, createdAt: sql`NOW()`, updatedAt: sql`NOW()` })
      .returning();
    return {
      success: true,
      message: "Enseignant créé avec succès.",
      teacher: createdTeacher,
    };
  } catch (error) {
    console.error("Error creating teacher:", error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la création de l'enseignant.",
    };
  }
}
