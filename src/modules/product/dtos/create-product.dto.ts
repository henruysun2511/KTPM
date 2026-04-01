import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { Trim } from 'shared/decorators/customize';

export class CreateProductDto {
  @Trim()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Tồn kho không được âm' })
  stock: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Giá không được âm' })
  price: number;

  @Trim()
  @IsNotEmpty()
  @IsString()
  img: string;
}
