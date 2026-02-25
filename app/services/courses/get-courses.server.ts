import { eq, and } from "drizzle-orm";
import { db } from "~/server/lib/db/index.server";
import * as schema from "~/server/lib/db/schema";
import type { CourseLevel, CourseCategory } from "~/types/course";

/**
 * Get all courses with optional filters from database
 */
export async function getCourses(
  category?: CourseCategory,
  level?: CourseLevel,
) {
  try {
    const result = await db
      .select({
        id: schema.courses.id,
        title: schema.courses.title,
        description: schema.courses.description,
        duration: schema.courses.duration,
        price: schema.courses.price,
        category: schema.courses.category,
        level: schema.courses.level,
        teacherName: schema.user.name,
      })
      .from(schema.courses)
      .where(
        and(
          category ? eq(schema.courses.category, category) : undefined,
          level ? eq(schema.courses.level, level) : undefined,
        ),
      )
      .leftJoin(
        schema.teachers,
        eq(schema.courses.teacherId, schema.teachers.id),
      )
      .leftJoin(schema.user, eq(schema.teachers.userId, schema.user.id));

    return {
      success: true,
      courses: result,
    };
  } catch (error) {
    console.error("Error fetching courses:", error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la récupération des cours.",
    };
  }
}
