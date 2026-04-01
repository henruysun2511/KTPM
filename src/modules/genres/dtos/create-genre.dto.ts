import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from 'shared/decorators/customize';

export class CreateGenreDto {
  @Trim()
  @IsNotEmpty()
  @IsString()
  name: string;
}
