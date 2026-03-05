import { redis, connectRedis } from './redis';

const ensureRedis = async (): Promise<void> => {
  if (!redis.isOpen) await connectRedis();
};

// ========================================
// General Cache Helpers
// ========================================

export const getCache = async <T = any>(key: string): Promise<T | null> => {
  try {
    await ensureRedis();
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error(`Cache get error for key ${key}:`, error);
    return null;
  }
};

export const setCache = async (key: string, value: any, ttl: number): Promise<void> => {
  try {
    await ensureRedis();
    await redis.setEx(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error(`Cache set error for key ${key}:`, error);
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    await ensureRedis();
    await redis.del(key);
  } catch (error) {
    console.error(`Cache delete error for key ${key}:`, error);
  }
};

export const deleteCachePattern = async (pattern: string): Promise<void> => {
  try {
    await ensureRedis();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys as [string, ...string[]]);
    }
  } catch (error) {
    console.error(`Cache delete pattern error for ${pattern}:`, error);
  }
};

export const existsCache = async (key: string): Promise<boolean> => {
  try {
    await ensureRedis();
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    console.error(`Cache exists error for key ${key}:`, error);
    return false;
  }
};

export const incrementCache = async (key: string, ttl?: number): Promise<number> => {
  try {
    await ensureRedis();
    const count = await redis.incr(key);
    if (ttl && count === 1) {
      await redis.expire(key, ttl);
    }
    return count;
  } catch (error) {
    console.error(`Cache increment error for key ${key}:`, error);
    return 0;
  }
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
