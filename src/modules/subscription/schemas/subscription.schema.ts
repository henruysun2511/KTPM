import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { SubscriptionStatus } from 'common/enum';
import mongoose, { Types } from 'mongoose';
import { BaseSchema } from 'shared/base';
import { WithTimestamps } from 'shared/decorators/customize';

@WithTimestamps()
export class SubscriptionPlan extends BaseSchema {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: string | Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true })
  planId: string | Types.ObjectId;

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;

  @Prop({ enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE })
  status?: string;

  @Prop({ default: 0 })
  totalPaid: number; // Tổng số tiền user đã chi cho gói này
}
export const SubscriptionPlanSchema = SchemaFactory.createForClass(SubscriptionPlan);
