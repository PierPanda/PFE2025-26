import { sql } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { availabilities } from '~/server/lib/db/schema';
import type { CreateAvailabilityInput } from '~/types/availability';
import type { CreateAvailabilityResponse } from '../types';

/**
 * Create a new availability in database
 */
export async function createAvailability(
  availabilityData: CreateAvailabilityInput,
): Promise<CreateAvailabilityResponse> {
  try {
    const [createdAvailability] = await db
      .insert(availabilities)
      .values({
        ...availabilityData,
        createdAt: sql`NOW()`,
        updatedAt: sql`NOW()`,
      })
      .returning();

    return {
      success: true,
      message: 'Disponibilité créée avec succès.',
      availability: createdAvailability,
    };
  } catch (error) {
    console.error('Error creating availability:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la création de la disponibilité.",
    };
  }
}
