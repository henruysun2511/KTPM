import { IsEnum } from 'class-validator';
import { ReportStatus } from 'common/enum';

export class UpdateReportStatusDto {
  @IsEnum(ReportStatus)
  status: ReportStatus;
}
