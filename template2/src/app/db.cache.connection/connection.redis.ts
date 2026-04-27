import { Redis } from 'ioredis';
import logger from '../../logger.js';
let redisClient: Redis | null = null;

export const connectToRedis = async (): Promise<Redis> => {
  if (redisClient) return redisClient;

  const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

  const client = new Redis({
    host: REDIS_HOST || '127.0.0.1',
    port: Number(REDIS_PORT) || 6379,
    ...(REDIS_PASSWORD ? { password: REDIS_PASSWORD } : {}),
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  try {
    await client.connect();
    redisClient = client; // only assign on success
    logger.info('Connected to Redis');
    return redisClient;
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    client.disconnect(); // clean up the broken instance
    throw error;
  }
};
