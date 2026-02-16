// Image upload background job processor
import { Worker, Job } from 'bullmq';
import { queueConnection } from '../config';
import { QUEUE_NAMES, ImageUploadJobData } from '../queues';
import { uploadToBackblaze } from '@/lib/s3';

// Create worker for image upload jobs
export const imageUploadWorker = new Worker(
  QUEUE_NAMES.IMAGE_UPLOAD,
  async (job: Job<ImageUploadJobData>) => {
    const { fileBuffer, fileName, folder } = job.data;

    try {
      // Update progress
      await job.updateProgress(10);

      // Create File object from buffer
      const file = new File([new Uint8Array(fileBuffer)], fileName, {
        type: getFileType(fileName),
      });

      await job.updateProgress(30);

      // Upload to Backblaze B2
      const fileKey = await uploadToBackblaze(file, folder);

      await job.updateProgress(90);

      // Return the file key
      return {
        success: true,
        fileKey,
        fileName,
      };
    } catch (error) {
      // Log error
      // eslint-disable-next-line no-console
      console.error('Image upload job failed:', error);
      throw error; // Will trigger retry
    }
  },
  {
    connection: queueConnection as any,
    concurrency: 5, // Process 5 uploads concurrently
  }
);

// Helper function to determine file type
function getFileType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  const typeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    pdf: 'application/pdf',
  };

  return typeMap[ext || ''] || 'application/octet-stream';
}

// Event handlers
imageUploadWorker.on('completed', (job: any) => {
  // eslint-disable-next-line no-console
  console.log(`✅ Image upload job ${job.id} completed:`, job.returnvalue);
});

imageUploadWorker.on('failed', (job: any, err: Error) => {
  // eslint-disable-next-line no-console
  console.error(`❌ Image upload job ${job?.id} failed:`, err.message);
});

imageUploadWorker.on('progress', (job: any, progress: any) => {
  const progressValue = typeof progress === 'number' ? progress : 0;
  // eslint-disable-next-line no-console
  console.log(`📊 Image upload job ${job.id} progress: ${progressValue}%`);
});

// Graceful shutdown
export async function closeImageUploadWorker() {
  await imageUploadWorker.close();
}
