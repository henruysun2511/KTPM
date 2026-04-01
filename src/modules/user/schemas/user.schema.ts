import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { TypeLogin, UserStatus } from 'common/enum';
import mongoose, { Types } from 'mongoose';
import { BaseSchema } from 'shared/base';
import { WithTimestamps } from 'shared/decorators/customize';

@WithTimestamps()
export class User extends BaseSchema {
  _id!: Types.ObjectId;

  @Prop({ type: String, required: false })
  username: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  //password chỉ cần khi typeLogin = LOCAL
  @Prop({ type: String, required: false })
  password?: string;

  //lưu Google ID khi đăng nhập bằng Google
  @Prop({ type: String, required: false })
  googleId?: string;

  @Prop({ enum: TypeLogin, type: String, default: TypeLogin.LOCAL })
  typeLogin: TypeLogin;

  @Prop({ type: String, required: false })
  gender?: string;

  @Prop({ type: Date, required: false })
  birthday?: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true })
  roleId: Types.ObjectId | string;

  @Prop({ enum: UserStatus, type: String, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Prop({ type: String })
  avatar?: string;

  @Prop({ type: Boolean, default: false })
  isPremium?: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
