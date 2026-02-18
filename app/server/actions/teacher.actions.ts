import { eq, sql } from "drizzle-orm";
import { db } from "~/server/lib/db";
import { teacher } from "~/server/lib/db/schema";
import { z } from "zod";

export const createTeacherSchema = z.object({
  id: z.uuid().min(1, "L'ID est requis."),
  userId: z.string().min(1, "L'ID utilisateur est requis."),
  description: z.string().min(1, "La description est requise."),
  graduation: z.record(z.string(), z.string()).optional(),
  skill: z.string().min(1, "La compétence est requise."),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type CreateTeacher = z.infer<typeof createTeacherSchema>;

export const updateTeacherSchema = z.object({
  description: z.string().min(1, "La description est requise.").optional(),
  graduation: z.record(z.string(), z.string()).optional(),
  skill: z.string().min(1, "La compétence est requise.").optional(),
  updatedAt: z.date().optional(),
});

export type UpdateTeacher = z.infer<typeof updateTeacherSchema>;

export type TeacherId = CreateTeacher["id"];

export async function getTeacher(teacherId: TeacherId) {
  try {
    const result = await db
      .select()
      .from(teacher)
      .where(eq(teacher.id, teacherId));

    return {
      success: true,
      teacher: result,
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

export async function createTeacher(teacherData: CreateTeacher) {
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

export async function updateTeacher(
  teacherId: TeacherId,
  updatedTeacher: UpdateTeacher,
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

export async function deleteTeacher(teacherId: TeacherId) {
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
