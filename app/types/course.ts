import { courses } from "~/server/lib/db/schema-definition/courses";

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;

export type CourseCategory = Course["category"];
export type CourseLevel = Course["level"];

export type CourseFilters = {
  category?: string;
  level?: string;
  teacherId?: string;
};

export { levelValues } from "~/server/lib/db/schema-definition/courses";
