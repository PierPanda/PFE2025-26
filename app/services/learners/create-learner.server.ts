import { sql } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { learners } from '~/server/lib/db/schema';
import type { CreateLearnerInput } from '~/types/learner';
import type { CreateLearnerResponse } from '../types';

/**
 * Create a new learner profile in database
 */
export async function createLearner(learnerData: CreateLearnerInput): Promise<CreateLearnerResponse> {
  try {
    const [createdLearner] = await db
      .insert(learners)
      .values({
        ...learnerData,
        createdAt: sql`NOW()`,
        updatedAt: sql`NOW()`,
      })
      .returning();

    return {
      success: true,
      message: 'Apprenant créé avec succès.',
      learner: createdLearner,
    };
  } catch (error) {
    console.error('Error creating learner:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la création de l'apprenant.",
    };
  }
}
