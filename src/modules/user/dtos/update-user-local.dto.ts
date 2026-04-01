import { PartialType } from '@nestjs/mapped-types';
import { RegisterUserDto } from 'modules/auth/dtos';

export class UpdateUserLocalDto extends PartialType(RegisterUserDto) {}
