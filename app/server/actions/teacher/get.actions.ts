import { eq } from "drizzle-orm";
import { db } from "~/server/lib/db";
import { teachers } from "~/server/lib/db/schema";

export async function getTeacher(teacherId: string) {
  try {
    const result = await db
      .select()
      .from(teachers)
      .where(eq(teachers.id, teacherId));

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

export async function getTeacherByUserId(userId: string) {
  try {
    const result = await db
      .select()
      .from(teachers)
      .where(eq(teachers.userId, userId));

    return {
      success: true,
      teacher: result,
    };
  } catch (error) {
    console.error("Error fetching teacher by user ID:", error);
    return {
      success: false,
      error:
        "Une erreur s'est produite lors de la récupération de l'enseignant par ID utilisateur.",
    };
  }
}
