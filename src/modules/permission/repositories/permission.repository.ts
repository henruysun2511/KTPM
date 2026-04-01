/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Permission } from '../schemas/permission.schema';

@Injectable()
export class PermissionRepository {
  constructor(@InjectModel(Permission.name) private readonly permissionRepo: Model<Permission>) {}

  async create(permissionData: Partial<Permission>) {
    return await this.permissionRepo.create(permissionData);
  }

  async countDocuments(filter: Record<string, any>): Promise<number> {
    return await this.permissionRepo.countDocuments(filter);
  }

  async findAll(
    filter: Record<string, any>,
    skip: number,
    limit: number,
    sort: Record<string, 1 | -1>
  ): Promise<Permission[] | []> {
    return await this.permissionRepo
      .find({ deleted: false, ...filter })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
  }

  async getPermissionsByIds(_ids: string[]) {
    return await this.permissionRepo
      .find({ _id: { $in: _ids } })
      .select('path method')
      .lean()
      .exec();
  }

  async getCountPermissionsByIds(ids: string[]): Promise<number> {
    if (!ids?.length) return 0;

    const objectIds = ids.map((id) => new Types.ObjectId(id));

    return this.permissionRepo.countDocuments({
      _id: { $in: objectIds },
      deleted: false
    });
  }
}
