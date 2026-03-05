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

export const redis = createClient(redisConfig);

redis.on('error', (err) => console.error('❌ Redis Client Error:', err));
redis.on('connect', () => console.log('🔄 Redis connecting...'));
redis.on('ready', () => console.log('✅ Redis ready'));

let initialized = false;

export const connectRedis = async (): Promise<void> => {
  if (!initialized) {
    await redis.connect();
    initialized = true;
    console.log('✅ Redis connected successfully');
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
// Session helpers (keyed by JWT jti)
// ========================================
const sessionKey = (jti: string) => `auth:session:${jti}`;
const blacklistKey = (jti: string) => `auth:blacklist:${jti}`;

export const setSession = async (jti: string, data: Record<string, unknown>, ttlSec: number): Promise<void> => {
  await connectRedis();
  await redis.set(sessionKey(jti), JSON.stringify(data), { EX: Math.max(ttlSec - 30, 1) }); // skew-safe
};

export const getSession = async <T = any>(jti: string): Promise<T | null> => {
  await connectRedis();
  const raw = await redis.get(sessionKey(jti));
  return raw ? JSON.parse(raw) as T : null;
};

export const delSession = async (jti: string): Promise<void> => {
  await connectRedis();
  await redis.del(sessionKey(jti));
};

export const blacklist = async (jti: string, ttlSec: number): Promise<void> => {
  await connectRedis();
  await redis.set(blacklistKey(jti), '1', { EX: ttlSec });
};

export const isBlacklisted = async (jti: string): Promise<boolean> => {
  await connectRedis();
  const exists = await redis.exists(blacklistKey(jti));
  return exists === 1;
};
