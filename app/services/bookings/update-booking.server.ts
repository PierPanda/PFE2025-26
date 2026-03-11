import { eq, sql } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { bookings } from '~/server/lib/db/schema';
import type { UpdateBookingInput } from '~/types/booking';
import type { UpdateBookingResponse } from '../types';

/**
 * Update an existing booking in database
 */
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> e8a3f28 (feat(bookings): implement booking management features)
export async function updateBooking(
  bookingId: string,
  data: UpdateBookingInput,
): Promise<UpdateBookingResponse> {
<<<<<<< HEAD
=======
export async function updateBooking(bookingId: string, data: UpdateBookingInput): Promise<UpdateBookingResponse> {
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
=======
>>>>>>> e8a3f28 (feat(bookings): implement booking management features)
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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
        error: 'Réservation introuvable.',
=======
        error: 'Reservation introuvable.',
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
=======
        error: 'Réservation introuvable.',
>>>>>>> d823109 (feat(api): enhance booking and slot management)
=======
        error: 'Reservation introuvable.',
>>>>>>> e8a3f28 (feat(bookings): implement booking management features)
=======
        error: 'Réservation introuvable.',
>>>>>>> 7a9389b (feat(api): enhance booking and slot management)
      };
    }

    return {
      success: true,
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
      message: 'Réservation mise à jour avec succès.',
=======
      message: 'Reservation mise a jour avec succes.',
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
=======
      message: 'Réservation mise à jour avec succès.',
>>>>>>> d823109 (feat(api): enhance booking and slot management)
=======
      message: 'Reservation mise a jour avec succes.',
>>>>>>> e8a3f28 (feat(bookings): implement booking management features)
=======
      message: 'Réservation mise à jour avec succès.',
>>>>>>> 7a9389b (feat(api): enhance booking and slot management)
      booking: updatedBooking,
    };
  } catch (error) {
    console.error('Error updating booking:', error);
    return {
      success: false,
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
      error: "Une erreur s'est produite lors de la mise a jour de la réservation.",
=======
      error: "Une erreur s'est produite lors de la mise a jour de la reservation.",
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
=======
      error: "Une erreur s'est produite lors de la mise a jour de la réservation.",
>>>>>>> d823109 (feat(api): enhance booking and slot management)
=======
      error: "Une erreur s'est produite lors de la mise a jour de la reservation.",
>>>>>>> e8a3f28 (feat(bookings): implement booking management features)
=======
      error: "Une erreur s'est produite lors de la mise a jour de la réservation.",
>>>>>>> 7a9389b (feat(api): enhance booking and slot management)
    };
  }
}
