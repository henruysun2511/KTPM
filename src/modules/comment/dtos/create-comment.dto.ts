import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from 'shared/decorators/customize';

export class CreateCommentDto {
  @Trim()
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsMongoId()
  songId: string;
}
