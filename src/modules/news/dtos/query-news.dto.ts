import { IsEnum, IsOptional, IsString } from 'class-validator';
import { NewsStatus } from 'common/enum';
import { BaseQuery } from 'shared/base';

import { NewsSortField } from '../enums/news-sort.enum';

export class QueryNewsDto extends BaseQuery {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(NewsStatus)
  status?: string;

  @IsOptional()
  @IsEnum(NewsSortField)
  declare sort?: NewsSortField;
}
