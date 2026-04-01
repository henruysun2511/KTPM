import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, WorkerOptions } from 'bullmq';
import { JobName, QueueName } from 'common/constants';
import { NotificationType } from 'common/enum';
import { getGlobalWorkerOptions } from 'configs';
import { CustomLogger } from 'loggers/nestToWinstonLogger.service';
import { FollowService } from 'modules/follow/services/follow.service';
import { NotificationService } from 'modules/notification/services/notification.service';

@Processor(QueueName.FanoutFollowerQueue)
export class FanoutFollowerConsumer extends WorkerHost {
  constructor(
    private readonly followService: FollowService,
    private readonly notificationService: NotificationService,
    private readonly logger: CustomLogger
  ) {
    super();
  }

  getWorkerOptions(): WorkerOptions {
    return getGlobalWorkerOptions();
  }

  async process(job: Job) {
    try {
      switch (job.name) {
        case JobName.ProcessFollowerNotifications: {
          const { songId, artistId, songName } = job.data;
          const CHUNK_SIZE = 1000; // Mỗi Job con sẽ chứa 1000 users
          let lastFollowerId = null;

          while (true) {
            // 1. Lấy danh sách follower theo kiểu Keyset Pagination (rất nhanh cho DB)
            const followers = await this.followService.findFollowingUserPaged(artistId, lastFollowerId, CHUNK_SIZE);

            if (!followers || followers.length === 0) break;

            // 2. Tạo danh sách Notification object cho lô 1000 người này
            // Lưu ý: Ta gom tất cả vào 1 mảng DATA của 1 Job
            const notificationsBatch = followers.map((f) => ({
              receiverId: String(f.userId),
              title: `Nghệ sĩ bạn theo dõi vừa phát hành bài hát mới`,
              message: `Bài hát "${songName}" đã được phát hành`,
              type: NotificationType.NEW_SONG_RELEASE,
              referenId: songId
            }));

            // 3. Lưu vào DB đẩy 1 JOB duy nhất chứa 1000 notifications vào Queue gửi (Push) theo lô (Để đảm bảo tính nhất quán dữ liệu)
            await this.notificationService.createNotifications(notificationsBatch);

            // Cập nhật ID cuối để lấy batch tiếp theo
            lastFollowerId = followers[followers.length - 1]._id;
          }
          break;
        }
        default:
          this.logger.warn(`Unhandled job: ${job.name}`, FanoutFollowerConsumer.name);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      this.logger.error(
        `Job ${JobName.ProcessFollowerNotifications} có id là ${job.id} lỗi: ${error.message}`,
        error,
        FanoutFollowerConsumer.name
      );
      throw error;
    }
  }
}
