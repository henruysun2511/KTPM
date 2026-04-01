import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';

import { Role } from '../schemas/role.schema';
@Injectable()
export class RoleRepository {
  constructor(@InjectModel(Role.name) private readonly roleRepo: Model<Role>) {}

  async create(roleData: Partial<Role>): Promise<Role> {
    return await this.roleRepo.create(roleData);
  }

  async update(_id: string, roleData: Partial<Role>, updatedBy: string): Promise<Partial<Role> | null> {
    return await this.roleRepo
      .findOneAndUpdate({ _id, deleted: false }, { $set: roleData, updatedBy })
      .select('_id name description ')
      .exec();
  }

  async getPermissions(_id: string | Types.ObjectId): Promise<string[]> {
    const role = await this.roleRepo
      .findOne({ _id, deleted: false })
      .select('permissions')
      .lean<{ permissions?: Types.ObjectId[] }>()
      .exec();

    const perms = role?.permissions ?? [];
    return perms.map((p) => p?.toString?.() ?? String(p));
  }

  async checkExist(_id: string): Promise<boolean> {
    if (!_id) return false;

    // nếu là ObjectId hợp lệ -> tìm theo _id
    if (mongoose.isValidObjectId(_id)) {
      const exists = await this.roleRepo.exists({ _id: new Types.ObjectId(_id), deleted: false });
      return !!exists;
    }
  }

  async getAllRole(): Promise<Role[] | []> {
    return await this.roleRepo.find({ deleted: false });
  }

  async findIdByName(name: string): Promise<string | null> {
    const role = await this.roleRepo.findOne({ name, deleted: false }).select('_id').lean().exec();
    return role?._id.toString();
  }

  async findNameById(_id: string): Promise<string | null> {
    const role = await this.roleRepo.findOne({ _id, deleted: false }).select('name').lean<{ name: string }>().exec();
    return role.name;
  }

  async addPermission(_id: string, permissions: string[], updatedBy: string): Promise<Role | null> {
    return await this.roleRepo.findOneAndUpdate({ _id, deleted: false }, { permissions, updatedBy });
  }
}
