import { WithTimestamps } from 'shared/decorators/customize';
import { TimestampSchema } from 'shared/base';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ReportStatus, ReportTargetType } from 'common/enum';
import mongoose, { Types } from 'mongoose';

@WithTimestamps()
export class Report extends TimestampSchema {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  reporterId: string | Types.ObjectId; // Ai gửi report

  @Prop({
    type: String,
    enum: ReportTargetType,
    required: true
  })
  targetType: ReportTargetType; // Kiểu đối tượng bị report

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true
  })
  targetId: string | Types.ObjectId; // Id của đối tượng bị report

  @Prop({ type: String, required: true })
  reason: string; // Lý do ngắn

  @Prop({ type: String })
  description?: string; // Mô tả dài

  @Prop({
    type: String,
    enum: ReportStatus,
    default: ReportStatus.PENDING
  })
  status: ReportStatus; // Trạng thái report

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  handledBy?: string | Types.ObjectId; // Admin xử lý

  @Prop({ type: Date })
  handledAt?: Date; // Thời gian xử lý
}

export const ReportSchema = SchemaFactory.createForClass(Report);
