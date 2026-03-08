import { sql } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { bookings } from '~/server/lib/db/schema';
import type { CreateBookingInput } from '~/types/booking';
import type { CreateBookingResponse } from '../types';

/**
 * Create a new booking in database
 */
<<<<<<< HEAD:app/services/bookings/create-booking.server.ts
<<<<<<< HEAD
export async function createBooking(
  bookingData: CreateBookingInput,
): Promise<CreateBookingResponse> {
=======
export async function createBooking(bookingData: CreateBookingInput): Promise<CreateBookingResponse> {
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
=======
export async function createBooking(
  bookingData: CreateBookingInput,
): Promise<CreateBookingResponse> {
>>>>>>> e8a3f28 (feat(bookings): implement booking management features):app/services/bookings/create-booking.ts
  try {
    const [createdBooking] = await db
      .insert(bookings)
      .values({
        ...bookingData,
        createdAt: sql`NOW()`,
        updatedAt: sql`NOW()`,
      })
      .returning();

    return {
      success: true,
<<<<<<< HEAD
<<<<<<< HEAD
      message: 'Réservation créée avec succès.',
=======
      message: 'Reservation creee avec succes.',
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
=======
      message: 'Réservation créée avec succès.',
>>>>>>> d823109 (feat(api): enhance booking and slot management)
      booking: createdBooking,
    };
  } catch (error) {
    console.error('Error creating booking:', error);
    return {
      success: false,
<<<<<<< HEAD:app/services/bookings/create-booking.server.ts
<<<<<<< HEAD
<<<<<<< HEAD
      error: "Une erreur s'est produite lors de la création de la réservation.",
=======
      error: "Une erreur s'est produite lors de la creation de la reservation.",
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
=======
      error: "Une erreur s'est produite lors de la création de la réservation.",
>>>>>>> d823109 (feat(api): enhance booking and slot management)
=======
      error: "Une erreur s'est produite lors de la creation de la reservation.",
>>>>>>> e8a3f28 (feat(bookings): implement booking management features):app/services/bookings/create-booking.ts
    };
  }
}
