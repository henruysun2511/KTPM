import { Type } from 'class-transformer';
import { IsArray, IsInt, IsMongoId, IsOptional, IsString, Min } from 'class-validator';
import { BaseQuery } from 'shared/base';

export class QuerySongDto extends BaseQuery {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  genreNames?: string[];

  @IsOptional()
  @IsMongoId()
  artistId: string;
}
export class QuerySongDtoForClient {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  genreNames?: string[];
}
