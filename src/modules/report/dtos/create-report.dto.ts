import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ReportTargetType } from 'common/enum';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ReportTargetType)
  targetType: ReportTargetType;

  @IsMongoId()
  targetId: string;
}
