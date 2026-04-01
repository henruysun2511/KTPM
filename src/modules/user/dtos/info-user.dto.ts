import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { Gender } from 'common/enum';

export class InfoUserDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  birthday?: Date;

  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @IsString()
  avatar?: string;
}
