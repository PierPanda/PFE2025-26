import { eq } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { bookings } from '~/server/lib/db/schema';
import type { DeleteBookingResponse } from '../types';

/**
 * Delete a booking from database
 */
export async function deleteBooking(bookingId: string): Promise<DeleteBookingResponse> {
  try {
    await db.delete(bookings).where(eq(bookings.id, bookingId));

    return {
      success: true,
      message: 'Reservation supprimee avec succes.',
    };
  } catch (error) {
    console.error('Error deleting booking:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la suppression de la reservation.",
    };
  }
}
