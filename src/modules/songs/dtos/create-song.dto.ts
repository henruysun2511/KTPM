import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl
} from 'class-validator';
import { SongReleseStatus } from 'common/enum';
import { Trim } from 'shared/decorators/customize';

export class CreateSongDto {
  @Trim()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  explicit: boolean;

  @IsOptional()
  @Trim()
  @IsString()
  lyrics?: string;

  @Trim()
  @IsNotEmpty()
  @IsString()
  imageUrl: string;

  @Trim()
  @IsNotEmpty()
  @IsString()
  mp3Link: string;

  @IsArray({ message: 'genreIds phải là mảng' })
  @IsNotEmpty()
  genreNames: string[];

  @IsOptional()
  @IsMongoId()
  albumId?: string;

  @IsOptional()
  @IsArray({ message: 'featArtistIds phải là mảng' })
  @IsMongoId({ each: true })
  featArtistIds?: string[];

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  releaseAt?: Date;

  @IsEnum(SongReleseStatus)
  releseStatus: string;

  @IsNumber()
  duration: number;
}
