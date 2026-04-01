import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Token {
  @Prop()
  userId: string;

  @Prop()
  token: string;

  @Prop()
  jti: string;
}
export const TokenSchema = SchemaFactory.createForClass(Token);

// Thêm TTL index: tự động xóa document sau 1 giờ (604800 giây === 7d) kể từ createdAt
TokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });
