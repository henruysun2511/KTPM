import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { Public, ResponseMessage, User } from 'shared/decorators/customize';
import { IUserRequest } from 'shared/interfaces';

import { CreateNewsDto, QueryNewsDto, UpdateNewsDto } from '../dtos';
import { UpdateNewsStatusDto } from '../dtos/update-news-status.dto';
import { NewsService } from '../services/news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @ResponseMessage('Tạo tin tức thành công')
  async create(@Body() dto: CreateNewsDto, @User() user: IUserRequest) {
    return await this.newsService.create(dto, user);
  }

  @Put(':id')
  @ResponseMessage('Cập nhật tin tức thành công')
  async update(@Param('id') id: string, @Body() dto: UpdateNewsDto, @User() user: IUserRequest) {
    return await this.newsService.update(id, dto, user);
  }

  @Delete(':id')
  @ResponseMessage('Xóa tin tức thành công')
  async remove(@Param('id') id: string, @User() user: IUserRequest) {
    return await this.newsService.remove(id, user.userId);
  }

  @Public() // Cho phép xem công khai giống Artist
  @Get()
  @ResponseMessage('Lấy danh sách tin tức thành công')
  async getAll(@Query() query: QueryNewsDto) {
    return await this.newsService.getAll(query);
  }

  @Public()
  @Get('detail/:id')
  @ResponseMessage('Lấy chi tiết tin tức thành công')
  async getDetail(@Param('id') id: string) {
    return await this.newsService.getDetail(id);
  }

  @Patch(':id/status')
  @ResponseMessage('Cập nhật trạng thái tin tức thành công')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateNewsStatusDto, @User() user: IUserRequest) {
    return await this.newsService.updateStatus(id, dto.status, user);
  }
}
