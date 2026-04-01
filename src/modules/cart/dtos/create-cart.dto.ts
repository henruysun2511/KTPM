import { IsMongoId } from 'class-validator';

export class CreateCartDto {
  @IsMongoId()
  userId: string;
}
