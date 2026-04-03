import { Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { BaseSchema } from 'shared/base';
import { WithTimestamps } from 'shared/decorators/customize';

@WithTimestamps()
export class RoomMessage extends BaseSchema {
  _id!: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, index: true })
  roomId: string | Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: string | Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  content: string;
}

export const RoomMessageSchema = SchemaFactory.createForClass(RoomMessage);

RoomMessageSchema.index({ roomId: 1, createdAt: -1 });
