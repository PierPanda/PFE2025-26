import { courses } from "~/server/lib/db/schema-definition/courses";

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;

export type {
  CourseCategory,
  CourseLevel,
} from "~/server/lib/db/schema-definition/courses";

export type CourseFilters = {
  category?: string;
  level?: string;
  teacherId?: string;
};

export {
  categoryValues,
  levelValues,
} from "~/server/lib/db/schema-definition/courses";
