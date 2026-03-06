import { z } from 'zod';
import { levelValues } from '~/server/lib/levels';
import { categoryValues } from '~/server/lib/categories';

/**
 * Schémas de validation communs pour les routes API
 */

export const uuidSchema = z.string().uuid('ID invalide');

export const paginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive('Le numéro de page doit être positif')),
  search: z.string().optional().default(''),
});

export const idParamSchema = z.object({
  id: uuidSchema,
});

export const courseFormSchema = z.object({
  title: z.string().min(1, 'Le titre est requis.'),
  description: z.string().min(1, 'La description est requise.'),
  duration: z.coerce.number().min(1, 'La durée est requise.'),
  level: z.enum(levelValues),
  price: z.coerce
    .number()
    .min(0, 'Le prix doit être supérieur ou égal à 0.')
    .transform((val) => val.toFixed(2)),
  category: z.enum(categoryValues),
});

export const createCourseSchema = courseFormSchema.extend({
  id: uuidSchema,
  teacherId: z.string().min(1, "L'ID enseignant est requis."),
  isPublished: z.coerce.boolean().default(false),
});

export const updateCourseSchema = createCourseSchema.partial().extend({
  id: uuidSchema,
});

export const courseQuerySchema = paginationQuerySchema.extend({
  category: z.enum(categoryValues).optional(),
  level: z.enum(levelValues).optional(),
  teacherId: z.string().uuid().optional(),
  isPublished: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
});

export type CourseFormInput = z.infer<typeof courseFormSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;

export const createTeacherSchema = z.object({
  id: uuidSchema,
  userId: z.string().min(1, "L'ID utilisateur est requis."),
  description: z.string().optional(),
  graduations: z.record(z.string(), z.string()).optional(),
  skills: z.string().optional(),
});

export const updateTeacherSchema = createTeacherSchema.partial().extend({
  id: uuidSchema,
});

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

export const createLearnerSchema = z.object({
  userId: z.string().min(1, "L'ID utilisateur est requis."),
});

export const updateLearnerSchema = z.object({
  userId: z.string().min(1, "L'ID utilisateur est requis.").optional(),
});

export function validateSearchParams<T extends z.ZodTypeAny>(url: URL, schema: T): z.infer<T> {
  const params = Object.fromEntries(url.searchParams.entries());
  const result = schema.safeParse(params);

  if (!result.success) {
    const errors = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new Response(`Paramètres invalides: ${errors}`, { status: 400 });
  }

  return result.data;
}

export async function validateFormData<T extends z.ZodTypeAny>(request: Request, schema: T): Promise<z.infer<T>> {
  const formData = await request.formData();
  const data = Object.fromEntries(formData.entries());
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new Response(`Données invalides: ${errors}`, { status: 400 });
  }

  return result.data;
}

export async function validateJsonBody<T extends z.ZodTypeAny>(request: Request, schema: T): Promise<z.infer<T>> {
  const body = await request.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    const errors = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new Response(`Données invalides: ${errors}`, { status: 400 });
  }

  return result.data;
}

export function validateParams<T extends z.ZodTypeAny>(
  params: Record<string, string | undefined>,
  schema: T,
): z.infer<T> {
  const result = schema.safeParse(params);

  if (!result.success) {
    const errors = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new Response(`Paramètres invalides: ${errors}`, { status: 400 });
  }

  return result.data;
}
