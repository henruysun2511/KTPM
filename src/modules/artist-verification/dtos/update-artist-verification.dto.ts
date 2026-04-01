import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ArtistVerificationStatus } from 'common/enum/artist-verification.enum';

export class UpdateArtistVerificationDto {
  @IsEnum(ArtistVerificationStatus)
  status: ArtistVerificationStatus;

  @IsOptional()
  @IsString()
  rejectReason?: string;
}
