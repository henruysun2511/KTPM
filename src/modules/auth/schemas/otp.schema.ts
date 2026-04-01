import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'otp', timestamps: true })
export class OtpAuth {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  otp: string;

  // TTL index: document bị xóa sau 180 giây (3 phút)
  @Prop({
    type: Date,
    default: () => new Date(),
    expires: 180 // 3 phút = 180 giây
  })
  expiresAt: Date;
}

export const OtpAuthSchema = SchemaFactory.createForClass(OtpAuth);
