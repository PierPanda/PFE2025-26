import { z } from 'zod';
import { createAvailabilitySchema, availabilityFormSchema, updateAvailabilitySchema } from '~/lib/validation';

export type AvailabilityFormInput = z.infer<typeof availabilityFormSchema>;
export type CreateAvailabilityInput = z.infer<typeof createAvailabilitySchema>;
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;
