import { ConflictException, Injectable } from '@nestjs/common';

import { PermissionRepository } from '../repositories/permission.repository';
import { CreatePermissionDto, QueryPermissionDto } from '../dtos';
import { buildPermissionFilterQuery } from '../queries/permission.query';

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepo: PermissionRepository) {}

  async create(permissionDto: CreatePermissionDto) {
    try {
      permissionDto.module = permissionDto.module?.toUpperCase();
      return await this.permissionRepo.create(permissionDto);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new ConflictException(' Tên quyền hạn đã tồn tại');
      }
      throw error;
    }
  }

  async getPermissionsByIds(_ids: string[]) {
    return await this.permissionRepo.getPermissionsByIds(_ids);
  }

  async findAllPermissions(query: QueryPermissionDto) {
    const page = query.page || 1;
    const size = query.size || 10;
    const skip = (page - 1) * size;

    const { filter, sort } = buildPermissionFilterQuery(query);

    const [totalElements, data] = await Promise.all([
      this.permissionRepo.countDocuments(filter),
      this.permissionRepo.findAll(filter, skip, size, sort)
    ]);
    const totalPages = Math.ceil(totalElements / size);

    return {
      meta: {
        page,
        size,
        totalPages,
        totalElements
      },
      data
    };
  }

  async getCountPermissionsByIds(ids: string[]) {
    return await this.permissionRepo.getCountPermissionsByIds(ids);
  }
}
