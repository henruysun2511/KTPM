/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, UpdateWriteOpResult } from 'mongoose';
import { UserStatus } from 'common/enum';

import { User } from '../schemas/user.schema';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userRepo: Model<User>) {}

  async create(userData: Partial<User>, options?: { session?: ClientSession }): Promise<User> {
    const result = await this.userRepo.create([userData], options);
    return result[0];
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    return await this.userRepo
      .findByIdAndUpdate(id, { $set: userData }, { new: true, runValidators: true })
      .select('-password')
      .lean();
  }

  async updateIsPremium(_id: string, isPremium: boolean, session?: ClientSession): Promise<void> {
    await this.userRepo.updateOne({ _id, deleted: false }, { $set: { isPremium } }, { session });
  }

  async updateExpiredPremiumUsers(_ids: string[]): Promise<void> {
    await this.userRepo.updateMany(
      { _id: { $in: _ids }, deleted: false, status: UserStatus.ACTIVE, isPremium: true },
      { isPremium: false }
    );
  }

  async updateRole(_id: string, userData: Partial<User>, session?: ClientSession): Promise<User | null> {
    return await this.userRepo.findByIdAndUpdate({ _id, deleted: false }, { $set: userData }, { new: true, session });
  }

  async remove(_id: string, deletedBy: string): Promise<UpdateWriteOpResult> {
    return await this.userRepo.updateOne({ _id, deleted: false }, { deleted: true, deletedBy, deletedAt: new Date() });
  }

  // change status
  async changeStatus(_id: string, status: string) {
    return await this.userRepo.findByIdAndUpdate(_id, { status });
  }

  async findById(_id: string): Promise<Omit<User, 'password'> | null> {
    return await this.userRepo.findOne({ _id, deleted: false }).select('-password').lean().exec();
  }

  async findPasswordById(_id: string): Promise<string> {
    const user = await this.userRepo
      .findOne({ _id, deleted: false, status: UserStatus.ACTIVE })
      .select('password')
      .lean<{ password: string }>()
      .exec();
    return user.password;
  }

  async findUserByGoogleId(googleId: string): Promise<User | null> {
    return await this.userRepo.findOne({ googleId });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepo.findOne({ email });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepo.findOne({ username, deleted: false }).lean().exec();
  }

  async existUserByEmail(email: string): Promise<boolean> {
    const exists = await this.userRepo.exists({ email, deleted: false });
    return !!exists;
  }

  async checkExist(_id: string): Promise<boolean> {
    const exist = await this.userRepo.exists({ _id, deleted: false });
    return !!exist;
  }

  async existUserByUsername(username: string): Promise<boolean> {
    const exists = await this.userRepo.exists({ username, deleted: false });
    return !!exists;
  }

  async getUsersByYear(
    startDate: string,
    endDate: string
  ): Promise<Array<{ year: number; month: number; count: number }>> {
    return await this.userRepo
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

  async findAll(
    filter: Record<string, any>,
    skip: number,
    limit: number,
    sort: Record<string, 1 | -1>
  ): Promise<{ data: User[]; total: number }> {
    const { roleName, ...finalFilter } = filter;

    const pipeline: any[] = [
      { $match: { deleted: false, ...(finalFilter || {}) } },

      {
        $lookup: {
          from: 'roles',
          localField: 'roleId',
          foreignField: '_id',
          as: 'role'
        }
      },
      { $unwind: { path: '$role', preserveNullAndEmptyArrays: true } },

      ...(roleName ? [{ $match: { 'role.name': roleName } }] : []),

      {
        $project: {
          _id: 1,
          username: 1,
          email: 1,
          typeLogin: 1,
          status: 1,
          isPremium: 1,
          createdAt: 1,
          role: { _id: '$role._id', name: '$role.name' }
        }
      },

      {
        $facet: {
          data: [{ $sort: sort || { _id: -1 } }, { $skip: skip || 0 }, { $limit: limit || 10 }],
          total: [{ $count: 'count' }]
        }
      }
    ];

    const result = await this.userRepo.aggregate(pipeline);

    return {
      data: result[0].data,
      total: result[0].total[0]?.count || 0
    };
  }
}
