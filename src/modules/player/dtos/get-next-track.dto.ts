import { IsMongoId, IsString } from 'class-validator';

export class GetNextTrackDto {
  @IsMongoId()
  currentSongId: string;
}
