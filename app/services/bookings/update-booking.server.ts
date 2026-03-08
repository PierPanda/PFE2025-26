import { eq, sql } from "drizzle-orm";
import { db } from "~/server/lib/db/index.server";
import { bookings } from "~/server/lib/db/schema";
import type { UpdateBookingInput } from "~/types/booking";
import type { UpdateBookingResponse } from "../types";

/**
 * Update an existing booking in database
 */
export async function updateBooking(
  bookingId: string,
  data: UpdateBookingInput,
): Promise<UpdateBookingResponse> {
  try {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ ...data, updatedAt: sql`NOW()` })
      .where(eq(bookings.id, bookingId))
      .returning();

    if (!updatedBooking) {
      return {
        success: false,
        error: "Réservation introuvable.",
      };
    }

    return {
      success: true,
      message: "Réservation mise à jour avec succès.",
      booking: updatedBooking,
    };
  } catch (error) {
    console.error("Error updating booking:", error);
    return {
      success: false,
      error:
        "Une erreur s'est produite lors de la mise a jour de la réservation.",
    };
  }
}
