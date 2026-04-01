import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { PlaylistStatus } from 'common/enum';
import mongoose, { Types } from 'mongoose';
import { TimestampSchema } from 'shared/base/timestamps.schema';
import { WithTimestamps } from 'shared/decorators/customize';

@WithTimestamps()
export class Playlist extends TimestampSchema {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: string | Types.ObjectId;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }], default: [] })
  songIds?: string[] | Types.ObjectId[];

  @Prop({ type: String, enum: PlaylistStatus, default: PlaylistStatus.PUBLIC })
  status?: string;
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);
PlaylistSchema.index({ name: 'text' });
