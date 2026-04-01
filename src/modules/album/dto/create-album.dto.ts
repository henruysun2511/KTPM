import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Trim } from 'shared/decorators/customize';

export class CreateAlbumDto {
  @Trim()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Trim()
  @IsNotEmpty()
  @IsString()
  img: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  release_date?: Date;
}
