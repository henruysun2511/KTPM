import { IsArray, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PlaylistStatus } from 'common/enum';
import { Trim } from 'shared/decorators/customize';

export class CreatePlaylistDto {
  @Trim()
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  songIds?: string[];

  @IsOptional()
  @IsEnum(PlaylistStatus)
  status?: string;
}
