/* eslint-disable no-console */
import Redis from 'ioredis';

import { env } from './env.config';

const redisClient = new Redis({
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT || '6379', 10),
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // không giới hạn số lần retry command
  // Retry strategy khi kết nối bị mất
  retryStrategy(times) {
    // delay tăng dần, tối đa 2 giây
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError(err) {
    // tự reconnect nếu gặp ECONNRESET
    if (err.message.includes('ECONNRESET')) {
      return true;
    }
    return false;
  },
  // Giữ kết nối lâu hơn
  keepAlive: 30000 // 30 giây
  // tls: env.REDIS_TLS === 'true' ? {} : undefined
});

// Event log để debug
redisClient.on('connect', () => {
  console.log('Redis connected');
});

redisClient.on('error', (err) => {
  console.error('Redis error', err);
});

redisClient.on('close', () => {
  console.warn('Redis connection closed');
});

redisClient.on('reconnecting', (delay) => {
  console.log(`Redis reconnecting in ${delay}ms`);
});

export default redisClient;