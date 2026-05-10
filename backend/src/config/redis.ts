import { createClient } from 'redis';

// Build Redis configuration object
const redisConfig: any = {
  socket: process.env.REDIS_USE_TLS === 'true' ? {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    tls: true,
  } : {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
};

// Only add username and password if they exist
if (process.env.REDIS_USERNAME) {
  redisConfig.username = process.env.REDIS_USERNAME;
}
if (process.env.REDIS_PASSWORD) {
  redisConfig.password = process.env.REDIS_PASSWORD;
}

export const redis = createClient({
  ...redisConfig,
  socket: {
    ...redisConfig.socket,
    reconnectStrategy: () => false, // Disable automatic reconnection
  },
});

export let isRedisAvailable = false;
let hasLoggedError = false;

redis.on('error', (err) => {
  if (!hasLoggedError) {
    console.warn('⚠️ Redis unavailable, using fallback in-memory cache:', err.message);
    hasLoggedError = true;
  }
  isRedisAvailable = false;
});
redis.on('connect', () => {
  console.log('🔄 Redis connecting...');
});
redis.on('ready', () => {
  console.log('✅ Redis ready');
  isRedisAvailable = true;
  hasLoggedError = false;
});

let initialized = false;

export const connectRedis = async (): Promise<void> => {
  if (!initialized) {
    try {
      await redis.connect();
      initialized = true;
      isRedisAvailable = true;
      console.log('✅ Redis connected successfully');
    } catch (error) {
      if (!hasLoggedError) {
        console.warn('⚠️ Redis connection failed, using fallback in-memory cache');
        hasLoggedError = true;
      }
      isRedisAvailable = false;
      initialized = true;
    }
  }
};

export const disconnectRedis = async (): Promise<void> => {
  if (initialized) {
    await redis.quit();
    initialized = false;
    console.log('✅ Redis disconnected');
  }
};

// ========================================
// Session helpers with fallback (keyed by JWT jti)
// ========================================
const sessionKey = (jti: string) => `auth:session:${jti}`;
const blacklistKey = (jti: string) => `auth:blacklist:${jti}`;

// In-memory fallback storage for sessions
const sessionStore = new Map<string, { data: any; expiresAt: number }>();
const blacklistStore = new Map<string, number>();

export const setSession = async (jti: string, data: Record<string, unknown>, ttlSec: number): Promise<void> => {
  const ttl = Math.max(ttlSec - 30, 1);

  try {
    if (isRedisAvailable) {
      await connectRedis();
      await redis.set(sessionKey(jti), JSON.stringify(data), { EX: ttl });
    }
  } catch (error) {
    console.warn('⚠️ Session set failed, using memory store');
  }

  sessionStore.set(jti, {
    data,
    expiresAt: Date.now() + ttl * 1000,
  });
};

export const getSession = async <T = any>(jti: string): Promise<T | null> => {
  try {
    if (isRedisAvailable) {
      await connectRedis();
      const raw = await redis.get(sessionKey(jti));
      if (raw) return JSON.parse(raw) as T;
    }
  } catch (error) {
    console.warn('⚠️ Session get failed, checking memory store');
  }

  const stored = sessionStore.get(jti);
  if (!stored) return null;

  if (Date.now() > stored.expiresAt) {
    sessionStore.delete(jti);
    return null;
  }

  return stored.data as T;
};

export const delSession = async (jti: string): Promise<void> => {
  try {
    if (isRedisAvailable) {
      await connectRedis();
      await redis.del(sessionKey(jti));
    }
  } catch (error) {
    console.warn('⚠️ Session delete failed');
  }

  sessionStore.delete(jti);
};

export const blacklist = async (jti: string, ttlSec: number): Promise<void> => {
  try {
    if (isRedisAvailable) {
      await connectRedis();
      await redis.set(blacklistKey(jti), '1', { EX: ttlSec });
    }
  } catch (error) {
    console.warn('⚠️ Blacklist set failed, using memory store');
  }

  blacklistStore.set(jti, Date.now() + ttlSec * 1000);
};

export const isBlacklisted = async (jti: string): Promise<boolean> => {
  try {
    if (isRedisAvailable) {
      await connectRedis();
      const exists = await redis.exists(blacklistKey(jti));
      if (exists === 1) return true;
    }
  } catch (error) {
    console.warn('⚠️ Blacklist check failed, checking memory store');
  }

  const expiresAt = blacklistStore.get(jti);
  if (!expiresAt) return false;

  if (Date.now() > expiresAt) {
    blacklistStore.delete(jti);
    return false;
  }

  return true;
};
