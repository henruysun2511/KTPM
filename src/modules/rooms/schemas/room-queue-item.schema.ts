import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { RoomQueueItemStatus } from 'common/enum';
import mongoose, { Types } from 'mongoose';
import { BaseSchema } from 'shared/base';
import { WithTimestamps } from 'shared/decorators/customize';

@WithTimestamps()
export class RoomQueueItem extends BaseSchema {
  _id!: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, index: true })
  roomId: string | Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Song', required: true, index: true })
  songId: string | Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  requestedBy: string | Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false })
  approvedBy?: string | Types.ObjectId;

  @Prop({ type: Number, required: false, index: true })
  order?: number;

  @Prop({ type: String, enum: RoomQueueItemStatus, default: RoomQueueItemStatus.PENDING, index: true })
  status: RoomQueueItemStatus;
}

export const RoomQueueItemSchema = SchemaFactory.createForClass(RoomQueueItem);

RoomQueueItemSchema.index({ roomId: 1, status: 1, order: 1, createdAt: 1 });
