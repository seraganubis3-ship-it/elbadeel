// Worker initialization and management
import { imageUploadWorker, closeImageUploadWorker } from './jobs/imageUpload';
import { emailWorker, whatsappWorker, closeNotificationWorkers } from './jobs/notifications';

// Start all workers
export function startWorkers() {
  // eslint-disable-next-line no-console
  console.log('🚀 Starting queue workers...');
  
  // Workers are automatically started when imported
  // eslint-disable-next-line no-console
  console.log('✅ Image upload worker started');
  // eslint-disable-next-line no-console
  console.log('✅ Email worker started');
  // eslint-disable-next-line no-console
  console.log('✅ WhatsApp worker started');
}

// Stop all workers gracefully
export async function stopWorkers() {
  // eslint-disable-next-line no-console
  console.log('🛑 Stopping queue workers...');
  
  await Promise.all([
    closeImageUploadWorker(),
    closeNotificationWorkers(),
  ]);
  
  // eslint-disable-next-line no-console
  console.log('✅ All workers stopped');
}

// Export workers for monitoring
export { imageUploadWorker, emailWorker, whatsappWorker };
