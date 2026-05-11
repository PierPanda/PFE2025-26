import { and, eq, lt, sql } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { bookings } from '~/server/lib/db/schema';
import type { CompleteExpiredBookingsResponse } from '../types';

// Complete all confirmed bookings whose end time has passed
export async function completeExpiredBookings(): Promise<CompleteExpiredBookingsResponse> {
  try {
    const result = await db
      .update(bookings)
      .set({ status: 'completed', updatedAt: sql`NOW()` })
      .where(and(eq(bookings.status, 'confirmed'), lt(bookings.endTime, sql`NOW()`)));

    return {
      success: true,
      updated: result.rowCount ?? 0,
    };
  } catch (error) {
    console.error('Error completing expired bookings:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la complétion des réservations expirées.",
    };
  }
}
