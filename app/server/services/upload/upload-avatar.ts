import { uploadFile } from '~/server/lib/s3-client';

type ServiceResponse<T> = { success: true; data: T; message: string } | { success: false; error: string };

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function getAvatarExtension(file: File): string | null {
  const name = file.name ?? '';
  const lastDotIndex = name.lastIndexOf('.');

  if (lastDotIndex > 0 && lastDotIndex < name.length - 1) {
    const ext = name
      .substring(lastDotIndex + 1)
      .trim()
      .toLowerCase();
    if (ext) return ext;
  }

  return MIME_TO_EXT[file.type] ?? null;
}

export async function uploadAvatar(file: File, userId: string): Promise<ServiceResponse<string>> {
  const ext = getAvatarExtension(file);
  if (!ext) {
    return { success: false, error: 'Format de fichier non pris en charge.' };
  }

  const key = `avatars/${userId}.${ext}`;
  const result = await uploadFile(file, key);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true, message: 'Avatar uploadé vers R2', data: result.url };
}
