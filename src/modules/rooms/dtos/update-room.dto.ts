import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { RoomStatus } from 'common/enum';
import { Trim } from 'shared/decorators/customize';

export class UpdateRoomDto {
  @Trim()
  @IsOptional()
  @IsString()
  name?: string;

  @Trim()
  @IsOptional()
  @IsString()
  description?: string;

  @Trim()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledAt?: Date;

  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus;
}
