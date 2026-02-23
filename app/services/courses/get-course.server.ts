import { eq } from "drizzle-orm";
import { db } from "~/server/lib/db/index.server";
import * as schema from "~/server/lib/db/schema";

/**
 * Get a single course by ID from database
 */
export async function getCourseById(courseId: string) {
  try {
    const result = await db
      .select()
      .from(schema.courses)
      .where(eq(schema.courses.id, courseId));

    return {
      success: true,
      course: result[0] || null,
    };
  } catch (error) {
    console.error("Error fetching course:", error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la récupération du cours.",
    };
  }
}

/**
 * Get courses by teacher ID
 */
export async function getCoursesByTeacher(teacherId: string) {
  try {
    const result = await db
      .select()
      .from(schema.courses)
      .where(eq(schema.courses.teacherId, teacherId));

    return {
      success: true,
      courses: result,
    };
  } catch (error) {
    console.error("Error fetching courses by teacher:", error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la récupération des cours.",
    };
  }
}
