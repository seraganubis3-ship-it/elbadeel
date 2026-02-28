import { S3Client } from '@aws-sdk/client-s3';
import { createReadStream } from 'fs';
import path from 'path';

const B2_ENDPOINT = process.env.B2_ENDPOINT || '';
const B2_REGION = process.env.B2_REGION || 'us-east-005';

export const s3Client = new S3Client({
  endpoint: B2_ENDPOINT.startsWith('http') ? B2_ENDPOINT : `https://${B2_ENDPOINT}`,
  region: B2_REGION,
  credentials: {
    accessKeyId: process.env.B2_APPLICATION_KEY_ID || '',
    secretAccessKey: process.env.B2_APPLICATION_KEY || '',
  },
});

import { Upload } from '@aws-sdk/lib-storage';

export async function uploadToBackblaze(file: File, folder: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = `${folder}/${Date.now()}_${file.name.replace(/\s/g, '_')}`;

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.B2_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    },
  });

  await upload.done();

  // Return full B2 URL instead of just the file path
  const bucketName = process.env.B2_BUCKET_NAME;
  const region = process.env.B2_REGION || 'us-east-005';

  // B2 friendly URL format: https://f005.backblazeb2.com/file/<bucket>/<key>
  const publicBaseUrl =
    process.env.B2_PUBLIC_BASE_URL || `https://f005.backblazeb2.com/file/${bucketName}`;
  const fullUrl = `${publicBaseUrl}/${fileName}`;

  return fullUrl;
}

export async function uploadLocalFileToBackblaze(
  filePath: string,
  folder: string,
  contentType: string = 'application/octet-stream'
): Promise<string> {
  const baseName = path.basename(filePath);
  const fileName = `${folder}/${Date.now()}_${baseName.replace(/\s/g, '_')}`;

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.B2_BUCKET_NAME,
      Key: fileName,
      Body: createReadStream(filePath),
      ContentType: contentType,
    },
  });

  await upload.done();

  const bucketName = process.env.B2_BUCKET_NAME;
  const publicBaseUrl =
    process.env.B2_PUBLIC_BASE_URL || `https://f005.backblazeb2.com/file/${bucketName}`;
  return `${publicBaseUrl}/${fileName}`;
}
