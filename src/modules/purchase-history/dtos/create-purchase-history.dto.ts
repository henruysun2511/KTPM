import { IsArray, IsEnum, IsMongoId, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductOrderDto } from 'modules/payments/dtos';
import { PurchaseHistoryStatus } from 'common/enum';

import { CreateAddressDto } from './create-address.dto';

export class CreatePurchaseHistoryDto extends CreateAddressDto {
  @IsMongoId()
  userId: string;

  @IsMongoId()
  paymentId: string;

  @IsArray({ message: 'Danh sách sản phẩm phải là mảng' })
  @ValidateNested({ each: true })
  @Type(() => ProductOrderDto)
  products: ProductOrderDto[];

  @IsOptional()
  @IsEnum(PurchaseHistoryStatus, { message: 'status không hợp lệ' })
  status?: PurchaseHistoryStatus;
}
