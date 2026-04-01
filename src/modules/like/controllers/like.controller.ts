import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Public, ResponseMessage, User } from 'shared/decorators/customize';
import { IUserRequest } from 'shared/interfaces';

import { CreateLikeDto } from '../dtos/create-like.dto';
import { LikeService } from '../services/like.service';
import { QueryLikeDto } from '../dtos';

@Controller('likes')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post('like')
  @ResponseMessage('Đã thích bài hát')
  like(@Body() dto: CreateLikeDto, @User() user: IUserRequest) {
    return this.likeService.like(dto, { userId: user.userId });
  }

  @Post('unlike')
  @ResponseMessage('Đã bỏ thích bài hát')
  unlike(@Body() dto: CreateLikeDto, @User() user: IUserRequest) {
    return this.likeService.unlike(dto, { userId: user.userId });
  }

  // @Get('count/:songId')
  // @ResponseMessage('Lấy số lượt thích thành công')
  // count(@Param('songId') songId: string) {
  //   return this.likeService.countLikes(songId);
  // }

  @Get('')
  getUserLikedSongs(@Query() query: QueryLikeDto, @User() user: IUserRequest) {
    return this.likeService.getLikedSongs(user.userId, query);
  }
}
