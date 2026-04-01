import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
  ValidateNested,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import { Trim } from 'shared/decorators/customize';

@ValidatorConstraint({ name: 'AtLeastOneSocial', async: false })
class AtLeastOneSocialConstraint implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate(value: any): boolean {
    if (!value || typeof value !== 'object') return false;
    return Object.values(value).some((v) => v !== undefined && v !== null && String(v).trim() !== '');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(_: ValidationArguments): string {
    return 'Yêu cầu phải cung cấp ít nhất 1 tài khoản mạng xã hội';
  }
}

export class SocialLinksDto {
  @IsOptional()
  @IsString()
  facebook?: string;

  @IsOptional()
  @IsString()
  instagram?: string;

  @IsOptional()
  @IsString()
  tiktok?: string;

  @IsOptional()
  @IsString()
  youtube?: string;
}

export class IdentityImagesDto {
  @Trim()
  @IsNotEmpty()
  @IsString()
  front: string;

  @Trim()
  @IsNotEmpty()
  @IsString()
  back?: string;
}

export class CreateArtistVerificationDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  stageName: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  rejectReason?: string;

  @ValidateNested()
  @Type(() => SocialLinksDto)
  @Validate(AtLeastOneSocialConstraint)
  socialLinks: SocialLinksDto;

  @ValidateNested()
  @Type(() => IdentityImagesDto)
  identityImages: IdentityImagesDto;
}
