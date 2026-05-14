import { z } from 'zod';
import { ratingFormSchema, createRatingSchema, updateRatingSchema } from '~/lib/validation';

export type RatingFormInput = z.infer<typeof ratingFormSchema>;
export type CreateRatingInput = z.infer<typeof createRatingSchema>;
export type UpdateRatingInput = z.infer<typeof updateRatingSchema>;
