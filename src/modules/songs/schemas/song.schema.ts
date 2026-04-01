import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { SongReleseStatus, SongStatus } from 'common/enum/song-status.enum';
import mongoose, { Types } from 'mongoose';
import { BaseSchema } from 'shared/base';
import { WithTimestamps } from 'shared/decorators/customize';

@WithTimestamps()
export class Song extends BaseSchema {
  _id!: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Boolean, required: true })
  explicit: boolean;

  @Prop({ type: Number })
  duration?: number;

  @Prop({ type: String, required: true })
  mp3Link: string;

  @Prop({ type: String, required: true })
  imageUrl: string;

  // lyrics nên để optional hoặc tách collection nếu lớn
  @Prop({
    type: String,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    required: function (this: any) {
      return !!this.explicit; // bắt buộc khi explicit === true (áp dụng cho create/save)
    },
    validate: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validator: function (this: any, v: string) {
        if (this.explicit && (!v || v.trim().length === 0)) return false;
        return true;
      },
      message: 'Lyrics are required when explicit is true'
    }
  })
  lyrics?: string;

  @Prop({ type: String, enum: SongStatus, default: SongStatus.ACTIVED })
  status?: string;

  @Prop({ type: Number, default: 0 })
  popularity?: number;

  @Prop({ type: [String], default: [] })
  genreNames: string[];

  // Một bài hát nằm trong 1 album (single ObjectId)
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Album' })
  albumId?: string | Types.ObjectId;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artist', default: [] }] })
  featArtistIds: string[] | Types.ObjectId[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true })
  artistId: string | Types.ObjectId;

  @Prop({ type: Date })
  releaseAt?: Date;

  @Prop({
    type: String,
    enum: SongReleseStatus,
    default: SongReleseStatus.DRAFT
  })
  releseStatus: string;

  @Prop({ type: Number, default: 0 })
  likes?: number;

  @Prop({ type: Number, default: 0 })
  views: number;
}

export const SongSchema = SchemaFactory.createForClass(Song);
SongSchema.index({ name: 'text' });
