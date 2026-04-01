import { Injectable } from '@nestjs/common';
import { AppConfig } from 'common/constants';
import { SendNotificationProducer } from 'modules/queue/producers';

import { NotificationRepository } from '../repositories/notification.repository';
import { ICreateNotificationPayload } from '../interfaces/create-notification.interface';
import { NotificationGateway } from '../gateways/notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepo: NotificationRepository,
    private readonly notificationGateway: NotificationGateway,
    private readonly sendNotificationProducer: SendNotificationProducer
  ) {}

  async createNotification(payload: ICreateNotificationPayload) {
    const notif = await this.notificationRepo.create(payload);

    // Gửi realtime qua websocket

    this.notificationGateway.sendNotificationToUser(payload.receiverId, notif);
    return notif;
  }

  async createNotifications(payloads: ICreateNotificationPayload[]) {
    const notifications = await this.notificationRepo.createMany(payloads);

    // đẩy vào queue

    await this.sendNotificationProducer.sendNotification(notifications);
    return notifications;
  }

  async findAllNotificationsByUserId(userId: string, page: number = 1) {
    const p = page > 5 ? 5 : page;
    const size = AppConfig.PAGINATION.SIZE_NOTIFICATION;
    const skip = (p - 1) * size;

    const data = await this.notificationRepo.findAllByUser(userId, skip, size);

    return {
      meta: {
        page,
        size
      },
      data
    };
  }

  async markRead(notificationId: string) {
    return this.notificationRepo.markRead(notificationId);
  }
}
