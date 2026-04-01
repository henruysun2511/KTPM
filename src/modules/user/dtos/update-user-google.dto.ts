import { PartialType } from '@nestjs/mapped-types';

import { CreateUserGoogleDto } from './create-user-google';

export class UpdateUserGoogleDto extends PartialType(CreateUserGoogleDto) {}
