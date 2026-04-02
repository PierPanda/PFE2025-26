import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { env } from '~/server/utils/env';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const s3Client = new S3Client({
  region: 'auto',
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

type UploadResult = { success: true; url: string } | { success: false; error: string };

export async function uploadFile(file: File, key: string): Promise<UploadResult> {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { success: false, error: 'Type de fichier non autorisé (jpeg, png, webp uniquement)' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { success: false, error: 'Fichier trop volumineux (5 MB maximum)' };
  }

  const buffer = await file.arrayBuffer();

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.R2_BUCKET,
        Key: key,
        Body: Buffer.from(buffer),
        ContentType: file.type,
      }),
    );
  } catch (error) {
    console.error('R2 upload error:', error);
    return { success: false, error: "Échec de l'upload vers le stockage." };
  }

  const baseUrl = env.R2_PUBLIC_URL.replace(/\/$/, '');
  return { success: true, url: `${baseUrl}/${key}` };
}
