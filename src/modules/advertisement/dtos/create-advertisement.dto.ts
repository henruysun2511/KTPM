import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Trim } from 'shared/decorators/customize';

export class CreateAdvertisementDto {
  @Trim()
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Trim()
  @IsNotEmpty()
  @IsString()
  audioUrl: string;

  @Trim()
  @IsNotEmpty()
  @IsString()
  bannerUrl: string;

  @Trim()
  @IsNotEmpty()
  @IsString()
  partner: string;
}
