import { IsEnum, IsMongoId, IsNumber, IsOptional, Min } from 'class-validator';
import { RoomControlAction } from 'common/enum';

export class RoomControlDto {
  @IsMongoId()
  roomId: string;

  @IsEnum(RoomControlAction)
  action: RoomControlAction;

  @IsOptional()
  @IsMongoId()
  currentSongId?: string;

  @IsOptional()
  @IsMongoId()
  currentQueueItemId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentTime?: number;
}
