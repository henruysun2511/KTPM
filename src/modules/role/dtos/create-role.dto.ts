import { IsOptional, IsString, IsArray, ArrayUnique, IsMongoId, IsNotEmpty } from 'class-validator';
import { Trim } from 'shared/decorators/customize';

export class CreateRoleDto {
  @Trim()
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayUnique()
  permissions?: string[];
}
