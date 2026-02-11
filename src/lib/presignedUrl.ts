import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from './s3';

/**
 * Generates a presigned URL for a specific key in the B2 bucket.
 * @param key The file key (path) in the bucket.
 * @param expiresIn Expiration time in seconds (default: 3600 = 1 hour).
 * @returns The presigned URL string.
 */
export async function generatePresignedUrl(key: string, expiresIn = 3600): Promise<string> {
  try {
    // Sanitize Key: If it's a full URL, strip the domain
    let sanitizedKey = key;
    if (key.startsWith('http')) {
       try {
         const urlObj = new URL(key);
         // Key is pathname without leading slash
         sanitizedKey = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
       } catch (e) {
         // Fallback if URL parsing fails, though unlikely for valid URLs
         // Failed to parse URL key
       }
    }

    const command = new GetObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: sanitizedKey,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    // Error generating presigned URL
    return key; // Fallback to original key
  }
}
