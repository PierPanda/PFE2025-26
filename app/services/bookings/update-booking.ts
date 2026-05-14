import { eq, sql } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { bookings } from '~/server/lib/db/schema';
import type { UpdateBookingInput } from '~/types/booking';
import type { UpdateBookingResponse } from '../types';
import { checkBookingConflict } from './check-conflict';

export async function updateBooking(bookingId: string, data: UpdateBookingInput): Promise<UpdateBookingResponse> {
  try {
    const [existing] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);

    if (!existing) {
      return { success: false, error: 'Réservation introuvable.' };
    }

    const effectiveAvailabilityId = data.availabilityId ?? existing.availabilityId;
    const effectiveStartTime = data.startTime ?? existing.startTime;
    const effectiveEndTime = data.endTime ?? existing.endTime;

    const conflict = await checkBookingConflict({
      availabilityId: effectiveAvailabilityId,
      startTime: effectiveStartTime,
      endTime: effectiveEndTime,
      excludeBookingId: bookingId,
    });

    if (conflict) {
      return { success: false, error: 'Ce créneau est déjà réservé pour cette période.' };
    }

    const [updatedBooking] = await db
      .update(bookings)
      .set({ ...data, updatedAt: sql`NOW()` })
      .where(eq(bookings.id, bookingId))
      .returning();

    return {
      success: true,
      message: 'Réservation mise à jour avec succès.',
      booking: updatedBooking,
    };
  } catch (error) {
    console.error('Error updating booking:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la mise à jour de la réservation.",
    };
  }
}
