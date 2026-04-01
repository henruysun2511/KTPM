import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ResponseMessage } from 'shared/decorators/customize';

import { PermissionService } from '../services/permission.service';
import { CreatePermissionDto, QueryPermissionDto } from '../dtos';

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @ResponseMessage('Thêm quyền hạn thành công')
  @Post('')
  async create(@Body() permissionDto: CreatePermissionDto) {
    return await this.permissionService.create(permissionDto);
  }

  @ResponseMessage('Lấy ra danh sách quyền hạn thành công')
  @Get()
  async findAll(@Query() query: QueryPermissionDto) {
    return await this.permissionService.findAllPermissions(query);
  }
}
