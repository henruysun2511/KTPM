import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Types } from 'mongoose';
import Redlock from 'redlock';

@Injectable()
export class RedisService {
  private redlock: Redlock;

  /**
   * Redis client được inject bằng token 'REDIS_CLIENT'
   * ConfigService có thể dùng nếu cần đọc cấu hình Redis trong tương lai
   */
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private readonly configService: ConfigService
  ) {
    this.redlock = new Redlock([redisClient], {
      driftFactor: 0.01,
      retryCount: 10,
      retryDelay: 200,
      retryJitter: 200
    });
  }

  /**
   * Lưu key -> value
   * @param key Redis key
   * @param value string value
   * @param exp TTL tính bằng giây (nếu có) — dùng 'EX' để set expiry
   * @returns Promise trả về result của lệnh SET
   */
  async setValue(key: string, value: string | number, exp?: number) {
    if (exp) {
      return this.redisClient.set(key, value, 'EX', exp);
    }
    return this.redisClient.set(key, value);
  }

  /**
   * Lấy value theo key
   * @param key Redis key
   * @returns Promise<string | null>
   */
  async getValue(key: string) {
    return this.redisClient.get(key);
  }

  async incr(key: string) {
    return this.redisClient.incr(key);
  }

  async expire(key: string, seconds: number) {
    return this.redisClient.expire(key, seconds);
  }

  async del(key: string) {
    return this.redisClient.del(key);
  }

  async exists(key: string) {
    return this.redisClient.exists(key);
  }

  /**
   * zadd: thêm hoặc cập nhật member trong sorted set
   * @param key sorted set key
   * @param score numeric score
   * @param member member id
   * @param options tuỳ chọn: { nx, xx, ch } tương ứng Redis flags
   * @returns Promise<number | string>
   */
  async zadd(key: string, score: number, member: string, options?: { nx?: boolean; xx?: boolean; ch?: boolean }) {
    const flags: string[] = [];
    if (options?.nx) flags.push('NX');
    if (options?.xx) flags.push('XX');
    if (options?.ch) flags.push('CH');
    // ioredis expects arguments: key, [flags...], score, member
    return this.redisClient.zadd(key, ...flags, String(score), member);
  }

  /**
   * Thêm nhiều member vào sorted set bằng pipeline (xóa trước rồi zadd)
   * @param key sorted set key
   * @param items mảng { member, score }
   */
  async zaddMany(key: string, items: { member: string; score: number }[]) {
    if (!items || items.length === 0) return;
    const pipeline = this.redisClient.multi();
    pipeline.del(key);
    for (const it of items) {
      pipeline.zadd(key, String(it.score), it.member);
    }
    await pipeline.exec();
  }

  /**
   * zincrby: tăng/giảm score của một member trong sorted set
   * Thường dùng cho leaderboard (member = songId, score = likes)
   * @param key sorted set key (ví dụ 'songs:likes')
   * @param increment số tăng (dương) hoặc giảm (âm)
   * @param member member id dưới dạng string
   * @returns Promise<string> mới score (string representation)
   */
  async zincrby(key: string, increment: number, member: string) {
    return this.redisClient.zincrby(key, increment, member);
  }

  /**
   * zrevrange: lấy range theo thứ tự giảm dần (highest score -> lowest)
   * @param key sorted set key
   * @param start index bắt đầu (0 = top)
   * @param stop index kết thúc (-1 = tới cuối)
   * @param withScores nếu true trả kèm scores ('WITHSCORES')
   * @returns Promise<string[]> hoặc Promise<string[]> với scores xen kẽ khi WITHSCORES
   */
  async zrevrange(key: string, start = 0, stop = -1, withScores = false) {
    if (withScores) return this.redisClient.zrevrange(key, start, stop, 'WITHSCORES');
    return this.redisClient.zrevrange(key, start, stop);
  }

  /**
   * xóa member khỏi sorted set
   * @param key sorted set key
   * @param member member id
   * @returns Promise<number> số phần tử bị xóa (0 hoặc 1)
   */
  async zrem(key: string, member: string) {
    return this.redisClient.zrem(key, member);
  }

  /**
   * lấy score hiện tại của member trong sorted set
   * @param key sorted set key
   * @param member member id
   * @returns Promise<string | null> score (string) hoặc null nếu không tồn tại
   */
  async zscore(key: string, member: string) {
    return this.redisClient.zscore(key, member);
  }

  // async lockProductsRedis<T>(productIds: string[], fn: () => Promise<T>): Promise<T> {
  //   const locks = [];

  //   try {
  //     // Tạo khóa Redis cho từng product
  //     for (const id of productIds) {
  //       const lock = await this.redlock.acquire([`locks:product:${id}`], 5000); // TTL 5s
  //       locks.push(lock);
  //     }

  //     return await fn();
  //   } finally {
  //     // Release tất cả lock
  //     for (const lock of locks) {
  //       try {
  //         await lock.release();
  //       } catch (e) {
  //         /* ignore */
  //       }
  //     }
  //   }
  // }

  // Reserve nhiều sản phẩm atomic
  async reserveStock(items: { productId: string; quantity: number }[], ttlMs = 15 * 60 * 1000): Promise<boolean> {
    if (!items.length) return false;

    const keys = items.map((i) => `product:${i.productId}:stock`);
    const args = items.map((i) => i.quantity);

    const lua = `
      for i = 1, #KEYS do
        local stock = tonumber(redis.call('GET', KEYS[i]) or '-1')
        if stock < tonumber(ARGV[i]) then return 0 end
      end
      for i = 1, #KEYS do
        redis.call('DECRBY', KEYS[i], ARGV[i])
        redis.call('PEXPIRE', KEYS[i], ARGV[#ARGV])
      end
      return 1
    `;

    const result = await this.redisClient.eval(lua, keys.length, ...keys, ...args, ttlMs);
    return result === 1;
  }

  // Release stock khi thanh toán fail hoặc timeout
  async releaseStock(items: { productId: string | Types.ObjectId; quantity: number }[]) {
    if (!items.length) return;
    const keys = items.map((i) => `product:${i.productId}:stock`);
    const args = items.map((i) => i.quantity);
    const lua = `
      for i = 1, #KEYS do
        redis.call('INCRBY', KEYS[i], ARGV[i])
      end
    `;
    await this.redisClient.eval(lua, keys.length, ...keys, ...args);
  }

  // Đồng bộ stock Mongo → Redis
  async syncStock(productId: string, stock: number) {
    await this.redisClient.set(`product:${productId}:stock`, stock);
  }

  async syncStocks(items: { productId: string; stock: number }[]) {
    if (!items || items.length === 0) return;
    const pipeline = this.redisClient.multi();
    for (const it of items) {
      const stockKey = `product:${it.productId}:stock`;
      pipeline.set(stockKey, String(Math.max(0, it.stock)));
    }
    await pipeline.exec();
  }
}
