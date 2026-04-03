import { Type } from 'class-transformer';
import { IsDate, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Trim } from 'shared/decorators/customize';

export class CreateRoomDto {
  @Trim()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Trim()
  @IsOptional()
  @IsString()
  description?: string;

  @Trim()
  @IsNotEmpty()
  @IsString()
  imageUrl: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledAt?: Date;

  @IsOptional()
  @IsMongoId()
  initialSongId?: string;

  @IsOptional()
  @IsMongoId()
  playlistId?: string;

  @IsOptional()
  @IsMongoId()
  albumId?: string;
}
