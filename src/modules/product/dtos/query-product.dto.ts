import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseQuery } from 'shared/base';

export class QueryProductDto extends BaseQuery {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  start: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  end: number;
}
