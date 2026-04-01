import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { HttpMethod } from 'common/enum';
import { Trim } from 'shared/decorators/customize';
export class CreatePermissionDto {
  @Trim()
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEnum(HttpMethod)
  method: HttpMethod;

  @Trim()
  @IsNotEmpty()
  @IsString()
  path: string;

  @Trim()
  @IsNotEmpty()
  @IsString()
  module: string;

  @IsOptional()
  @IsString()
  description?: string;
}
