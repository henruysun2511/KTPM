import { IsMongoId } from 'class-validator';

export class AddRoomQueueItemDto {
  @IsMongoId()
  songId: string;
}
