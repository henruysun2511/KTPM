import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Public, ResponseMessage, User } from 'shared/decorators/customize';
import { IUserRequest } from 'shared/interfaces';

import { Throttle } from '@nestjs/throttler';
import {
  AddRoomQueueItemDto,
  CreateRoomDto,
  CreateRoomMessageDto,
  ModerateRoomParticipantDto,
  QueryRoomDto,
  SyncRoomPlaybackDto,
  UpdateRoomDto,
  UpdateRoomQueueItemDto
} from '../dtos';
import { RoomService } from '../services/room.service';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) { }

  @Public()
  @Get('')
  @ResponseMessage('Lấy danh sách phòng thành công')
  findAll(@Query() query: QueryRoomDto) {
    return this.roomService.findAll(query);
  }

  @Get('me')
  @ResponseMessage('Lấy danh sách phòng của tôi thành công')
  findMine(@User() user: IUserRequest) {
    return this.roomService.findMine(user.userId);
  }

  @Public()
  @Get(':id')
  @ResponseMessage('Lấy thông tin chi tiết phòng thành công')
  getDetail(@Param('id') id: string, @User() user?: IUserRequest) {
    return this.roomService.getDetail(id, user?.userId);
  }

  @Post('')
  @ResponseMessage('Tạo phòng thành công')
  create(@Body() dto: CreateRoomDto, @User() user: IUserRequest) {
    return this.roomService.create(dto, user);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật phòng thành công')
  update(@Param('id') id: string, @Body() dto: UpdateRoomDto, @User() user: IUserRequest) {
    return this.roomService.update(id, dto, user.userId);
  }

  @Delete(':id')
  @ResponseMessage('Kết thúc phòng thành công')
  remove(@Param('id') id: string, @User() user: IUserRequest) {
    return this.roomService.remove(id, user.userId);
  }

  @Get(':id/queue')
  @ResponseMessage('Lấy hàng đợi phòng thành công')
  getQueue(@Param('id') id: string, @User() user: IUserRequest) {
    return this.roomService.getQueue(id, user.userId);
  }

  @Post(':id/queue')
  @ResponseMessage('Thêm bài hát vào hàng đợi thành công')
  addQueueItem(@Param('id') id: string, @Body() dto: AddRoomQueueItemDto, @User() user: IUserRequest) {
    return this.roomService.addQueueItem(id, dto, user);
  }

  @Patch(':id/queue/:queueId')
  @ResponseMessage('Cập nhật yêu cầu bài hát thành công')
  updateQueueItem(
    @Param('id') id: string,
    @Param('queueId') queueId: string,
    @Body() dto: UpdateRoomQueueItemDto,
    @User() user: IUserRequest
  ) {
    return this.roomService.updateQueueItem(id, queueId, dto, user.userId);
  }

  @Delete(':id/queue/:queueId')
  @ResponseMessage('Xóa bài hát khỏi hàng đợi thành công')
  removeQueueItem(@Param('id') id: string, @Param('queueId') queueId: string, @User() user: IUserRequest) {
    return this.roomService.removeQueueItem(id, queueId, user.userId);
  }

  @Post(':id/sync')
  @ResponseMessage('Đồng bộ trạng thái phát thành công')
  syncPlayback(@Param('id') id: string, @Body() dto: SyncRoomPlaybackDto, @User() user: IUserRequest) {
    return this.roomService.syncPlayback(id, dto, user.userId);
  }

  @Get(':id/messages')
  @ResponseMessage('Lấy lịch sử bình luận thành công')
  getMessages(@Param('id') id: string, @Query('page') page?: number, @Query('size') size?: number) {
    return this.roomService.getMessages(id, page, size);
  }

  @Throttle({ default: { limit: 1, ttl: 2000 } })
  @Post(':id/messages')
  @ResponseMessage('Tao binh luan phong thanh cong')
  createMessage(@Param('id') id: string, @Body() dto: CreateRoomMessageDto, @User() user: IUserRequest) {
    return this.roomService.createMessage(id, dto, user.userId);
  }

  @Get(':id/participants')
  @ResponseMessage('Lấy danh sách người tham gia thành công')
  getParticipants(@Param('id') id: string) {
    return this.roomService.getParticipants(id);
  }

  @Post(':id/join')
  @ResponseMessage('Tham gia phòng thành công')
  join(@Param('id') id: string, @User() user: IUserRequest) {
    return this.roomService.join(id, user.userId);
  }

  @Post(':id/leave')
  @ResponseMessage('Rời phòng thành công')
  leave(@Param('id') id: string, @User() user: IUserRequest) {
    return this.roomService.leave(id, user.userId);
  }

  @Post(':id/participants/:participantUserId/moderation')
  @ResponseMessage('Cập nhật người tham gia thành công')
  moderateParticipant(
    @Param('id') id: string,
    @Param('participantUserId') participantUserId: string,
    @Body() dto: ModerateRoomParticipantDto,
    @User() user: IUserRequest
  ) {
    return this.roomService.moderateParticipant(id, participantUserId, dto, user.userId);
  }
}
