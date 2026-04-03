import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RoomStatus } from 'common/enum';
import { BaseQuery } from 'shared/base';

export class QueryRoomDto extends BaseQuery {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus;
}
