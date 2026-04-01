import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { IUserRequest } from 'shared/interfaces';
import { ResponseMessage, User } from 'shared/decorators/customize';

import { NotificationService } from '../services/notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('')
  @ResponseMessage('Lấy danh sách thông báo thành công')
  getAllByUser(@User() user: IUserRequest, @Query('page') page: number) {
    return this.notificationService.findAllNotificationsByUserId(user.userId, page);
  }

  @Post('mark-read/:id')
  @ResponseMessage('Đánh dấu thông báo đã đọc thành công')
  markRead(@Param('id') notificationId: string) {
    return this.notificationService.markRead(notificationId);
  }
}
