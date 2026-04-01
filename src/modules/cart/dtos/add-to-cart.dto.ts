import { Type } from 'class-transformer';
import { IsMongoId, IsNumber } from 'class-validator';

export class AddToCartDto {
  @IsMongoId()
  productId: string;

  @Type(() => Number)
  @IsNumber()
  quantity: number;
}
