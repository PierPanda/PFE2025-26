import { sql } from "drizzle-orm";
import { db } from "~/server/lib/db/index.server";
import * as schema from "~/server/lib/db/schema";
import type { NewCourse } from "~/types/course";

type CreateCourseInput = Omit<NewCourse, "createdAt" | "updatedAt">;

export async function createCourse(courseData: CreateCourseInput) {
  try {
    const [createdCourse] = await db
      .insert(schema.courses)
      .values({
        ...courseData,
        createdAt: sql`NOW()`,
        updatedAt: sql`NOW()`,
      })
      .returning();
    return {
      success: true,
      message: "Cours créé avec succès.",
      course: createdCourse,
    };
  } catch (error) {
    console.error("Error creating course:", error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la création du cours.",
    };
  }
}
