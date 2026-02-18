import { sql } from "drizzle-orm";
import { db } from "~/server/lib/db";
import { courses } from "~/server/lib/db/schema";
import { z } from "zod";
import type { Course } from "~/types/course";
import { categoryValues } from "~/server/lib/db/schema-definition/courses";

export const createCourseSchema = z.object({
  id: z.uuid().min(1, "L'ID est requis."),
  teacherId: z.string().min(1, "L'ID enseignant est requis."),
  title: z.string().min(1, "Le titre est requis."),
  description: z.string().min(1, "La description est requise."),
  duration: z.number().min(1, "La durée est requise."),
  level: z.string().min(1, "Le niveau est requis."),
  price: z.number().min(0, "Le prix doit être supérieur ou égal à 0."),
  isPublished: z.boolean().default(false),
  category: z.enum(categoryValues),
});

export async function createCourse(courseData: Course) {
  try {
    const result = await db
      .insert(courses)
      .values({ ...courseData, createdAt: sql`NOW()`, updatedAt: sql`NOW()` });
    return {
      success: true,
      message: "Cours créé avec succès.",
      course: result,
    };
  } catch (error) {
    console.error("Error creating course:", error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la création du cours.",
    };
  }
}
