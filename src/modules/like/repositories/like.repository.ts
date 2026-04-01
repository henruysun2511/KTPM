import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';

import { Like } from '../schemas/like.schema';

@Injectable()
export class LikeRepository {
  constructor(@InjectModel(Like.name) private readonly likeRepo: Model<Like>) {}

  async create(likeData: Partial<Like>, session?: ClientSession): Promise<Like> {
    const like = new this.likeRepo(likeData);
    await like.save({ session });
    return like;
  }

  async unlike(songId: string, userId: string, session?: ClientSession): Promise<void> {
    await this.likeRepo.deleteOne({ songId, userId }, { session }).exec();
  }

  findLikedSongs(userId: string, skip: number, limit: number) {
    return this.likeRepo
      .find({ userId })
      .populate('songId', 'name artistId imagrUrl')
      .skip(skip)
      .limit(limit)
      .select('songId')
      .lean()
      .exec();
  }

  async checkLike(songId: string, userId: string): Promise<boolean> {
    const like = await this.likeRepo.exists({ songId, userId });
    return !!like;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async countDocuments(filter: Record<string, any>): Promise<number> {
    return await this.likeRepo.countDocuments(filter).exec();
  }
}
