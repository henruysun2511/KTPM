import { IsEnum, IsMongoId } from 'class-validator';
import { SongStatus } from 'common/enum';

export class UpdateStatusDto {
  @IsMongoId()
  songId: string;

  @IsEnum(SongStatus)
  status: string;
}
