import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsOptional, IsString, ValidateNested } from 'class-validator';

// 1. DTO cho từng item trong Slide lớn hoặc Mini Banner
class BannerItemDto {
  @IsString()
  imageUrl: string;

  @IsString()
  @IsOptional()
  title?: string; // Thêm tiêu đề cho slide

  @IsString()
  @IsOptional()
  description?: string; // Thêm mô tả cho slide

  @IsString()
  @IsOptional()
  redirectLink?: string;
}

// 2. DTO cho Banner các trang con (Dạng object phẳng)
class ChildrenBannerDto {
  @IsString() @IsOptional() artistPage?: string;
  @IsString() @IsOptional() playlistPage?: string;
  @IsString() @IsOptional() albumPage?: string;
  @IsString() @IsOptional() genrePage?: string;
  @IsString() @IsOptional() newsPage?: string;
  @IsString() @IsOptional() roomPage?: string;
  @IsString() @IsOptional() planPage?: string;
  @IsString() @IsOptional() productPage?: string;
}

export class UpdateSettingDto {
  @IsString() @IsOptional() logo?: string;

  @IsString() @IsOptional() authBanner?: string;

  @IsString() @IsOptional() siteName?: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsOptional()
  contactEmail?: string;

  @IsString() @IsOptional() contactPhone?: string;

  // Slide lớn trang chủ
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BannerItemDto)
  mainBanner?: BannerItemDto[];

  // Mini Banner (Khuyến mãi/Sự kiện)
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BannerItemDto)
  miniBanner?: BannerItemDto[];

  // Banner đầu trang của các danh mục
  @IsOptional()
  @ValidateNested()
  @Type(() => ChildrenBannerDto)
  childrenBanner?: ChildrenBannerDto;

  // Bạn có thể bổ sung thêm các cấu hình SEO hoặc Social nếu cần
  @IsString() @IsOptional() facebookLink?: string;
  @IsString() @IsOptional() youtubeLink?: string;
}
