import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateFollowDto {
  @IsMongoId()
  artistId: string;
}
