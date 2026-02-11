import { S3Client } from '@aws-sdk/client-s3';

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
  return fileName;
}
