import type {
  CourseCategory,
  CourseLevel,
} from "~/server/lib/db/schema-definition/courses";

export type Course = {
  id: string;
  teacherId: string;
  title: string;
  description: string;
  duration: number;
  level: CourseLevel;
  price: number;
  isPublished: boolean;
  category: CourseCategory;
};
