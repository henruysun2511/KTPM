import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, WorkerOptions } from 'bullmq';
import { JobName } from 'common/constants';
import { getGlobalWorkerOptions } from 'configs';
import { CustomLogger } from 'loggers/nestToWinstonLogger.service';
import { NotificationGateway } from 'modules/notification/gateways/notification.gateway';
import { Notification } from 'modules/notification/schemas/notification.schema';
import { NotificationService } from 'modules/notification/services/notification.service';

@Processor('send-notification-queue')
export class SendNotificationConsumer extends WorkerHost {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
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
        case JobName.SendNotificationWhenNewSong: {
          const { notifications } = job.data as { notifications?: Notification[] };
          if (!Array.isArray(notifications) || notifications.length === 0) return;

          await this.notificationGateway.sendNotificationToUsers(notifications);
          break;
        }
        default:
          this.logger.warn(`Unhandled job: ${job.name}`, SendNotificationConsumer.name);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      this.logger.error(
        `Job ${JobName.SendNotificationWhenNewSong} có id là ${job.id} lỗi: ${error.message}`,
        error,
        SendNotificationConsumer.name
      );
    }
  }
}
