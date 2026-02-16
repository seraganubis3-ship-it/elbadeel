// Redis-based rate limiter
import { rateLimitConnection } from '../queue/config';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  blockDurationMs?: number; // How long to block after limit exceeded
}

// Default configurations for different routes
export const RATE_LIMIT_CONFIGS = {
  API_STRICT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    blockDurationMs: 60 * 60 * 1000, // 1 hour
  },
  API_MODERATE: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 300,
    blockDurationMs: 30 * 60 * 1000, // 30 minutes
  },
  API_RELAXED: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 1000,
  },
  AUTH: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5, // Very strict for auth
    blockDurationMs: 2 * 60 * 60 * 1000, // 2 hours
  },
  PUBLIC: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
  },
} as const;

/**
 * Check if a request should be rate limited
 * Uses sliding window algorithm with Redis
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.API_MODERATE
): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
  blocked: boolean;
}> {
  const now = Date.now();
  const key = `ratelimit:${identifier}`;
  const blockKey = `ratelimit:block:${identifier}`;

  try {
    // Check if IP is blocked
    const isBlocked = await rateLimitConnection.get(blockKey);
    if (isBlocked) {
      const ttl = await rateLimitConnection.ttl(blockKey);
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + ttl * 1000,
        blocked: true,
      };
    }

    // Use Redis sorted set for sliding window
    const windowStart = now - config.windowMs;

    // Remove old entries
    await rateLimitConnection.zremrangebyscore(key, 0, windowStart);

    // Count current requests in window
    const requestCount = await rateLimitConnection.zcard(key);

    if (requestCount >= config.maxRequests) {
      // Block if configured
      if (config.blockDurationMs) {
        await rateLimitConnection.setex(
          blockKey,
          Math.floor(config.blockDurationMs / 1000),
          '1'
        );
      }

      return {
        allowed: false,
        remaining: 0,
        resetTime: now + config.windowMs,
        blocked: false,
      };
    }

    // Add current request
    await rateLimitConnection.zadd(key, now, `${now}-${Math.random()}`);

    // Set expiry on the key
    await rateLimitConnection.expire(key, Math.ceil(config.windowMs / 1000));

    return {
      allowed: true,
      remaining: config.maxRequests - requestCount - 1,
      resetTime: now + config.windowMs,
      blocked: false,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Rate limit check failed:', error);
    // Fail open - allow request if Redis is down
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetTime: now + config.windowMs,
      blocked: false,
    };
  }
}

/**
 * Manually block an identifier (IP or user ID)
 */
export async function blockIdentifier(
  identifier: string,
  durationMs: number = 24 * 60 * 60 * 1000 // 24 hours default
): Promise<void> {
  const blockKey = `ratelimit:block:${identifier}`;
  await rateLimitConnection.setex(blockKey, Math.floor(durationMs / 1000), '1');
}

/**
 * Unblock an identifier
 */
export async function unblockIdentifier(identifier: string): Promise<void> {
  const blockKey = `ratelimit:block:${identifier}`;
  await rateLimitConnection.del(blockKey);
}

/**
 * Get rate limit info without incrementing
 */
export async function getRateLimitInfo(
  identifier: string,
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.API_MODERATE
): Promise<{
  requestCount: number;
  remaining: number;
  blocked: boolean;
}> {
  const key = `ratelimit:${identifier}`;
  const blockKey = `ratelimit:block:${identifier}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  const isBlocked = await rateLimitConnection.get(blockKey);
  if (isBlocked) {
    return {
      requestCount: config.maxRequests,
      remaining: 0,
      blocked: true,
    };
  }

  await rateLimitConnection.zremrangebyscore(key, 0, windowStart);
  const requestCount = await rateLimitConnection.zcard(key);

  return {
    requestCount,
    remaining: Math.max(0, config.maxRequests - requestCount),
    blocked: false,
  };
}
