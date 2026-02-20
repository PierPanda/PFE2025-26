import { sql } from "drizzle-orm";
import { db } from "~/server/lib/db/index.server";
import { courses } from "~/server/lib/db/schema";
import type { NewCourse } from "~/types/course";

type CreateCourseInput = Omit<NewCourse, "createdAt" | "updatedAt">;

export async function createCourse(courseData: CreateCourseInput) {
  try {
    const result = await db.insert(courses).values({
      ...courseData,
      createdAt: sql`NOW()`,
      updatedAt: sql`NOW()`,
    });
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
