/* eslint-disable no-console */
import Redis from 'ioredis';

import { env } from './env.config';

const isLocalRedisHost = ['127.0.0.1', 'localhost'].includes(env.REDIS_HOST || '');
const isDevMode = env.NODE_ENV === 'dev' || env.NODE_ENV === 'development';
const shouldReduceRedisLogNoise = isDevMode && isLocalRedisHost;

let hasLoggedRedisUnavailable = false;

const redisClient = new Redis({
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT || '6379', 10),
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  connectTimeout: 5000,
  enableOfflineQueue: true,
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
  reconnectOnError(err) {
    if (err.message.includes('ECONNRESET')) {
      return true;
    }
    return false;
  },
  keepAlive: 30000
});

redisClient.on('connect', () => {
  hasLoggedRedisUnavailable = false;
  console.log('Redis connected');
});

redisClient.on('error', (err) => {
  if (shouldReduceRedisLogNoise && err.message.includes('ECONNREFUSED')) {
    if (!hasLoggedRedisUnavailable) {
      hasLoggedRedisUnavailable = true;
      console.error('Redis error', err.message);
    }
    return;
  }

  console.error('Redis error', err);
});

redisClient.on('close', () => {
  if (shouldReduceRedisLogNoise && hasLoggedRedisUnavailable) {
    return;
  }
  console.warn('Redis connection closed');
});

redisClient.on('reconnecting', (delay) => {
  if (shouldReduceRedisLogNoise && hasLoggedRedisUnavailable) {
    return;
  }
  console.log(`Redis reconnecting in ${delay}ms`);
});

export default redisClient;
