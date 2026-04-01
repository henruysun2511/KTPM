import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types, UpdateWriteOpResult } from 'mongoose';
import { SearchPipelineBuilder } from 'shared/utils';

import { Artist } from '../schemas/artist.schema';

@Injectable()
export class ArtistRepository {
  constructor(@InjectModel(Artist.name) private artistRepo: Model<Artist>) {}

  async create(artistData: Partial<Artist>, session?: ClientSession): Promise<Artist> {
    const artist = new this.artistRepo(artistData);
    return session ? artist.save({ session }) : artist.save();
  }

  async findAll(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filter: Record<string, any>,
    skip: number,
    size: number,
    sort: Record<string, 1 | -1>,
    select?: string | string[]
  ) {
    const artist = this.artistRepo
      .find({ deleted: false, ...filter })
      .sort(sort)
      .skip(skip)
      .limit(size)
      .lean();
    if (select) artist.select(select);
    return await artist.exec();
  }

  async getArtistsForClient(skip: number, size: number, select?: string | string[]): Promise<Artist[] | []> {
    const artist = this.artistRepo.find({ deleted: false }).skip(skip).limit(size).lean();
    if (select) artist.select(select);
    return await artist.exec();
  }

  async updateByUserId(userId: string, artistData: Partial<Artist>): Promise<Artist | null> {
    return this.artistRepo.findOneAndUpdate({ userId }, { $set: artistData }, { new: true });
  }

  async updateById(id: string, artistData: Partial<Artist>): Promise<Artist | null> {
    const set: Partial<Artist> = {};
    for (const [k, v] of Object.entries(artistData ?? {})) {
      if (v !== undefined) {
        set[k] = v;
      }
    }

    if (Object.keys(set).length === 0) {
      return this.findById(id);
    }

    return this.artistRepo
      .findOneAndUpdate({ _id: id, deleted: false }, { $set: set }, { new: true, runValidators: true })
      .exec();
  }

  async findById(_id: string): Promise<Artist | null> {
    return await this.artistRepo.findOne({ _id, deleted: false }).lean().exec();
  }

  async findByIds(_ids: string[]): Promise<Artist[] | []> {
    if (!_ids || _ids.length === 0) return [];
    return await this.artistRepo
      .find({
        _id: { $in: _ids }
      })
      .lean()
      .exec();
  }

  async getProfile(userId: string): Promise<Omit<Artist, 'userId'> | null> {
    return await this.artistRepo.findOne({ userId, deleted: false }).select(' -userId').lean().exec();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async countDocuments(filter: Record<string, any>): Promise<number> {
    return this.artistRepo.countDocuments({ ...filter, deleted: false }).exec();
  }

  async getCountArtistsByIds(artistIds: string[]): Promise<number> {
    return await this.artistRepo.countDocuments({ _id: { $in: artistIds } });
  }

  async getIdByUserId(userId: string): Promise<string | null> {
    const artist = await this.artistRepo
      .findOne({ deleted: false, userId })
      .select('_id')
      .lean<{ _id: Types.ObjectId }>()
      .exec();
    return artist?._id.toString() ?? null;
  }

  async getUserIdById(_id: string): Promise<string | null> {
    const artist = await this.artistRepo
      .findOne({ deleted: false, _id })
      .select('userId')
      .lean<{ userId: Types.ObjectId }>()
      .exec();
    return artist?.userId.toString() ?? null;
  }

  async checkExist(_id: string): Promise<boolean> {
    const exist = await this.artistRepo.exists({ _id, deleted: false });
    return !!exist;
  }

  async checkExistByUserId(userId: string, session?: ClientSession): Promise<boolean> {
    let query = this.artistRepo.exists({ userId, deleted: false });
    if (session) query = query.session(session); // bind session cho transaction
    return !!(await query);
  }

  async incrementFollower(_id: string, session?: ClientSession) {
    return this.artistRepo.updateOne({ _id }, { $inc: { followers: 1 } }, { session });
  }

  async decrementFollower(_id: string, session?: ClientSession) {
    return this.artistRepo.updateOne({ _id }, { $inc: { followers: -1 } }, { session });
  }

  async getDetail(_id: string): Promise<Partial<Artist> | null> {
    return await this.artistRepo
      .findOne({ _id, deleted: false })
      .select('name followers avatarUrl biography country bannerUrl')
      .lean()
      .exec();
  }

  async remove(userId: string, deletedBy: string): Promise<UpdateWriteOpResult> {
    return await this.artistRepo.updateOne(
      { userId, deleted: false },
      { deleted: true, deletedBy, deletedAt: new Date() }
    );
  }

  async searchByName(keyword: string, limit = 20): Promise<Artist[] | []> {
    if (!keyword?.trim()) return [];

    return this.artistRepo.aggregate(
      SearchPipelineBuilder.textSearch(keyword, {
        popularityField: 'followers',
        limit
      })
    );
  }

  async getTop10ArtistsByFollowers(): Promise<Artist[] | []> {
    return await this.artistRepo.find({ deleted: false }).sort({ followers: -1 }).limit(10);
  }

  async getArtistsByYear(
    startDate: string,
    endDate: string
  ): Promise<Array<{ year: number; month: number; count: number }>> {
    return await this.artistRepo
      .aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
            deleted: false
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            year: '$_id.year',
            month: '$_id.month',
            count: 1
          }
        },
        { $sort: { year: 1, month: 1 } }
      ])
      .exec();
  }
}
