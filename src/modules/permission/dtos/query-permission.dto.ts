import { IsOptional, IsString } from 'class-validator';
import { BaseQuery } from 'shared/base';

export class QueryPermissionDto extends BaseQuery {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  @IsString()
  module?: string;
}
