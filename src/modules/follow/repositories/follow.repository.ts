/* eslint-disable @typescript-eslint/no-explicit-any */
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';

import { Follow } from '../schemas/follow.schema';

export class FollowRepository {
  constructor(@InjectModel(Follow.name) private followRepo: Model<Follow>) {}

  async create(followData: Partial<Follow>, session?: ClientSession): Promise<Follow> {
    const payload: Partial<Follow> = {
      ...followData
    };

    const doc = new this.followRepo(payload);
    return await doc.save(session ? { session } : undefined);
  }

  // async findOne(filter: any) {
  //   return this.followModel.findOne(filter).lean();
  // }

  async unfollow(artistId: string, userId: string, session?: ClientSession): Promise<void> {
    await this.followRepo.deleteOne({ artistId, userId }).session(session);
  }

  async findFollowedArtists(userId: string, skip: number, limit: number) {
    return this.followRepo
      .find({ userId })
      .populate('artistId', '_id name avatarUrl')
      .skip(skip)
      .limit(limit)
      .select('artistId ')
      .lean()
      .exec();
  }

  async findFollowingUser(artistId: string): Promise<Follow[] | []> {
    return this.followRepo.find({ artistId }).lean();
  }
  async countDocuments(filter: Record<string, any>) {
    return this.followRepo.countDocuments(filter);
  }

  async checkFollow(artistId: string, userId: string): Promise<boolean> {
    const follow = await this.followRepo.exists({ artistId, userId });
    return !!follow;
  }
  async findFollowingUserPaged(filter: Record<string, any>, limit: number): Promise<{ userId: string; _id: string }[]> {
    const followers = await this.followRepo.find(filter).sort({ _id: 1 }).limit(limit).select('userId').lean();
    return followers.map((f) => ({
      userId: f.userId.toString(),
      _id: f._id.toString()
    }));
  }
}
