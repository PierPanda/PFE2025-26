import { eq, and } from "drizzle-orm";
import { db } from "~/server/lib/db/index.server";
import { courses } from "~/server/lib/db/schema";
import type {
  CourseCategory,
  CourseLevel,
} from "~/server/lib/db/schema-definition/courses";

export async function getCourseById(courseId: string) {
  try {
    const result = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId));

    return {
      success: true,
      course: result,
    };
  } catch (error) {
    console.error("Error fetching course:", error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la récupération du cours.",
    };
  }
}

export async function getCoursesByTeacher(teacherId: string) {
  try {
    const result = await db
      .select()
      .from(courses)
      .where(eq(courses.teacherId, teacherId));

    return {
      success: true,
      courses: result,
    };
  } catch (error) {
    console.error("Error fetching courses by teacher:", error);
    return {
      success: false,
      error:
        "Une erreur s'est produite lors de la récupération des cours de l'enseignant.",
    };
  }
}

export async function getCourses(
  category?: CourseCategory,
  level?: CourseLevel,
) {
  try {
    const result = await db
      .select()
      .from(courses)
      .where(
        and(
          category ? eq(courses.category, category) : undefined,
          level ? eq(courses.level, level) : undefined,
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
