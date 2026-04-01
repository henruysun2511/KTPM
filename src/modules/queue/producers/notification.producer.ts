import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { JobName, QueueName } from 'common/constants';
import { Notification } from 'modules/notification/schemas/notification.schema';

@Injectable()
export class SendNotificationProducer {
  constructor(
    @InjectQueue(QueueName.SendNotificationQueue)
    private readonly notificationQueue: Queue
  ) {}

  async sendNotification(notifications: Notification[]) {
    // Đẩy tất cả job vào BullMQ
    await this.notificationQueue.add(JobName.SendNotificationWhenNewSong, { notifications });
  }
}
