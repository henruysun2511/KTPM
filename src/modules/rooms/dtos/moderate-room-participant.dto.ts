import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RoomModerationAction } from 'common/enum';
import { Trim } from 'shared/decorators/customize';

export class ModerateRoomParticipantDto {
  @IsEnum(RoomModerationAction)
  action: RoomModerationAction;

  @Trim()
  @IsOptional()
  @IsString()
  reason?: string;
}
