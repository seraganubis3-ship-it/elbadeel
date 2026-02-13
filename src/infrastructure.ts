// Application initialization and worker startup
import { startWorkers } from './lib/queue/workers';
import { initializeCronJobs } from './lib/cron/scheduler';
import { initSentry } from './lib/monitoring/sentry';
import { log } from './lib/monitoring/logger';
import { checkRedisConnection } from './lib/queue/config';

/**
 * Initialize application infrastructure
 * Call this in your server startup (e.g., in a custom server or Next.js instrumentation)
 */
export async function initializeInfrastructure() {
  log.info('🚀 Initializing application infrastructure...');

  try {
    // Initialize Sentry
    initSentry();

    // Check Redis connection
    const redisConnected = await checkRedisConnection();
    if (!redisConnected) {
      log.warn('⚠️ Redis connection failed, queue and cache features will be disabled');
      return;
    }
    log.info('✅ Redis connected');

    // Start queue workers
    startWorkers();

    // Initialize cron jobs
    initializeCronJobs();

    log.info('✅ Infrastructure initialized successfully');
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
    const { stopWorkers } = await import('./lib/queue/workers');
    const { stopCronJobs } = await import('./lib/cron/scheduler');
    const { closeRedisConnections } = await import('./lib/queue/config');
    const { closeQueues } = await import('./lib/queue/queues');

    // Stop workers
    await stopWorkers();

    // Stop cron jobs
    stopCronJobs();

    // Close queues
    await closeQueues();

    // Close Redis connections
    await closeRedisConnections();

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
