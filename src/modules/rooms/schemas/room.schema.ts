import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { RoomSourceType, RoomStatus } from 'common/enum';
import mongoose, { Types } from 'mongoose';
import { BaseSchema } from 'shared/base';
import { WithTimestamps } from 'shared/decorators/customize';

@WithTimestamps()
export class Room extends BaseSchema {
  _id!: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, required: false, trim: true })
  description?: string;

  @Prop({ type: String, required: true })
  imageUrl: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true })
  hostId: string | Types.ObjectId;

  @Prop({ type: Date, required: false, index: true })
  scheduledAt?: Date;

  @Prop({ type: Date, required: false })
  startedAt?: Date;

  @Prop({ type: Date, required: false })
  endedAt?: Date;

  @Prop({ type: String, enum: RoomStatus, default: RoomStatus.WAITING, index: true })
  status: RoomStatus;

  @Prop({ type: String, enum: RoomSourceType, required: true })
  sourceType: RoomSourceType;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  sourceId: string | Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Song', required: false })
  currentSongId?: string | Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: false })
  currentQueueItemId?: string | Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isPlaying: boolean;

  @Prop({ type: Number, default: 0 })
  playbackPositionMs: number;

  @Prop({ type: Date, required: false })
  playbackStartedAt?: Date;

  @Prop({ type: Number, default: 0 })
  participantCount: number;
}

export const RoomSchema = SchemaFactory.createForClass(Room);

RoomSchema.index({ deleted: 1, status: 1, scheduledAt: -1, createdAt: -1 });
RoomSchema.index({ hostId: 1, deleted: 1, createdAt: -1 });
