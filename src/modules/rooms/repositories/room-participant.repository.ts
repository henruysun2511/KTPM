import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';

import { RoomParticipant } from '../schemas/room-participant.schema';

@Injectable()
export class RoomParticipantRepository {
  constructor(@InjectModel(RoomParticipant.name) private readonly participantRepo: Model<RoomParticipant>) {}

  async create(participantData: Partial<RoomParticipant>) {
    return this.participantRepo.create(participantData);
  }

  async findByRoomIdAndUserId(roomId: string, userId: string) {
    return this.participantRepo
      .findOne({
        roomId: new Types.ObjectId(roomId),
        userId: new Types.ObjectId(userId),
        deleted: false
      })
      .lean()
      .exec();
  }

  async listActiveByRoomId(roomId: string) {
    return this.participantRepo
      .find({
        roomId: new Types.ObjectId(roomId),
        deleted: false,
        status: 'ACTIVE'
      })
      .populate('userId', '_id username avatar')
      .sort({ joinedAt: 1 })
      .lean()
      .exec();
  }

  async updateByRoomIdAndUserId(roomId: string, userId: string, participantData: Partial<RoomParticipant>) {
    return this.participantRepo
      .findOneAndUpdate(
        {
          roomId: new Types.ObjectId(roomId),
          userId: new Types.ObjectId(userId),
          deleted: false
        },
        { $set: participantData },
        { new: true }
      )
      .lean()
      .exec();
  }
}
