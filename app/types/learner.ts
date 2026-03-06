import { z } from 'zod';
import { createLearnerSchema, updateLearnerSchema } from '~/lib/validation';

export type CreateLearnerInput = z.infer<typeof createLearnerSchema>;
export type UpdateLearnerInput = z.infer<typeof updateLearnerSchema>;
