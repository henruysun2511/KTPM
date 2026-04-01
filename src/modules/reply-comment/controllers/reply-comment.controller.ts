import { Body, Controller, Delete, Get, Param, Patch, Post, Query, ValidationPipe } from '@nestjs/common';
import { ResponseMessage, User } from 'shared/decorators/customize';
import { IUserRequest } from 'shared/interfaces';

import { ReplyCommentService } from '../services/reply-comment.service';
import { CreateReplyCommentDto, UpdateReplyCommentDto } from '../dtos';

@Controller('reply-comments')
export class ReplyCommentController {
  constructor(private readonly replyCommentService: ReplyCommentService) {}

  @Post()
  @ResponseMessage('Trả lời bình luận thành công')
  create(@Body() replyCommentDto: CreateReplyCommentDto, @User() user: IUserRequest) {
    return this.replyCommentService.create(replyCommentDto, { userId: user.userId });
  }

  // @Get()
  // @ResponseMessage('Lấy danh sách trả lời bình luận thành công')
  // findAll(@Param('id') id: string, @Query(new ValidationPipe({ transform: true })) query: QueryReplyCommentDto) {
  //   return this.replyCommentService.findAllReplyCommentsByCommentId(id, query);
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.replyCommentService.findOne(+id);
  // }

  @Patch(':id')
  @ResponseMessage('Cập nhật bình luận thành công')
  update(@Param('id') id: string, @Body() replyCommentDto: UpdateReplyCommentDto, @User() user: IUserRequest) {
    return this.replyCommentService.update(id, replyCommentDto, { userId: user.userId });
  }

  @Delete(':id')
  @ResponseMessage('Xóa bình luận thành công')
  remove(@Param('id') id: string, @User() user: IUserRequest) {
    return this.replyCommentService.remove(id, { userId: user.userId });
  }
}
