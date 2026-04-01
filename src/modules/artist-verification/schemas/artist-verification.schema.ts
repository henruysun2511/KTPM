import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ArtistVerificationStatus } from 'common/enum/artist-verification.enum';
import mongoose, { Types } from 'mongoose';
import { TimestampSchema } from 'shared/base';
import { WithTimestamps } from 'shared/decorators/customize';

@WithTimestamps()
export class ArtistVerification extends TimestampSchema {
  _id!: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: string | Types.ObjectId; // Người tạo yêu cầu

  @Prop({ type: String, required: true })
  fullName: string; // Tên nghệ sĩ đăng ký

  @Prop({ type: String, required: true })
  stageName: string; // Nghệ danh mong muốn

  @Prop({ type: String })
  bio?: string; // Giới thiệu bản thân

  @Prop({
    type: {
      facebook: { type: String },
      instagram: { type: String },
      tiktok: { type: String },
      youtube: { type: String }
    },
    _id: false,
    validate: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validator: function (v: any) {
        if (!v) return false;
        // Kiểm tra có ít nhất 1 key có giá trị truthy
        return Object.values(v).some((value) => !!value);
      },
      message: 'Yêu cầu phải cung cấp ít nhất 1 tài khoản mạng xã hội'
    }
  })
  socialLinks: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };

  @Prop({
    type: {
      front: { type: String }, // ảnh mặt trước
      back: { type: String } // ảnh mặt sau
    },
    _id: false
  })
  identityImages: {
    front?: string;
    back?: string;
  };

  @Prop({ type: String, enum: ArtistVerificationStatus, default: ArtistVerificationStatus.PENDING })
  status: ArtistVerificationStatus;

  @Prop({ type: String })
  rejectReason?: string; // ghi lý do từ chối

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  approvedBy?: string | Types.ObjectId; // ai duyệt (role quản lý user/artist)
}
export const ArtistVerificationSchema = SchemaFactory.createForClass(ArtistVerification);
