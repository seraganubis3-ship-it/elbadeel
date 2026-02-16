// Redis-based caching layer
import { cacheConnection } from '../queue/config';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string; // Key prefix
}

// Default TTL values
export const CACHE_TTL = {
  SERVICES: 60 * 60, // 1 hour
  CATEGORIES: 60 * 60 * 24, // 24 hours
  USER_PROFILE: 60 * 5, // 5 minutes
  ORDERS: 60 * 2, // 2 minutes
  DELEGATES: 60 * 30, // 30 minutes
} as const;

/**
 * Get value from cache
 */
export async function getCache<T>(key: string, prefix = 'cache'): Promise<T | null> {
  try {
    if (!cacheConnection) {
      return null; // Redis not configured
    }
    
    const fullKey = `${prefix}:${key}`;
    const value = await cacheConnection.get(fullKey);
    
    if (!value) {
      return null;
    }
    
    return JSON.parse(value) as T;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Cache get error:', error);
    return null;
  }
}

/**
 * Set value in cache
 */
export async function setCache<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<void> {
  try {
    if (!cacheConnection) {
      return; // Redis not configured, skip caching
    }
    
    const { ttl = 3600, prefix = 'cache' } = options;
    const fullKey = `${prefix}:${key}`;
    const serialized = JSON.stringify(value);
    
    await cacheConnection.setex(fullKey, ttl, serialized);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Cache set error:', error);
  }
}

/**
 * Delete value from cache
 */
export async function deleteCache(key: string, prefix = 'cache'): Promise<void> {
  try {
    if (!cacheConnection) {
      return; // Redis not configured
    }
    
    const fullKey = `${prefix}:${key}`;
    await cacheConnection.del(fullKey);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Cache delete error:', error);
  }
}

/**
 * Delete all keys matching a pattern
 */
export async function deleteCachePattern(pattern: string, prefix = 'cache'): Promise<number> {
  try {
    if (!cacheConnection) {
      return 0; // Redis not configured
    }
    
    const fullPattern = `${prefix}:${pattern}`;
    const keys = await cacheConnection.keys(fullPattern);
    
    if (keys.length === 0) {
      return 0;
    }
    
    await cacheConnection.del(...keys);
    return keys.length;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Cache pattern delete error:', error);
    return 0;
  }
}

/**
 * Cache-aside pattern: Get from cache or fetch and cache
 */
export async function cacheAside<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Try to get from cache
  const cached = await getCache<T>(key, options.prefix);
  
  if (cached !== null) {
    return cached;
  }
  
  // Fetch from source
  const value = await fetchFn();
  
  // Store in cache
  await setCache(key, value, options);
  
  return value;
}

/**
 * Get cache statistics
 */
export async function getCacheStats() {
  try {
    if (!cacheConnection) {
      return null; // Redis not configured
    }
    
    const info = await cacheConnection.info('stats');
    const dbSize = await cacheConnection.dbsize();
    const memory = await cacheConnection.info('memory');
    
    return {
      dbSize,
      info,
      memory,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Cache stats error:', error);
    return null;
  }
}

/**
 * Clear all cache
 */
export async function clearAllCache(): Promise<void> {
  try {
    if (!cacheConnection) {
      return; // Redis not configured
    }
    
    await cacheConnection.flushdb();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Cache clear error:', error);
  }
}
