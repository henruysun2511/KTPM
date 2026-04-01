import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { RevenueFlow } from 'common/enum';
import { TimestampSchema } from 'shared/base';
import { WithTimestamps } from 'shared/decorators/customize';

@WithTimestamps()
export class Revenue extends TimestampSchema {
  @Prop({ type: Date, required: true })
  month: Date; // Tháng, ví dụ 2025-01-01

  @Prop({ default: 0 })
  totalRevenue: number;

  @Prop({ type: Map, of: Number, default: {} })
  revenueByFlow?: Map<RevenueFlow, number>; // tổng doanh thu theo flow
}
export const RevenueSchema = SchemaFactory.createForClass(Revenue);
