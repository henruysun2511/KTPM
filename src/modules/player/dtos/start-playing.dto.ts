import { IsMongoId, IsOptional } from 'class-validator';

export class StartPlayingDto {
  @IsMongoId()
  songId: string;

  @IsOptional()
  @IsMongoId()
  playlistId?: string;

  @IsOptional()
  @IsMongoId()
  albumId?: string;
}
