import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from 'shared/decorators/customize';

export class CreateUserGoogleDto {
  @Trim()
  @IsNotEmpty()
  @IsString()
  googleId: string;

  @IsEmail()
  email: string;

  @Trim()
  @IsNotEmpty()
  @IsString()
  username: string;
}
