import { eq } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { bookings } from '~/server/lib/db/schema';
import type { DeleteBookingResponse } from '../types';

/**
 * Delete a booking from database
 */
export async function deleteBooking(bookingId: string): Promise<DeleteBookingResponse> {
  try {
<<<<<<< HEAD
<<<<<<< HEAD
    await db.delete(bookings).where(eq(bookings.id, bookingId)).returning();

    return {
      success: true,
      message: 'Réservation supprimée avec succès.',
=======
    await db.delete(bookings).where(eq(bookings.id, bookingId));

    return {
      success: true,
      message: 'Reservation supprimee avec succes.',
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
=======
    await db.delete(bookings).where(eq(bookings.id, bookingId)).returning();

    return {
      success: true,
      message: 'Réservation supprimée avec succès.',
>>>>>>> d823109 (feat(api): enhance booking and slot management)
    };
  } catch (error) {
    console.error('Error deleting booking:', error);
    return {
      success: false,
<<<<<<< HEAD
<<<<<<< HEAD
      error: "Une erreur s'est produite lors de la suppression de la réservation.",
=======
      error: "Une erreur s'est produite lors de la suppression de la reservation.",
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
=======
      error: "Une erreur s'est produite lors de la suppression de la réservation.",
>>>>>>> d823109 (feat(api): enhance booking and slot management)
    };
  }
}
