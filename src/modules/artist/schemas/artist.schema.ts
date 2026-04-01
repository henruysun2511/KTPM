import { Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { BaseSchema } from 'shared/base';
import { WithTimestamps } from 'shared/decorators/customize';

@WithTimestamps()
export class Artist extends BaseSchema {
  _id!: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: false })
  avatarUrl?: string;

  @Prop({ type: String })
  bannerUrl?: string;

  @Prop({
    type: Number,
    default: 0,
    min: [0, 'followers must be >= 0'],
    validate: {
      validator: Number.isInteger,
      message: 'followers must be an integer'
    }
  })
  followers?: number;

  @Prop({ type: String })
  biography?: string;

  @Prop({ type: String })
  country?: string;

  @Prop({ type: [String], default: [] })
  genreNames: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: string | Types.ObjectId;
}
export const ArtistSchema = SchemaFactory.createForClass(Artist);
ArtistSchema.index({ name: 'text' });
