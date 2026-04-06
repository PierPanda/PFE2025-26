import { eq, sql } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { user } from '~/server/lib/db/schema';
import type { DbUser, ServiceResponse } from '../types';

export async function updateUser(userId: string, data: { name: string }): Promise<ServiceResponse<{ user: DbUser }>> {
  try {
    const [updatedUser] = await db
      .update(user)
      .set({ name: data.name, updatedAt: sql`NOW()` })
      .where(eq(user.id, userId))
      .returning();

    if (!updatedUser) {
      return { success: false, error: 'Utilisateur introuvable.' };
    }

    return { success: true, message: 'Profil mis à jour.', user: updatedUser };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: 'Une erreur est survenue lors de la mise à jour.' };
  }
}
