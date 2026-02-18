import type { CourseCategory } from "~/server/lib/db/schema";

export type Course = {
  id: string;
  teacherId: string;
  title: string;
  description: string;
  duration: number;
  level: string;
  price: string;
  isPublished: boolean;
  category: CourseCategory;
};
