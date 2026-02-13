// Queue definitions and processors
import { Queue, Worker, Job } from 'bullmq';
import { queueConnection } from './config';

// Queue names
export const QUEUE_NAMES = {
  IMAGE_UPLOAD: 'image-upload',
  EMAIL_NOTIFICATION: 'email-notification',
  WHATSAPP_NOTIFICATION: 'whatsapp-notification',
  REPORT_GENERATION: 'report-generation',
  FILE_CLEANUP: 'file-cleanup',
} as const;

// Queue options
const defaultQueueOptions = {
  connection: queueConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential' as const,
      delay: 2000,
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
      age: 24 * 3600, // Keep for 24 hours
    },
    removeOnFail: {
      count: 500, // Keep last 500 failed jobs
      age: 7 * 24 * 3600, // Keep for 7 days
    },
  },
};

// Create queues
export const imageUploadQueue = new Queue(QUEUE_NAMES.IMAGE_UPLOAD, defaultQueueOptions);
export const emailQueue = new Queue(QUEUE_NAMES.EMAIL_NOTIFICATION, defaultQueueOptions);
export const whatsappQueue = new Queue(QUEUE_NAMES.WHATSAPP_NOTIFICATION, defaultQueueOptions);
export const reportQueue = new Queue(QUEUE_NAMES.REPORT_GENERATION, defaultQueueOptions);
export const cleanupQueue = new Queue(QUEUE_NAMES.FILE_CLEANUP, defaultQueueOptions);

// Job data types
export interface ImageUploadJobData {
  fileBuffer: Buffer;
  fileName: string;
  folder: string;
  userId?: string;
  orderId?: string;
}

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    path: string;
  }>;
}

export interface WhatsAppJobData {
  phone: string;
  message: string;
  orderId?: string;
}

export interface ReportJobData {
  reportType: string;
  orderIds: string[];
  delegateId?: string;
  userId: string;
}

export interface CleanupJobData {
  folder: string;
  olderThanDays: number;
}

// Add jobs to queues
export async function addImageUploadJob(data: ImageUploadJobData) {
  return await imageUploadQueue.add('upload', data, {
    priority: 1, // High priority
  });
}

export async function addEmailJob(data: EmailJobData) {
  return await emailQueue.add('send', data, {
    priority: 2,
  });
}

export async function addWhatsAppJob(data: WhatsAppJobData) {
  return await whatsappQueue.add('send', data, {
    priority: 2,
  });
}

export async function addReportJob(data: ReportJobData) {
  return await reportQueue.add('generate', data, {
    priority: 3,
  });
}

export async function addCleanupJob(data: CleanupJobData) {
  return await cleanupQueue.add('cleanup', data, {
    priority: 5, // Low priority
  });
}

// Get job status
export async function getJobStatus(queueName: string, jobId: string) {
  const queue = getQueueByName(queueName);
  const job = await queue.getJob(jobId);
  
  if (!job) {
    return { status: 'not_found' };
  }

  const state = await job.getState();
  const progress = job.progress;
  
  return {
    status: state,
    progress,
    data: job.data,
    returnvalue: job.returnvalue,
    failedReason: job.failedReason,
  };
}

function getQueueByName(name: string): Queue {
  switch (name) {
    case QUEUE_NAMES.IMAGE_UPLOAD:
      return imageUploadQueue;
    case QUEUE_NAMES.EMAIL_NOTIFICATION:
      return emailQueue;
    case QUEUE_NAMES.WHATSAPP_NOTIFICATION:
      return whatsappQueue;
    case QUEUE_NAMES.REPORT_GENERATION:
      return reportQueue;
    case QUEUE_NAMES.FILE_CLEANUP:
      return cleanupQueue;
    default:
      throw new Error(`Unknown queue: ${name}`);
  }
}

// Queue statistics
export async function getQueueStats(queueName: string) {
  const queue = getQueueByName(queueName);
  
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
}

// Graceful shutdown
export async function closeQueues() {
  await Promise.all([
    imageUploadQueue.close(),
    emailQueue.close(),
    whatsappQueue.close(),
    reportQueue.close(),
    cleanupQueue.close(),
  ]);
}
