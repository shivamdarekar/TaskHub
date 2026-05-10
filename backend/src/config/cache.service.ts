import { redis, connectRedis, isRedisAvailable } from './redis';
import { LRUCache } from 'lru-cache';

const ensureRedis = async (): Promise<void> => {
  if (!redis.isOpen) await connectRedis();
};

// ========================================
// Production-Grade LRU Cache
// ========================================
const memoryCache = new LRUCache<string, any>({
  max: 2000,                          // Max 2000 entries
  maxSize: 80 * 1024 * 1024,         // Max 80 MB (safe for Railway free tier)
  ttl: 1000 * 60 * 5,                 // 5 min default TTL
  sizeCalculation: (entry) => JSON.stringify(entry).length,
  allowStale: false,
});

const getFromMemory = <T = any>(key: string): T | null => {
  const entry = memoryCache.get(key);
  return entry ?? null;
};

const setInMemory = (key: string, value: any, ttl: number): void => {
  memoryCache.set(key, value, {
    ttl: (ttl || 300) * 1000, // Convert seconds to milliseconds
    size: JSON.stringify(value).length,
  });
};

// ========================================
// General Cache Helpers
// ========================================

export const getCache = async <T = any>(key: string): Promise<T | null> => {
  try {
    if (isRedisAvailable) {
      await ensureRedis();
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    }
  } catch (error) {
    console.warn(`Cache get error for key ${key}, using memory cache`);
  }

  return getFromMemory<T>(key);
};

export const setCache = async (key: string, value: any, ttl: number): Promise<void> => {
  try {
    if (isRedisAvailable) {
      await ensureRedis();
      await redis.setEx(key, ttl, JSON.stringify(value));
    }
  } catch (error) {
    console.warn(`Cache set error for key ${key}, using memory cache`);
  }

  setInMemory(key, value, ttl);
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    if (isRedisAvailable) {
      await ensureRedis();
      await redis.del(key);
    }
  } catch (error) {
    console.warn(`Cache delete error for key ${key}`);
  }

  memoryCache.delete(key);
};

export const deleteCachePattern = async (pattern: string): Promise<void> => {
  try {
    if (isRedisAvailable) {
      await ensureRedis();
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys as [string, ...string[]]);
      }
    }
  } catch (error) {
    console.warn(`Cache delete pattern error for ${pattern}`);
  }

  // Delete from memory cache using pattern matching
  const regex = new RegExp(pattern.replace(/\*/g, '.*'));
  for (const key of memoryCache.keys()) {
    if (regex.test(key)) {
      memoryCache.delete(key);
    }
  }
};

export const existsCache = async (key: string): Promise<boolean> => {
  try {
    if (isRedisAvailable) {
      await ensureRedis();
      const exists = await redis.exists(key);
      return exists === 1;
    }
  } catch (error) {
    console.warn(`Cache exists error for key ${key}`);
  }

  return memoryCache.has(key) && getFromMemory(key) !== null;
};

export const incrementCache = async (key: string, ttl?: number): Promise<number> => {
  try {
    if (isRedisAvailable) {
      await ensureRedis();
      const count = await redis.incr(key);
      if (ttl && count === 1) {
        await redis.expire(key, ttl);
      }
      return count;
    }
  } catch (error) {
    console.warn(`Cache increment error for key ${key}`);
  }

  // Fallback to memory cache
  const current = getFromMemory<number>(key) || 0;
  const newCount = current + 1;
  setInMemory(key, newCount, ttl ?? 0); // Use 0 (no expiry) if ttl undefined
  return newCount;
};

// ========================================
// TTL Constants (in seconds)
// ========================================
export const CacheTTL = {
  SHORT: 60,           // 1 minute
  MEDIUM: 300,         // 5 minutes
  LONG: 1800,          // 30 minutes
  VERY_LONG: 3600,     // 1 hour
  DAY: 86400,          // 24 hours
} as const;
