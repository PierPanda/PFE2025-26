import { eq, sql } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { availabilities } from '~/server/lib/db/schema';
import type { UpdateAvailabilityInput } from '~/types/availability';
import type { UpdateAvailabilityResponse } from '../types';

/**
 * Update an existing availability profile in database
 */
export async function updateAvailability(
  availabilityId: string,
  data: UpdateAvailabilityInput,
): Promise<UpdateAvailabilityResponse> {
  try {
    const [updatedAvailability] = await db
      .update(availabilities)
      .set({ ...data, updatedAt: sql`NOW()` })
      .where(eq(availabilities.id, availabilityId))
      .returning();

    if (!updatedAvailability) {
      return {
        success: false,
        error: "Disponibilité introuvable pour l'identifiant fourni.",
      };
    }
    return {
      success: true,
      message: 'Disponibilité mise à jour avec succès.',
      availability: updatedAvailability,
    };
  } catch (error) {
    console.error('Error updating availability:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la mise à jour de la disponibilité.",
    };
  }
}
