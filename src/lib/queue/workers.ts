// Worker initialization and management
import { imageUploadWorker, closeImageUploadWorker } from './jobs/imageUpload';
import { emailWorker, whatsappWorker, closeNotificationWorkers } from './jobs/notifications';

// Start all workers
export function startWorkers() {
  console.log('🚀 Starting queue workers...');
  
  // Workers are automatically started when imported
  console.log('✅ Image upload worker started');
  console.log('✅ Email worker started');
  console.log('✅ WhatsApp worker started');
}

// Stop all workers gracefully
export async function stopWorkers() {
  console.log('🛑 Stopping queue workers...');
  
  await Promise.all([
    closeImageUploadWorker(),
    closeNotificationWorkers(),
  ]);
  
  console.log('✅ All workers stopped');
}

// Export workers for monitoring
export { imageUploadWorker, emailWorker, whatsappWorker };
