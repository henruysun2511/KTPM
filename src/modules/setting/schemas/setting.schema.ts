import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BaseSchema } from 'shared/base';
import { WithTimestamps } from 'shared/decorators/customize';

export type SettingDocument = HydratedDocument<Setting>;

// 1. Cập nhật BannerItem để có thêm title và description
class BannerItem {
  @Prop({ type: String, required: true })
  imageUrl: string;

  @Prop({ type: String, default: '' })
  title: string; // Thêm tiêu đề cho banner

  @Prop({ type: String, default: '' })
  description: string; // Thêm mô tả ngắn cho banner

  @Prop({ type: String, default: '' })
  redirectLink: string;
}

// 2. Cập nhật ChildrenBanner (Đảm bảo đầy đủ các trang danh mục)
class ChildrenBanner {
  @Prop({ type: String, default: '' })
  artistPage: string;

  @Prop({ type: String, default: '' })
  playlistPage: string;

  @Prop({ type: String, default: '' })
  albumPage: string;

  @Prop({ type: String, default: '' })
  genrePage: string;

  @Prop({ type: String, default: '' })
  newsPage: string;

  @Prop({ type: String, default: '' })
  roomPage: string;

  @Prop({ type: String, default: '' })
  planPage: string;

  @Prop({ type: String, default: '' })
  productPage: string;
}

@Schema()
@WithTimestamps()
export class Setting extends BaseSchema {
  _id!: Types.ObjectId;

  @Prop({ type: String, default: '' })
  logo: string;

  @Prop({ type: String, default: '' })
  authBanner: string;

  // Sử dụng cấu trúc BannerItem mới cho cả Main và Mini
  @Prop({ type: [BannerItem], default: [] })
  mainBanner: BannerItem[];

  @Prop({ type: [BannerItem], default: [] })
  miniBanner: BannerItem[];

  @Prop({ type: ChildrenBanner, default: () => ({}) })
  childrenBanner: ChildrenBanner;

  @Prop({ type: String, default: 'NovaWave Music' })
  siteName: string;

  @Prop({ type: String, default: '' })
  contactEmail: string;

  @Prop({ type: String, default: '' })
  contactPhone: string;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
