// Application initialization and worker startup
import { initSentry } from './lib/monitoring/sentry';
import { log } from './lib/monitoring/logger';

/**
 * Initialize application infrastructure
 * Call this in your server startup (e.g., in a custom server or Next.js instrumentation)
 */
export async function initializeInfrastructure() {
  log.info('🚀 Initializing application infrastructure...');

  try {
    // Initialize Sentry
    initSentry();

    // Redis is disabled - skip queue and cache features
    log.info('ℹ️ Redis is disabled - queue and cache features will not be available');

    if (process.env.ENABLE_CRON_JOBS === 'true') {
      const { initializeCronJobs } = await import('./lib/cron/scheduler');
      initializeCronJobs();
      log.info('🕐 Cron jobs initialized');
    }

    log.info('✅ Infrastructure initialized successfully (Redis-free mode)');
  } catch (error) {
    log.error('❌ Infrastructure initialization failed', error as Error);
    throw error;
  }
}

/**
 * Graceful shutdown
 */
export async function shutdownInfrastructure() {
  log.info('🛑 Shutting down infrastructure...');

  try {
    // Redis is disabled, no cleanup needed
    log.info('ℹ️ Redis-free mode - no queue/cache cleanup needed');

    if (process.env.ENABLE_CRON_JOBS === 'true') {
      const { stopCronJobs } = await import('./lib/cron/scheduler');
      stopCronJobs();
    }

    log.info('✅ Infrastructure shutdown complete');
  } catch (error) {
    log.error('❌ Infrastructure shutdown failed', error as Error);
  }
}

// Handle process termination
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    log.info('SIGTERM received, shutting down gracefully...');
    await shutdownInfrastructure();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    log.info('SIGINT received, shutting down gracefully...');
    await shutdownInfrastructure();
    process.exit(0);
  });
}
