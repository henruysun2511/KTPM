import { IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Trim } from 'shared/decorators/customize';

export class CreateArtistDto {
  @Trim()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Trim()
  @IsNotEmpty()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsArray({ message: 'genreIds phải là mảng' })
  genreNames?: string[];

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  biography?: string;

  @IsMongoId()
  userId: string;

  @Trim()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  bannerUrl?: string;
}
