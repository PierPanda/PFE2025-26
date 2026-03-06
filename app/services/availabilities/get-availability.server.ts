import { count, eq } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { availabilities } from '~/server/lib/db/schema';
import type { GetAvailabilityResponse } from '../types';

/**
 * Get a single availability by ID
 */
export async function getAvailability(availabilityId: string): Promise<GetAvailabilityResponse> {
  try {
    const availability = await db.query.availabilities.findFirst({
      where: eq(availabilities.id, availabilityId),
      with: {
        teacher: {
          with: {
            user: true,
          },
        },
      },
    });

    return {
      success: true,
      availability: availability ?? null,
    };
  } catch (error) {
    console.error('Error fetching availability:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la récupération de la disponibilité.",
    };
  }
}

/**
 * Get availability by teacher ID with user info and courses
 */
export async function getAvailabilityByTeacherId(teacherId: string): Promise<GetAvailabilityResponse> {
  try {
    const availability = await db.query.availabilities.findFirst({
      where: eq(availabilities.teacherId, teacherId),
      with: {
        teacher: {
          with: {
            user: true,
          },
        },
      },
    });

    return {
      success: true,
      availability: availability ?? null,
    };
  } catch (error) {
    console.error('Error fetching availability by teacher ID:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la récupération de la disponibilité.",
    };
  }
}
