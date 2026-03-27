import { sql } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { bookings } from '~/server/lib/db/schema';
import type { CreateBookingInput } from '~/types/booking';
import type { CreateBookingResponse } from '../types';

/**
 * Create a new booking in database
 */
export async function createBooking(bookingData: CreateBookingInput): Promise<CreateBookingResponse> {
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
      message: 'Réservation créée avec succès.',
      booking: createdBooking,
    };
  } catch (error) {
    console.error('Error creating booking:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la création de la réservation.",
    };
  }
}
