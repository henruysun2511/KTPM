import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';

import { Notification } from '../schemas/notification.schema';

export class NotificationRepository {
  constructor(@InjectModel(Notification.name) private notificationRepo: Model<Notification>) {}

  //Lấy danh sách thông báo theo userId
  async findAllByUser(receiverId: string, skip: number, limit: number) {
    return await this.notificationRepo
      .find({ receiverId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
  }

  async countDocumentsByUserId(receiverId: string): Promise<number> {
    return await this.notificationRepo.countDocuments({ receiverId });
  }

  //Đã đọc chưa
  async markRead(notificationId: string): Promise<void> {
    await this.notificationRepo.updateOne({ _id: notificationId }, { isRead: true });
  }

  //Thêm một thông báo
  async create(notificationData: Partial<Notification>): Promise<Notification> {
    return await this.notificationRepo.create(notificationData);
  }

  async createMany(payloads: Partial<Notification[]>, session?: ClientSession): Promise<Notification[]> {
    if (!payloads || payloads.length === 0) return [];
    // chuẩn hoá document trước khi insert
    const docs = payloads.map((p) => ({ ...p }));
    // insertMany nhanh hơn nhiều lần create()
    return this.notificationRepo.insertMany(docs, { session });
  }
}
