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
    });
  }
  
  return new Redis(redisConfig);
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
  await Promise.all([
    queueConnection.quit(),
    cacheConnection.quit(),
    rateLimitConnection.quit(),
  ]);
}
