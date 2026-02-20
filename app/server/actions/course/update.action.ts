import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db } from "~/server/lib/db/index.server";
import { courses } from "~/server/lib/db/schema";
import type { Course } from "~/types/course";

export const updateCourseSchema = z.object({
  title: z.string().min(1, "Le titre est requis.").optional(),
  description: z.string().min(1, "La description est requise.").optional(),
  duration: z.number().min(1, "La durée est requise.").optional(),
  level: z.string().min(1, "Le niveau est requis.").optional(),
  price: z
    .number()
    .min(0, "Le prix doit être supérieur ou égal à 0.")
    .transform((val) => val.toString())
    .optional(),
  isPublished: z.boolean().optional(),
  category: z.string().optional(),
});

export async function updateCourse(
  courseId: string,
  updatedCourse: Partial<Course>,
) {
  try {
    const result = await db
      .update(courses)
      .set({ ...updatedCourse, updatedAt: sql`NOW()` })
      .where(eq(courses.id, courseId));
    return {
      success: true,
      message: "Cours mis à jour avec succès.",
      course: result,
    };
  } catch (error) {
    console.error("Error updating course:", error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la mise à jour du cours.",
    };
  }
}
