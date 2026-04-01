import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ResponseMessage, User } from 'shared/decorators/customize';
import { IUserRequest } from 'shared/interfaces';

import { FollowService } from '../services/follow.service';
import { CreateFollowDto, QueryFollowDto } from '../dtos';

@Controller('follows')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post('follow')
  @ResponseMessage('Follow nghệ sĩ thành công')
  followArtist(@Body() followDto: CreateFollowDto, @User() user: IUserRequest) {
    return this.followService.follow(followDto, user);
  }

  @Post('unfollow')
  @ResponseMessage('Unfollow nghệ sĩ thành công')
  unfollowArtist(@Body() followDto: CreateFollowDto, @User() user: IUserRequest) {
    return this.followService.unfollow(followDto, user.userId);
  }

  @Get('')
  getFollowedArtists(@User() user: IUserRequest, @Query() query: QueryFollowDto) {
    return this.followService.getFollowedArtists(user.userId, query);
  }

  // @Get('count/:artistId')
  // @ResponseMessage('Lấy số lượng follower thành công')
  // getFollowerCount(@Param('artistId') artistId: string) {
  //   return this.followService.getFollowerCount(artistId);
  // }
}
