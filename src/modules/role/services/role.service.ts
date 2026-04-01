import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { checkMongoId } from 'shared/utils/validateMongoId.util';
import { PermissionService } from 'modules/permission/services/permission.service';

import { RoleRepository } from '../repositories/role.repository';
import { AddPermissionDto, CreateRoleDto, UpdateRoleDto } from '../dtos';

@Injectable()
export class RoleService {
  constructor(
    private readonly permissionService: PermissionService,
    private readonly roleRepo: RoleRepository
  ) {}

  async create(roleDto: CreateRoleDto) {
    try {
      return await this.roleRepo.create(roleDto);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new ConflictException('Role already exists');
      }
      throw error;
    }
  }

  async getPermissions(id: string) {
    return await this.roleRepo.getPermissions(id);
  }

  async checkExist(id: string) {
    checkMongoId(id);
    return await this.roleRepo.checkExist(id);
  }

  async addPermission(id: string, permissionDto: AddPermissionDto, userId: string) {
    checkMongoId(id);
    const permissions = permissionDto.permissions;
    const countPermissions = await this.permissionService.getCountPermissionsByIds(permissionDto.permissions);
    if (countPermissions !== permissions.length) throw new NotFoundException('Có permission không tồn tại');
    const roleUpdated = await this.roleRepo.addPermission(id, permissions, userId);
    if (!roleUpdated) throw new NotFoundException('Role không tồn tại');
    return roleUpdated;
  }

  async ensureNotExist(id: string) {
    if (await this.checkExist(id)) {
      throw new NotFoundException('Role đã tồn tại rồi');
    }
  }

  async ensureExist(id: string) {
    if (!(await this.checkExist(id))) {
      throw new NotFoundException('Role không tồn tại');
    }
  }

  async findIdByName(name: string) {
    return await this.roleRepo.findIdByName(name);
  }
  async findNameById(id: string) {
    return await this.roleRepo.findNameById(id);
  }

  async getAllRole() {
    return await this.roleRepo.getAllRole();
  }

  async update(id: string, roleDto: UpdateRoleDto, userId: string) {
    checkMongoId(id);
    const roleUpdated = await this.roleRepo.update(id, roleDto, userId);
    if (!roleUpdated) throw new NotFoundException('Role không tồn tại');
  }
}
