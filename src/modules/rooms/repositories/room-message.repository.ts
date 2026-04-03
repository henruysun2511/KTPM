import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';

import { RoomMessage } from '../schemas/room-message.schema';

@Injectable()
export class RoomMessageRepository {
  constructor(@InjectModel(RoomMessage.name) private readonly messageRepo: Model<RoomMessage>) {}

  async create(messageData: Partial<RoomMessage>) {
    return this.messageRepo.create(messageData);
  }

  async findByRoomId(roomId: string, skip: number, limit: number) {
    return this.messageRepo
      .find({
        roomId: new Types.ObjectId(roomId),
        deleted: false
      })
      .populate('userId', '_id username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
  }

  async countByRoomId(roomId: string) {
    return this.messageRepo.countDocuments({
      roomId: new Types.ObjectId(roomId),
      deleted: false
    });
  }
}
