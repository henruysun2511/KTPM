import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from 'shared/base';
import { WithTimestamps } from 'shared/decorators/customize';

@WithTimestamps()
export class Plan extends BaseSchema {
  @Prop({ required: true })
  planName: string; // ví dụ: 'Premium', 'Family', 'Student'

  @Prop({ required: true })
  price: number; // giá / tháng

  @Prop()
  durationInMonths: number;

  @Prop({ default: '' })
  description: string;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
