import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ResponseMessage, User } from 'shared/decorators/customize';
import { IUserRequest } from 'shared/interfaces';

import { RoleService } from '../services/role.service';
import { AddPermissionDto, CreateRoleDto, UpdateRoleDto } from '../dtos';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('')
  @ResponseMessage('Thêm quyền thành công')
  async create(@Body() roleDto: CreateRoleDto) {
    return await this.roleService.create(roleDto);
  }

  @Put(':id')
  @ResponseMessage('Cập nhật thành công')
  async update(@Param('id') id: string, @Body() roleDto: UpdateRoleDto, @User() user: IUserRequest) {
    return await this.roleService.update(id, roleDto, user.userId);
  }

  @ResponseMessage('Lấy danh sách quyền thành công')
  @Get('')
  async getAllRole() {
    return await this.roleService.getAllRole();
  }

  @Patch(':id')
  @ResponseMessage('Thêm quyền hạn thành công')
  async addPermission(@Param('id') id: string, @Body() permissionDto: AddPermissionDto, @User() user: IUserRequest) {
    return await this.roleService.addPermission(id, permissionDto, user.userId);
  }
}
