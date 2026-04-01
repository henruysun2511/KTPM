import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Trim } from 'shared/decorators/customize';

export class CreatePlanDto {
  @Trim()
  @IsNotEmpty()
  @IsString()
  planName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  durationInMonths: number;

  @Type(() => Number)
  @IsNumber()
  price: number;
}
