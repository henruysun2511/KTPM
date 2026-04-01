import { IsMongoId, IsOptional } from 'class-validator';
import { RegisterUserDto } from 'modules/auth/dtos';

export class CreateUserLocalDto extends RegisterUserDto {
  @IsOptional()
  @IsMongoId()
  roleId?: string;
}
