import { eq, sql } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { learners } from '~/server/lib/db/schema';
import type { UpdateLearnerInput } from '~/lib/validation';
import type { UpdateLearnerResponse } from '../types';

/**
 * Update an existing learner profile in database
 */
export async function updateLearner(learnerId: string, data: UpdateLearnerInput): Promise<UpdateLearnerResponse> {
  try {
    const [updatedLearner] = await db
      .update(learners)
      .set({ ...data, updatedAt: sql`NOW()` })
      .where(eq(learners.id, learnerId))
      .returning();

    if (!updatedLearner) {
      return {
        success: false,
        error: "Apprenant introuvable pour l'identifiant fourni.",
      };
    }
    return {
      success: true,
      message: 'Apprenant mis à jour avec succès.',
      learner: updatedLearner,
    };
  } catch (error) {
    console.error('Error updating learner:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la mise à jour de l'apprenant.",
    };
  }
}
