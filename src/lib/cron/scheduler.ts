// Cron job scheduler
import cron from 'node-cron';
import { cleanupOldFiles } from './jobs/cleanup';

// Store active cron jobs
const activeCronJobs: Map<string, cron.ScheduledTask> = new Map();

/**
 * Initialize all cron jobs
 */
export function initializeCronJobs() {
  // eslint-disable-next-line no-console
  console.log('🕐 Initializing cron jobs...');

  // Cleanup old files - Daily at 2 AM
  const cleanupJob = cron.schedule(
    '0 2 * * *',
    async () => {
      // eslint-disable-next-line no-console
      console.log('🧹 Running file cleanup job...');
      try {
        await cleanupOldFiles();
        // eslint-disable-next-line no-console
        console.log('✅ File cleanup completed');
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('❌ File cleanup failed:', error);
      }
    },
    {
      scheduled: true,
      timezone: 'Africa/Cairo',
    }
  );
  activeCronJobs.set('cleanup', cleanupJob);

  // Database backup - Daily at 3 AM (commented out - requires backup job)
  // const backupJob = cron.schedule(
  //   '0 3 * * *',
  //   async () => {
  //     console.log('💾 Running database backup job...');
  //     try {
  //       await performDatabaseBackup();
  //       console.log('✅ Database backup completed');
  //     } catch (error) {
  //       console.error('❌ Database backup failed:', error);
  //     }
  //   },
  //   {
  //     scheduled: true,
  //     timezone: 'Africa/Cairo',
  //   }
  // );
  // activeCronJobs.set('backup', backupJob);

  // Daily reports - DISABLED (now using analytics dashboard)
  // Keeping the logic available for manual triggers
  // const reportsJob = cron.schedule(
  //   '0 8 * * *',
  //   async () => {
  //     console.log('📊 Running daily reports job...');
  //     try {
  //       await generateDailyReports();
  //       console.log('✅ Daily reports completed');
  //     } catch (error) {
  //       console.error('❌ Daily reports failed:', error);
  //     }
  //   },
  //   {
  //     scheduled: true,
  //     timezone: 'Africa/Cairo',
  //   }
  // );
  // activeCronJobs.set('reports', reportsJob);

  // Health check - Every 5 minutes
  const healthCheckJob = cron.schedule(
    '*/5 * * * *',
    async () => {
      // Silent health check
      try {
        const { checkDatabaseHealth } = await import('@/lib/databaseMonitor');
        const health = await checkDatabaseHealth();
        if (!health.healthy) {
          // eslint-disable-next-line no-console
          console.warn('⚠️ Database health issues detected:', health.issues);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('❌ Health check failed:', error);
      }
    },
    {
      scheduled: true,
      timezone: 'Africa/Cairo',
    }
  );
  activeCronJobs.set('health-check', healthCheckJob);

  // eslint-disable-next-line no-console
  console.log(`✅ ${activeCronJobs.size} cron jobs initialized`);
}

/**
 * Stop all cron jobs
 */
export function stopCronJobs() {
  // eslint-disable-next-line no-console
  console.log('🛑 Stopping cron jobs...');
  activeCronJobs.forEach((job, name) => {
    job.stop();
    // eslint-disable-next-line no-console
    console.log(`✅ Stopped: ${name}`);
  });
  activeCronJobs.clear();
}

/**
 * Get status of all cron jobs
 */
export function getCronJobsStatus() {
  const status: Record<string, boolean> = {};
  activeCronJobs.forEach((job, name) => {
    // Check if job is running (node-cron doesn't have getStatus)
    status[name] = true; // Assume running if in map
  });
  return status;
}

/**
 * Manually trigger a specific job
 */
export async function triggerJob(jobName: string) {
  switch (jobName) {
    case 'cleanup':
      await cleanupOldFiles();
      break;
    // case 'backup':
    //   await performDatabaseBackup();
    //   break;
    // case 'reports':
    //   await generateDailyReports();
    //   break;
    default:
      throw new Error(`Unknown job: ${jobName}`);
  }
}
