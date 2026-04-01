import { IsOptional, IsString } from 'class-validator';
import { BaseQuery } from 'shared/base';

export class QueryArtistDto extends BaseQuery {
  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  name?: string;
}
