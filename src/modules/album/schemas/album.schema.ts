// ...existing code...
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { BaseSchema } from 'shared/base';
import { WithTimestamps } from 'shared/decorators/customize';

@WithTimestamps()
export class Album extends BaseSchema {
  _id!: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  // release date + precision (year / month / day)
  @Prop({ type: Date, default: Date.now })
  release_date?: Date;

  @Prop({ type: String, enum: ['year', 'month', 'day'], default: 'day' })
  release_date_precision?: 'year' | 'month' | 'day';

  // legacy single cover field (kept for compatibility)
  @Prop({ type: String })
  img: string;

  // total tracks (spotify uses total_tracks)
  @Prop({
    type: Number,
    default: 0,
    min: [0, 'total_songs must be >= 0'],
    validate: {
      validator: Number.isInteger,
      message: 'total_songs must be an integer'
    }
  })
  total_songs?: number;

  // artists: an album can have multiple artists
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Artist' })
  artist: Types.ObjectId | string;

  // optional: reference to track documents (or store count only)
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }], default: [] })
  songs?: Types.ObjectId[] | string[];

  @Prop({ type: String, default: '' })
  label?: string;

  @Prop({ type: String, enum: ['album', 'single', 'compilation'], default: 'album' })
  album_type?: 'album' | 'single' | 'compilation';

  @Prop({ type: [String], default: [] })
  genres?: string[];

  @Prop({ type: Number, default: 0 })
  popularity?: number;
}
export const AlbumSchema = SchemaFactory.createForClass(Album);
AlbumSchema.index({ name: 'text' });
