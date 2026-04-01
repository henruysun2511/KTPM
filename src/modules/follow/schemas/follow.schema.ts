import { Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { WithTimestamps } from 'shared/decorators/customize';

@WithTimestamps()
export class Follow {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: string | Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true })
  artistId: string | Types.ObjectId;
}

export const FollowSchema = SchemaFactory.createForClass(Follow);
