import { z } from "zod";
import { categoryValues, levelValues } from "~/types/course";

// ============================================
// Course Validation Schemas
// ============================================

// Schema for form validation (client-side)
export const courseFormSchema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  description: z.string().min(1, "La description est requise."),
  duration: z.coerce.number().min(1, "La durée est requise."),
  level: z.enum(levelValues),
  price: z.coerce
    .number()
    .min(0, "Le prix doit être supérieur ou égal à 0.")
    .transform((val) => val.toString()),
  category: z.enum(categoryValues),
});

// Full schema for server-side validation (includes generated fields)
export const createCourseSchema = z.object({
  id: z.string().uuid("L'ID est requis."),
  teacherId: z.string().min(1, "L'ID enseignant est requis."),
  title: z.string().min(1, "Le titre est requis."),
  description: z.string().min(1, "La description est requise."),
  duration: z.coerce.number().min(1, "La durée est requise."),
  level: z.enum(levelValues),
  price: z.coerce
    .number()
    .min(0, "Le prix doit être supérieur ou égal à 0.")
    .transform((val) => val.toString()),
  isPublished: z.coerce.boolean().default(false),
  category: z.enum(categoryValues),
});

export const updateCourseSchema = z.object({
  title: z.string().min(1, "Le titre est requis.").optional(),
  description: z.string().min(1, "La description est requise.").optional(),
  duration: z.number().min(1, "La durée est requise.").optional(),
  level: z.enum(levelValues).optional(),
  price: z.coerce
    .number()
    .min(0, "Le prix doit être supérieur ou égal à 0.")
    .transform((val) => val.toString())
    .optional(),
  isPublished: z.boolean().optional(),
  category: z.enum(categoryValues).optional(),
});

// ============================================
// Teacher Validation Schemas
// ============================================

export const createTeacherSchema = z.object({
  id: z.string().uuid("L'ID est requis."),
  userId: z.string().min(1, "L'ID utilisateur est requis."),
  description: z.string().min(1, "La description est requise.").optional(),
  graduations: z.record(z.string(), z.string()).optional(),
  skills: z.string().min(1, "La compétence est requise.").optional(),
});

export const updateTeacherSchema = z.object({
  description: z.string().min(1, "La description est requise.").optional(),
  graduations: z.record(z.string(), z.string()).optional(),
  skills: z.string().min(1, "La compétence est requise.").optional(),
});

// ============================================
// Inferred Types
// ============================================

export type CourseFormInput = z.infer<typeof courseFormSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;
