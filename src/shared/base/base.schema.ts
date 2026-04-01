import { Prop, Schema } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema()
export class BaseSchema {
  @Prop({ type: Boolean, default: false })
  deleted?: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false })
  createdBy?: string | Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false })
  updatedBy?: string | Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false })
  deletedBy?: string | Types.ObjectId;

  @Prop({ type: Date, required: false })
  deletedAt?: Date;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}
