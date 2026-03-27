import { z } from 'zod';
import { bookingFormSchema, createBookingSchema, updateBookingSchema } from '~/lib/validation';

export type BookingFormInput = z.infer<typeof bookingFormSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
