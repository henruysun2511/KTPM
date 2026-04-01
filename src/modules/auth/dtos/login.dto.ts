import { IsString, IsNotEmpty } from 'class-validator';
import { Trim } from 'shared/decorators/customize';

export class LoginDto {
  @Trim()
  @IsNotEmpty({ message: 'Username is required' })
  @IsString()
  username: string;

  @Trim()
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  password: string;
}
