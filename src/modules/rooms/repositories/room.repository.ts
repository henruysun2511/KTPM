import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { FilterQuery, Model, Types } from 'mongoose';

import { Room } from '../schemas/room.schema';

@Injectable()
export class RoomRepository {
  constructor(@InjectModel(Room.name) private readonly roomRepo: Model<Room>) {}

  async create(roomData: Partial<Room>) {
    return this.roomRepo.create(roomData);
  }

  async findById(id: string) {
    return this.roomRepo.findOne({ _id: id, deleted: false }).populate('hostId', '_id username avatar').lean().exec();
  }

  async update(id: string, roomData: Partial<Room>) {
    return this.roomRepo.findByIdAndUpdate(id, { $set: roomData }, { new: true }).lean().exec();
  }

  async softDelete(id: string, userId: string) {
    return this.roomRepo
      .findByIdAndUpdate(id, { $set: { deleted: true, deletedAt: new Date(), deletedBy: userId } }, { new: true })
      .lean()
      .exec();
  }

  async incrementParticipantCount(id: string, delta: number) {
    return this.roomRepo
      .findByIdAndUpdate(id, { $inc: { participantCount: delta } }, { new: true })
      .lean()
      .exec();
  }

  async countDocuments(filter: FilterQuery<Room>) {
    return this.roomRepo.countDocuments({ deleted: false, ...filter });
  }

  async findAll(filter: FilterQuery<Room>, skip: number, limit: number) {
    return this.roomRepo
      .find({ deleted: false, ...filter })
      .populate('hostId', '_id username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
  }

  async findOneActiveByHostId(hostId: string) {
    return this.roomRepo
      .findOne({
        hostId: new Types.ObjectId(hostId),
        deleted: false,
        status: { $in: ['WAITING', 'STREAMING', 'PAUSED'] }
      })
      .lean()
      .exec();
  }
}
