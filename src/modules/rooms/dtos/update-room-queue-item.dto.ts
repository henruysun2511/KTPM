import { IsEnum } from 'class-validator';
import { RoomQueueItemStatus } from 'common/enum';

export class UpdateRoomQueueItemDto {
  @IsEnum(RoomQueueItemStatus)
  status: RoomQueueItemStatus.APPROVED | RoomQueueItemStatus.REJECTED;
}
