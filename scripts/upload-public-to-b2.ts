import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import * as fs from 'fs';
import * as path from 'path';

const B2_ENDPOINT = process.env.B2_ENDPOINT || 's3.us-east-005.backblazeb2.com';
const B2_REGION = process.env.B2_REGION || 'us-east-005';
const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME || 'elbadeel';

const s3Client = new S3Client({
  endpoint: B2_ENDPOINT.startsWith('http') ? B2_ENDPOINT : `https://${B2_ENDPOINT}`,
  region: B2_REGION,
  credentials: {
    accessKeyId: process.env.B2_APPLICATION_KEY_ID || '',
    secretAccessKey: process.env.B2_APPLICATION_KEY || '',
  },
});

async function uploadFileToB2(filePath: string, key: string): Promise<string> {
  const fileContent = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();

  const contentTypeMap: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  };

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: B2_BUCKET_NAME,
      Key: key,
      Body: fileContent,
      ContentType: contentTypeMap[ext] || 'application/octet-stream',
    },
  });

  await upload.done();
  const fullUrl = `https://f005.backblazeb2.com/file/${B2_BUCKET_NAME}/${key}`;
  return fullUrl;
}

async function uploadPublicFiles() {
  console.log('🚀 Starting public files upload to B2...\n');

  const publicDir = path.join(process.cwd(), 'public');
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

  function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      if (fs.statSync(filePath).isDirectory()) {
        arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
      } else {
        const ext = path.extname(file).toLowerCase();
        if (imageExtensions.includes(ext)) {
          arrayOfFiles.push(filePath);
        }
      }
    });

    return arrayOfFiles;
  }

  try {
    const allImageFiles = getAllFiles(publicDir);
    console.log(`📦 Found ${allImageFiles.length} image files to upload\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const filePath of allImageFiles) {
      try {
        const relativePath = path.relative(publicDir, filePath);
        const key = `public/${relativePath.replace(/\\/g, '/')}`;

        console.log(`⬆️  Uploading: ${relativePath}`);
        const url = await uploadFileToB2(filePath, key);
        console.log(`   ✅ Success: ${url}\n`);
        successCount++;
      } catch (error) {
        console.error(`   ❌ Error uploading ${filePath}:`, error);
        errorCount++;
      }
    }

    console.log('\n✨ Upload completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Total files: ${allImageFiles.length}`);
    console.log(`   - Successful: ${successCount}`);
    console.log(`   - Failed: ${errorCount}`);
  } catch (error) {
    console.error('❌ Error during upload:', error);
    throw error;
  }
}

// Run the upload
uploadPublicFiles()
  .then(() => {
    console.log('\n✅ All done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Upload failed:', error);
    process.exit(1);
  });
