import { and, eq, lt } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { bookings } from '~/server/lib/db/schema';
import type { ServiceResponse } from '../types';

type CancelExpiredBookingsResponse = ServiceResponse<{ cancelledCount: number }>;

/**
 * Cancel all pending bookings whose end time is in the past.
 * Intended to be run periodically via the cron endpoint.
 */
export async function cancelExpiredBookings(): Promise<CancelExpiredBookingsResponse> {
  try {
    const now = new Date();

    const cancelled = await db
      .update(bookings)
      .set({ status: 'cancelled', updatedAt: now })
      .where(and(eq(bookings.status, 'pending'), lt(bookings.endTime, now)))
      .returning({ id: bookings.id });

    return {
      success: true,
      message: `${cancelled.length} réservation(s) expirée(s) annulée(s).`,
      cancelledCount: cancelled.length,
    };
  } catch (error) {
    console.error('Error cancelling expired bookings:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de l'annulation des réservations expirées.",
    };
  }
}
