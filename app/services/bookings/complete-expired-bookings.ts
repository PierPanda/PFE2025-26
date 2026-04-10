import { and, eq, lt, sql } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { bookings } from '~/server/lib/db/schema';
import type { CompleteExpiredBookingsResponse } from '../types';

/**
 * Complete all confirmed bookings with an end time in the past
 */
export async function completeExpiredBookings(): Promise<CompleteExpiredBookingsResponse> {
  try {
    const updatedBookings = await db
      .update(bookings)
      .set({ status: 'completed', updatedAt: sql`NOW()` })
      .where(and(eq(bookings.status, 'confirmed'), lt(bookings.endTime, sql`NOW()`)))
      .returning({ id: bookings.id });

    return {
      success: true,
      updated: updatedBookings.length,
      message: 'Réservations expirées complétées avec succès.',
    };
  } catch (error) {
    console.error('Error completing expired bookings:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la complétion des réservations expirées.",
    };
  }
}
