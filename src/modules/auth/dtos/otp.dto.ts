import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { Trim } from 'shared/decorators/customize';

export class OtpDto {
  @Trim()
  @IsNotEmpty()
  @IsString()
  otp: string;

  @IsEmail()
  email: string;
}
