import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { NewsStatus } from 'common/enum';
import { Types } from 'mongoose';
import { BaseSchema } from 'shared/base'; // Kế thừa BaseSchema giống Artist
import { WithTimestamps } from 'shared/decorators/customize';

@WithTimestamps()
export class News extends BaseSchema {
  // Định nghĩa _id rõ ràng tương tự Artist
  _id!: Types.ObjectId;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String })
  imageUrl?: string;

  @Prop({
    type: String,
    enum: NewsStatus,
    default: NewsStatus.DRAFT
  })
  status: string;
}

export const NewsSchema = SchemaFactory.createForClass(News);

// Giữ nguyên index để hỗ trợ tìm kiếm text search nếu cần
NewsSchema.index({ title: 'text', content: 'text' });
