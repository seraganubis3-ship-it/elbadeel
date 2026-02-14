// Redis connection configuration for queues and caching
import { Redis } from 'ioredis';

// Check if using Upstash REST API or traditional Redis
const isUpstashRest = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

// Redis connection options
export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
  retryStrategy: (times: number) => {
    // Only retry if we have a valid Redis URL or explicit host
    if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
      console.warn('⚠️ No Redis URL configured, skipping retry');
      return null; // Stop retrying
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  // Upstash-specific settings
  ...(isUpstashRest && {
    tls: {
      rejectUnauthorized: false,
    },
  }),
};

// Create Redis connection
export const createRedisConnection = () => {
  // Use Upstash URL if available
  if (process.env.REDIS_URL) {
    return new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      tls: process.env.REDIS_URL.startsWith('rediss://') ? {
        rejectUnauthorized: false,
      } : undefined,
      lazyConnect: true, // Don't connect immediately
    });
  }
  
  // If no REDIS_URL, don't create connection (avoid localhost attempts)
  console.warn('⚠️ No REDIS_URL configured - Redis features will be disabled');
  return null as any; // Return null to prevent connection attempts
};


// Queue-specific Redis connection
export const queueConnection = createRedisConnection();

// Cache-specific Redis connection
export const cacheConnection = createRedisConnection();

// Rate limit-specific Redis connection
export const rateLimitConnection = createRedisConnection();

// Connection health check
export async function checkRedisConnection(): Promise<boolean> {
  try {
    if (!queueConnection) {
      console.warn('⚠️ Redis not configured - features will be disabled');
      return false;
    }
    
    // Connect if lazy
    if (queueConnection.status === 'wait') {
      await queueConnection.connect();
    }
    
    await queueConnection.ping();
    console.log('✅ Redis connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closeRedisConnections() {
  const promises = [];
  
  if (queueConnection) {
    promises.push(queueConnection.quit().catch(() => {}));
  }
  if (cacheConnection) {
    promises.push(cacheConnection.quit().catch(() => {}));
  }
  if (rateLimitConnection) {
    promises.push(rateLimitConnection.quit().catch(() => {}));
  }
  
  await Promise.all(promises);
}
