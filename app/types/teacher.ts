import { teachers } from '~/server/lib/db/schema-definition/teachers';
import { z } from 'zod';
import { createTeacherSchema, updateTeacherSchema, updateCourseSchema } from '~/lib/validation';

export type Teacher = typeof teachers.$inferSelect;
export type NewTeacher = typeof teachers.$inferInsert;

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
