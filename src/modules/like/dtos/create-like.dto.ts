import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateLikeDto {
  @IsMongoId()
  songId: string;
}
