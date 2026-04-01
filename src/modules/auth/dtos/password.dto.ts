import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from 'shared/decorators/customize';

export class PasswordDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  oldPassword: string;
}
