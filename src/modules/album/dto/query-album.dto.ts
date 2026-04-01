import { Transform } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';
import { BaseQuery } from 'shared/base';

export class QueryAlbumDto extends BaseQuery {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  @IsDate()
  releaseDate: Date;
}
