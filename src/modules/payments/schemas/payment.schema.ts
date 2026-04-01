import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { PaymentMethod, PaymentStatus, PaymentType } from 'common/enum';
import mongoose, { Types } from 'mongoose';
import { BaseSchema } from 'shared/base';
import { WithTimestamps } from 'shared/decorators/customize';

@WithTimestamps()
export class Payment extends BaseSchema {
  _id!: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: string | Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' })
  subscriptionId: string | Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ enum: PaymentStatus, default: PaymentStatus.PENDING })
  status?: string;

  @Prop({ enum: PaymentType, required: true })
  flow: PaymentType;

  @Prop({ type: [String], default: [] })
  referenceIds: string[];

  @Prop()
  transactionId: number; // mã giao dịch từ PayOS

  @Prop()
  paymentUrl: string;

  @Prop({ enum: PaymentMethod, default: PaymentMethod.PAYOS })
  paymentMethod?: string;

  @Prop()
  currency: string; //  "VND, USD..."
}
export const PaymentSchema = SchemaFactory.createForClass(Payment);
