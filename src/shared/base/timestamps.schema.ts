import { Prop, Schema } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema()
export class TimestampSchema {
  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;

  @Prop({ type: Date, required: false })
  deletedAt?: Date;

  @Prop({ type: Boolean, default: false })
  deleted?: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false })
  deletedBy?: string | Types.ObjectId;
}
