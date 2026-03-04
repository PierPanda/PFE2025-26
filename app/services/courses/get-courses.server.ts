import { eq, and, gte, lte, min, max } from "drizzle-orm";
import { db } from "~/server/lib/db/index.server";

import { courses } from "~/server/lib/db/schema";
import type { GetCoursesResponse } from "../types";
import type { CourseLevel, CourseCategory } from "~/types/course";

/**
 * Get all courses with optional filters and teacher info
 */
export async function getCourses(
  category?: CourseCategory,
  level?: CourseLevel,
  minPrice?: string,
  maxPrice?: string,
): Promise<GetCoursesResponse> {
  try {
    const result = await db.query.courses.findMany({
      where: and(
        category ? eq(courses.category, category) : undefined,
        level ? eq(courses.level, level) : undefined,
        minPrice ? gte(courses.price, minPrice) : undefined,
        maxPrice ? lte(courses.price, maxPrice) : undefined,
      ),
      with: {
        teacher: {
          with: {
            user: true,
          },
        },
      },
    });

    const [priceBounds] = await db
      .select({
        minPrice: min(courses.price),
        maxPrice: max(courses.price),
      })
      .from(courses);

    return {
      success: true,
      courses: result,
      filters: {
        minPrice: Number(priceBounds?.minPrice ?? 0),
        maxPrice: Number(priceBounds?.maxPrice ?? 0),
      },
    };
  } catch (error) {
    console.error("Error fetching courses:", error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la récupération des cours.",
    };
  }
}
