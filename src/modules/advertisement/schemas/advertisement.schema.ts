import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BaseSchema } from 'shared/base';
import { WithTimestamps } from 'shared/decorators/customize';

@WithTimestamps()
export class Advertisement extends BaseSchema {
  _id!: Types.ObjectId;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String, required: true })
  partner: string;

  @Prop({ type: String })
  audioUrl?: string;

  @Prop({ type: String })
  bannerUrl?: string;

  @Prop({ default: true })
  isActived?: boolean;
}

export const AdvertisementSchema = SchemaFactory.createForClass(Advertisement);
