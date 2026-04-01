import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

@Schema({ timestamps: true }) // Tự động tạo createdAt là lúc khách nghe nhạc
export class SongListen extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Song', required: true })
  songId: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId; // Optional: Để biết ai nghe, hoặc để null nếu là khách
}

export const SongListenSchema = SchemaFactory.createForClass(SongListen);
// Quan trọng: Đánh index để truy vấn theo thời gian cực nhanh
SongListenSchema.index({ createdAt: -1 });
SongListenSchema.index({ songId: 1, createdAt: -1 });
