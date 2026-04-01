import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { PurchaseHistoryStatus } from 'common/enum';
import mongoose, { Types } from 'mongoose';
import { BaseSchema } from 'shared/base';
import { WithTimestamps } from 'shared/decorators/customize';

@WithTimestamps()
export class PurchaseHistory extends BaseSchema {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: string | Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true })
  paymentId: string | Types.ObjectId;

  @Prop({
    type: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true }
      }
    ],
    required: true
  })
  products: { productId: string | Types.ObjectId; quantity: number }[];

  @Prop({ type: Object, required: true, _id: false })
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
  };

  @Prop({ enum: PurchaseHistoryStatus, default: PurchaseHistoryStatus.PENDING }) // PENDING, CONFIRMED, CANCELLED
  status: PurchaseHistoryStatus;
}

export const PurchaseHistorySchema = SchemaFactory.createForClass(PurchaseHistory);
