import { eq } from "drizzle-orm";
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
