import { IsOptional, IsString, IsArray, ArrayUnique, IsMongoId, IsNotEmpty } from 'class-validator';
import { Trim } from 'shared/decorators/customize';

export class UpdateRoleDto {
  @Trim()
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
