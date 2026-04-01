import { Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { BaseSchema } from 'shared/base';
import { WithTimestamps } from 'shared/decorators/customize';

export class ProductItem {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ type: Number, required: true, min: 1 })
  quantity: number;

  @Prop({ type: Number, required: true, min: 1 })
  price: number;
}
@WithTimestamps()
export class Cart extends BaseSchema {
  _id!: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: string | Types.ObjectId;

  @Prop({ type: [ProductItem], default: [] })
  products: ProductItem[];

  @Prop({ type: Number, default: 0 })
  totalPrice: number;
}
export const CartSchema = SchemaFactory.createForClass(Cart);
