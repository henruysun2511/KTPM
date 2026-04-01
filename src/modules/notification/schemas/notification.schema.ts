import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { NotificationType } from 'common/enum';
import mongoose, { Types } from 'mongoose';
import { WithTimestamps } from 'shared/decorators/customize';

@WithTimestamps()
export class Notification {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  receiverId: string | Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Song' })
  referenceId?: string | Types.ObjectId;

  @Prop({ type: String, enum: NotificationType, default: NotificationType.GENERAL })
  type: NotificationType;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ default: false })
  isRead?: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
