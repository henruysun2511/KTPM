import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { RoomParticipantRole, RoomParticipantStatus } from 'common/enum';
import mongoose, { Types } from 'mongoose';
import { BaseSchema } from 'shared/base';
import { WithTimestamps } from 'shared/decorators/customize';

@WithTimestamps()
export class RoomParticipant extends BaseSchema {
  _id!: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, index: true })
  roomId: string | Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: string | Types.ObjectId;

  @Prop({ type: String, enum: RoomParticipantRole, default: RoomParticipantRole.LISTENER })
  role: RoomParticipantRole;

  @Prop({ type: String, enum: RoomParticipantStatus, default: RoomParticipantStatus.ACTIVE, index: true })
  status: RoomParticipantStatus;

  @Prop({ type: Date, required: false })
  joinedAt?: Date;

  @Prop({ type: Date, required: false })
  leftAt?: Date;

  @Prop({ type: Date, required: false })
  lastSeenAt?: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false })
  moderatedBy?: string | Types.ObjectId;

  @Prop({ type: String, required: false })
  moderationReason?: string;
}

export const RoomParticipantSchema = SchemaFactory.createForClass(RoomParticipant);

RoomParticipantSchema.index({ roomId: 1, userId: 1 }, { unique: true });
RoomParticipantSchema.index({ roomId: 1, status: 1, joinedAt: -1 });
