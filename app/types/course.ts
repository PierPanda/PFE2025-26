import { courses } from '~/server/lib/db/schema-definition/courses';
import { z } from 'zod';
import { courseFormSchema, createCourseSchema, updateCourseSchema } from '~/lib/validation';

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;

export type CourseCategory = Course['category'];
export type CourseLevel = Course['level'];

export type CourseFilters = {
  category?: string;
  level?: string;
  teacherId?: string;
};

export type CourseFormInput = z.infer<typeof courseFormSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
