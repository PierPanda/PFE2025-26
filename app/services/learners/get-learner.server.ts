import { eq } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { learners, bookings } from '~/server/lib/db/schema';
import type { GetLearnerResponse } from '../types';

/**
 * Get a single learner by ID with user info
 */
export async function getLearner(learnerId: string): Promise<GetLearnerResponse> {
  try {
    const learner = await db.query.learners.findFirst({
      where: eq(learners.id, learnerId),
      with: {
        user: true,
        bookings: true,
      },
    });

    return {
      success: true,
      learner: learner ?? null,
    };
  } catch (error) {
    console.error('Error fetching learner:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la récupération de l'apprenant.",
    };
  }
}

/**
 * Get learner by user ID with user info
 */
export async function getLearnerByUserId(userId: string): Promise<GetLearnerResponse> {
  try {
    const learner = await db.query.learners.findFirst({
      where: eq(learners.userId, userId),
      with: {
        user: true,
        bookings: true,
      },
    });

    return {
      success: true,
      learner: learner ?? null,
    };
  } catch (error) {
    console.error('Error fetching learner by user ID:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la récupération de l'apprenant.",
    };
  }
}
