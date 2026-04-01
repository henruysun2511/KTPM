import { Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { WithTimestamps } from 'shared/decorators/customize';
@WithTimestamps()
export class Like {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: string | Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Song', required: true })
  songId: string | Types.ObjectId;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
