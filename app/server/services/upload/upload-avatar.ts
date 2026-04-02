import { eq } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { user } from '~/server/lib/db/schema';
import { uploadFile } from '~/server/lib/s3';

type ServiceResponse<T> = { success: true; data: T; message: string } | { success: false; error: string };

export async function uploadAvatar(file: File, userId: string): Promise<ServiceResponse<string>> {
  const ext = file.name.split('.').pop();
  const key = `avatars/${userId}.${ext}`;

  const result = await uploadFile(file, key);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  await db.update(user).set({ image: result.url }).where(eq(user.id, userId));

  return { success: true, message: 'Photo de profil mise à jour', data: result.url };
}
