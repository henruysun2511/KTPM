import { Type } from 'class-transformer';
import { IsMongoId, IsArray, ValidateNested, IsInt, Min, IsOptional } from 'class-validator';
import { PaymentStatus, PaymentType } from 'common/enum';
import { CreateAddressDto } from 'modules/purchase-history/dtos';

export class CreatePaymentPlanDto {
  @IsMongoId()
  planId: string;
}

export class ProductOrderDto {
  @IsMongoId({ message: 'productId không hợp lệ' })
  productId: string;

  @IsInt({ message: 'quantity phải là số nguyên' })
  @Min(1, { message: 'quantity phải >= 1' })
  quantity: number;
}

export class CreatePaymentProductDto extends CreateAddressDto {
  @IsArray({ message: 'Danh sách sản phẩm phải là mảng' })
  @ValidateNested({ each: true })
  @Type(() => ProductOrderDto)
  products: ProductOrderDto[];

  @IsOptional()
  @IsMongoId()
  cartId?: string;
}

export interface IPayment {
  transactionId: number;
  userId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  paymentMethod?: string;
  status: PaymentStatus;
  paymentUrl: string | null;
  referenceIds: string[];
  flow: PaymentType;
}
