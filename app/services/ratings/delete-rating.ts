import { eq } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { ratings } from '~/server/lib/db/schema';
import type { DeleteRatingResponse } from '../types';

export async function deleteRating(ratingId: string): Promise<DeleteRatingResponse> {
  try {
    await db.delete(ratings).where(eq(ratings.id, ratingId));
    return { success: true, message: 'Avis supprimé avec succès.' };
  } catch (error) {
    console.error('Error deleting rating:', error);
    return { success: false, error: "Une erreur s'est produite lors de la suppression de l'avis." };
  }
}
