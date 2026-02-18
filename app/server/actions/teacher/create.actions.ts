import { sql } from "drizzle-orm";
import { db } from "~/server/lib/db";
import { teacher } from "~/server/lib/db/schema";
import { z } from "zod";
import type { Teacher } from "~/types/teacher";

export const createTeacherSchema = z.object({
  id: z.uuid().min(1, "L'ID est requis."),
  userId: z.string().min(1, "L'ID utilisateur est requis."),
  description: z.string().min(1, "La description est requise."),
  graduation: z.record(z.string(), z.string()).optional(),
  skill: z.string().min(1, "La compétence est requise."),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export async function createTeacher(teacherData: Teacher) {
  try {
    const result = await db
      .insert(teacher)
      .values({ ...teacherData, createdAt: sql`NOW()`, updatedAt: sql`NOW()` });
    return {
      success: true,
      message: "Enseignant créé avec succès.",
      teacher: result,
    };
  } catch (error) {
    console.error("Error creating teacher:", error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la création de l'enseignant.",
    };
  }
}
