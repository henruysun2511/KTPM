import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PermissionGuard } from 'modules/auth/guards/permission.guard';
import { Public, ResponseMessage, User } from 'shared/decorators/customize';
import { IUserRequest } from 'shared/interfaces';

import { UserService } from '../services/user.service';
import { CreateUserLocalDto, QueryUserDto } from '../dtos';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ResponseMessage('Thêm user thành công')
  // @UseGuards(PermissionGuard)
  @Post('')
  async create(@Body() userDto: CreateUserLocalDto) {
    return await this.userService.createUserLocal(userDto);
  }

  @Patch('status/:id')
  @ResponseMessage('Thay đổi trạng thái thành công')
  async changeStatus(@Param('id') id: string) {
    return await this.userService.changeStatus(id);
  }

  @Public()
  @ResponseMessage('Lấy ra danh sách user thành công')
  @Get('')
  async findAllUser(@Query() query: QueryUserDto) {
    return await this.userService.findAllUser(query);
  }

  @ResponseMessage('Lấy ra thông tin user thành công')
  @Get('detail')
  async findUserDetail(@Body('userId') userId: string) {
    return await this.userService.findById(userId);
  }

  @Delete(':id')
  @ResponseMessage('Xóa user thành công')
  async remove(@Param('id') id: string, @User() user: IUserRequest) {
    return await this.userService.remove(id, user.userId);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật quyền thành công')
  async updateSystemRole(@Param('id') id: string, @Body('roleId') roleId: string, @User() user: IUserRequest) {
    return await this.userService.updateSystemRole(id, roleId, { userId: user.userId });
  }
}
