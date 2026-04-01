import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from 'shared/decorators/customize';

export class CreateReplyCommentDto {
  @Trim()
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsMongoId()
  commentId: string;
}
