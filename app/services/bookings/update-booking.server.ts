import { eq, sql } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { bookings } from '~/server/lib/db/schema';
import type { UpdateBookingInput } from '~/types/booking';
import type { UpdateBookingResponse } from '../types';

/**
 * Update an existing booking in database
 */
<<<<<<< HEAD
export async function updateBooking(
  bookingId: string,
  data: UpdateBookingInput,
): Promise<UpdateBookingResponse> {
=======
export async function updateBooking(bookingId: string, data: UpdateBookingInput): Promise<UpdateBookingResponse> {
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
  try {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ ...data, updatedAt: sql`NOW()` })
      .where(eq(bookings.id, bookingId))
      .returning();

    if (!updatedBooking) {
      return {
        success: false,
<<<<<<< HEAD
        error: 'Réservation introuvable.',
=======
        error: 'Reservation introuvable.',
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
      };
    }

    return {
      success: true,
<<<<<<< HEAD
      message: 'Réservation mise à jour avec succès.',
=======
      message: 'Reservation mise a jour avec succes.',
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
      booking: updatedBooking,
    };
  } catch (error) {
    console.error('Error updating booking:', error);
    return {
      success: false,
<<<<<<< HEAD
      error: "Une erreur s'est produite lors de la mise a jour de la réservation.",
=======
      error: "Une erreur s'est produite lors de la mise a jour de la reservation.",
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
    };
  }
}
