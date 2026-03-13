import { eq } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { availabilities } from '~/server/lib/db/schema';
import type { DeleteAvailabilityResponse } from '../types';

/**
 * Delete a availability from database
 */
export async function deleteAvailability(availabilityId: string): Promise<DeleteAvailabilityResponse> {
  try {
    await db.delete(availabilities).where(eq(availabilities.id, availabilityId));

    return {
      success: true,
      message: 'Disponibilité supprimée avec succès.',
    };
  } catch (error) {
    console.error('Error deleting availability:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la suppression de la disponibilité.",
    };
  }
}
