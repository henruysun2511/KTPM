import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

import { CreateSongDto } from './create-song.dto';

export class UpdateSongDto extends PartialType(CreateSongDto) {
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  duration?: number;
}
