import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { AppConfig } from 'common/constants';
import { Gender } from 'common/enum';

export class RegisterUserDto {
  @IsString()
  @Length(AppConfig.VALIDATION.USERNAME_MIN_LENGTH, AppConfig.VALIDATION.USERNAME_MAX_LENGTH, {
    message: 'Username phải có độ dài từ 6 đến 20 ký tự'
  })
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(AppConfig.VALIDATION.PASSWORD_MIN_LENGTH, AppConfig.VALIDATION.PASSWORD_MAX_LENGTH)
  password: string;

  @Type(() => Date)
  @IsDate({ message: 'Ngày sinh phải là ngày hợp lệ' })
  @IsOptional()
  birthday?: Date;

  @IsEnum(Gender, { message: 'Giới tính không hợp lệ' })
  gender: Gender;

  @IsOptional()
  @IsString()
  avatar?: string;
}
