import { IsNotEmpty, IsPhoneNumber, IsString, Matches } from 'class-validator';
import { Trim } from 'shared/decorators/customize';

export class CreateAddressDto {
  @Trim()
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @Matches(/^(0|\+84)(3|5|7|8|9)\d{8}$/)
  phone: string;

  @Trim()
  @IsNotEmpty()
  @IsString()
  address: string;
}
