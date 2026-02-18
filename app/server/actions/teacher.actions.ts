import { eq, sql } from "drizzle-orm";
import { db } from "~/server/lib/db";
import { teacher } from "~/server/lib/db/schema";

export async function getTeacher(teacherId: string) {
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

export async function createTeacher(teacherData: any) {
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

export async function updateTeacher(teacherId: string, updatedTeacher: any) {
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
