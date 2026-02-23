import { eq, and } from "drizzle-orm";
import { db } from "~/server/lib/db/index.server";
import * as schema from "~/server/lib/db/schema";
import type {
  CourseCategory,
  CourseLevel,
} from "~/server/lib/db/schema-definition/courses";

/**
 * Get all courses with optional filters from database
 */
export async function getCourses(
  category?: CourseCategory,
  level?: CourseLevel,
) {
  try {
    const result = await db
      .select()
      .from(schema.courses)
      .where(
        and(
          category ? eq(schema.courses.category, category) : undefined,
          level ? eq(schema.courses.level, level) : undefined,
        ),
      );

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
