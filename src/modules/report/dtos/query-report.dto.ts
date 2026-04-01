import { IsEnum, IsOptional } from 'class-validator';
import { ReportTargetType } from 'common/enum';
import { BaseQuery } from 'shared/base';

export class QueryReportDto extends BaseQuery {
  @IsOptional()
  @IsEnum(ReportTargetType)
  targetType?: ReportTargetType;
}
