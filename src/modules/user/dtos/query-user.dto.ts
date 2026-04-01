import { UserStatus } from 'common/enum';
import { IsBoolean, IsEmail, IsOptional, IsString, IsEnum } from 'class-validator';
import { BaseQuery } from 'shared/base';

export class QueryUserDto extends BaseQuery {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: string;

  @IsOptional()
  @IsString()
  roleName?: string;
}
