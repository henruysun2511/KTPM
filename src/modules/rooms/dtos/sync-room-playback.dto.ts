import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsMongoId, IsNumber, IsOptional, Min } from 'class-validator';

export class SyncRoomPlaybackDto {
  @IsOptional()
  @IsMongoId()
  currentSongId?: string;

  @IsOptional()
  @IsMongoId()
  currentQueueItemId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  currentTime?: number;

  @IsOptional()
  @IsBoolean()
  isPlaying?: boolean;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startedAt?: Date;
}
