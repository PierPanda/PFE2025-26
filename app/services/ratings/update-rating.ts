import { eq, sql } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { ratings } from '~/server/lib/db/schema';
import type { UpdateRatingInput } from '~/types/rating';
import type { UpdateRatingResponse } from '../types';

export async function updateRating(ratingId: string, data: UpdateRatingInput): Promise<UpdateRatingResponse> {
  try {
    const [updated] = await db
      .update(ratings)
      .set({ ...data, updatedAt: sql`NOW()` })
      .where(eq(ratings.id, ratingId))
      .returning();

    if (!updated) {
      return { success: false, error: 'Avis introuvable.' };
    }

    return { success: true, message: 'Avis mis à jour avec succès.', rating: updated };
  } catch (error) {
    console.error('Error updating rating:', error);
    return { success: false, error: "Une erreur s'est produite lors de la mise à jour de l'avis." };
  }
}
