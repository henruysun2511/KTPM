import { IsEnum, IsNotEmpty } from 'class-validator';
import { NewsStatus } from 'common/enum';

export class UpdateNewsStatusDto {
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsEnum(NewsStatus, {
    message: `Trạng thái phải là một trong các giá trị: ${Object.values(NewsStatus).join(', ')}`
  })
  status: NewsStatus;
}
