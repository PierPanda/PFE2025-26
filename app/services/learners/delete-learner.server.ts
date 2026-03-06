import { eq } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { learners } from '~/server/lib/db/schema';
import type { DeleteLearnerResponse } from '../types';

/**
 * Delete a learner profile from database
 */
export async function deleteLearner(learnerId: string): Promise<DeleteLearnerResponse> {
  try {
    await db.delete(learners).where(eq(learners.id, learnerId));

    return {
      success: true,
      message: 'Apprenant supprimé avec succès.',
    };
  } catch (error) {
    console.error('Error deleting learner:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la suppression de l'apprenant.",
    };
  }
}
