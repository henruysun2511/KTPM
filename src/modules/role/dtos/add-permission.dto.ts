import { ArrayUnique, IsArray, IsMongoId, IsOptional } from 'class-validator';

export class AddPermissionDto {
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayUnique()
  permissions?: string[];
}
