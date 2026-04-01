import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { TimestampSchema } from 'shared/base';
import { WithTimestamps } from 'shared/decorators/customize';

@WithTimestamps()
export class ReplyComment extends TimestampSchema {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Comment', required: true })
  commentId: string | Types.ObjectId;

  @Prop({ type: String, required: true })
  content: string;
}

export const ReplyCommentSchema = SchemaFactory.createForClass(ReplyComment);
