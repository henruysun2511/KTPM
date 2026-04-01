import { WorkerOptions } from 'bullmq';

import redisClient from './redis.config';
import { env } from './env.config';

/**
 * ================================
 * QUEUE REGISTER OPTIONS (Producer)
 * ================================
 * Áp dụng khi tạo Queue / QueueScheduler
 * - Dùng chung Redis connection
 * - Định nghĩa defaultJobOptions cho mọi job
 */
export const defaultQueueRegisterOptions = {
  /**
   * Redis connection instance
   * - Dùng chung cho tất cả queue
   * - Tránh tạo nhiều connection gây tốn tài nguyên
   */
  connection: redisClient,

  /**
   * Prefix giúp phân biệt:
   * - môi trường (dev / staging / prod)
   * - project dùng chung Redis
   *
   * Ví dụ key trong Redis:
   * bull:my-app:production:queueName
   */
  prefix: `bull:${env.APP_NAME}:${env.NODE_ENV}`,

  /**
   * Default options cho mọi job
   * (có thể override khi add job)
   */
  defaultJobOptions: {
    /**
     * Số lần retry khi job thất bại
     * - Nên dùng cho lỗi tạm thời (network, timeout, external API)
     */
    attempts: parseInt(env.QUEUE_DEFAULT_ATTEMPTS, 10),

    /**
     * Chiến lược backoff khi retry
     * exponential giúp tránh retry dồn dập
     *
     * delay: thời gian chờ ban đầu (ms)
     * Các lần sau sẽ tăng dần
     */
    backoff: {
      type: 'exponential' as const,
      delay: parseInt(env.QUEUE_BACKOFF_MS, 10)
    },

    /**
     * Timeout cho job
     * Nếu quá thời gian này mà job chưa resolve
     * → job bị fail → retry (nếu còn attempts)
     *
     * Rất quan trọng để tránh job bị treo vĩnh viễn
     */
    timeout: 5 * 60 * 1000, // 5 phút

    /**
     * Xóa job khi hoàn thành
     * - Giảm dung lượng Redis
     * - Không cần giữ job success trong đa số trường hợp
     */
    removeOnComplete: {
      count: 100 // Chỉ giữ lại 100 job thành công gần nhất để xem log nếu cần,
    },

    /**
     * Xử lý job fail
     * - Không nên xóa ngay trong production
     * - Giữ lại để debug / audit
     */
    removeOnFail: {
      age: 7 * 24 * 3600, // giữ job fail tối đa 7 ngày
      count: 1000 // hoặc tối đa 1000 job
    }
  }
};

/**
 * ================================
 * WORKER OPTIONS (Consumer)
 * ================================
 * Áp dụng cho tất cả Worker (consumer)
 * - Điều khiển concurrency
 * - Lock job
 * - Renew lock
 */
export function getGlobalWorkerOptions(): WorkerOptions {
  return {
    /**
     * Số job xử lý song song trên 1 worker
     * - CPU-bound: nên để thấp
     * - IO-bound: có thể để cao hơn
     */
    concurrency: parseInt(env.QUEUE_CONCURRENCY || '50', 10),

    /**
     * Thời gian lock job (ms)
     * - Trong thời gian này job không bị worker khác lấy lại
     * - Nên gấp 2–5 lần thời gian xử lý trung bình
     */
    lockDuration: parseInt(env.QUEUE_LOCK_DURATION_MS, 10),

    /**
     * Số job tối đa ử lý trong 60s
     */
    limiter: {
      max: parseInt(env.QUEUE_LIMITER_MAX, 10),
      duration: 60000
    },

    /**
     * Tự động gia hạn lock
     * - Tránh job bị re-process khi xử lý lâu
     * - Worker sẽ renew lock trước khi hết hạn
     */
    lockRenewTime: parseInt(env.LOCKRENEWTIME, 10), // renew mỗi 30s

    /**
     * Thời gian kiểm tra job bị stalled
     * - Job bị crash, worker chết giữa chừng
     * - BullMQ sẽ retry job đó
     */
    stalledInterval: 60 * 1000, // 60s

    /**
     * Worker tự động start khi khởi tạo
     */
    autorun: true,

    /**
     * Dùng chung Redis connection với Queue
     */
    connection: redisClient
  };
}
