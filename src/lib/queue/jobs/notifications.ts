// Notification job processors (Email & WhatsApp)
import { Worker, Job } from 'bullmq';
import { queueConnection } from '../config';
import { QUEUE_NAMES, EmailJobData, WhatsAppJobData } from '../queues';
import nodemailer from 'nodemailer';

// Email transporter configuration
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Email worker
export const emailWorker = new Worker(
  QUEUE_NAMES.EMAIL_NOTIFICATION,
  async (job: Job<EmailJobData>) => {
    const { to, subject, html, attachments } = job.data;

    try {
      await job.updateProgress(20);

      const info = await emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@albadel.com.eg',
        to,
        subject,
        html,
        attachments,
      });

      await job.updateProgress(100);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Email job failed:', error);
      throw error;
    }
  },
  {
    connection: queueConnection as any,
    concurrency: 3,
  }
);

// WhatsApp worker
export const whatsappWorker = new Worker(
  QUEUE_NAMES.WHATSAPP_NOTIFICATION,
  async (job: Job<WhatsAppJobData>) => {
    const { phone, message, orderId } = job.data;

    try {
      await job.updateProgress(20);

      // TODO: Integrate with WhatsApp bot
      // For now, just log
      // eslint-disable-next-line no-console
      console.log(`📱 WhatsApp to ${phone}: ${message} (Order: ${orderId})`);

      await job.updateProgress(100);

      return {
        success: true,
        phone,
        orderId,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('WhatsApp job failed:', error);
      throw error;
    }
  },
  {
    connection: queueConnection as any,
    concurrency: 5,
  }
);

// Event handlers for email worker
emailWorker.on('completed', (job: any) => {
  // eslint-disable-next-line no-console
  console.log(`✅ Email job ${job.id} completed`);
});

emailWorker.on('failed', (job: any, err: Error) => {
  // eslint-disable-next-line no-console
  console.error(`❌ Email job ${job?.id} failed:`, err.message);
});

// Event handlers for WhatsApp worker
whatsappWorker.on('completed', (job: any) => {
  // eslint-disable-next-line no-console
  console.log(`✅ WhatsApp job ${job.id} completed`);
});

whatsappWorker.on('failed', (job: any, err: Error) => {
  // eslint-disable-next-line no-console
  console.error(`❌ WhatsApp job ${job?.id} failed:`, err.message);
});

// Graceful shutdown
export async function closeNotificationWorkers() {
  await Promise.all([emailWorker.close(), whatsappWorker.close()]);
}
