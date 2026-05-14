import { sql } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { ratings } from '~/server/lib/db/schema';
import type { CreateRatingInput } from '~/types/rating';
import type { CreateRatingResponse } from '../types';

export async function createRating(data: CreateRatingInput): Promise<CreateRatingResponse> {
  try {
    const [created] = await db
      .insert(ratings)
      .values({
        ...data,
        createdAt: sql`NOW()`,
        updatedAt: sql`NOW()`,
      })
      .returning();

    return { success: true, message: 'Avis publié avec succès.', rating: created };
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      return { success: false, error: 'Vous avez déjà noté ce cours.' };
    }
    console.error('Error creating rating:', error);
    return { success: false, error: "Une erreur s'est produite lors de la publication de l'avis." };
  }
}
