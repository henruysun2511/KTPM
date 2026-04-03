import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from 'shared/decorators/customize';

export class CreateRoomMessageDto {
  @Trim()
  @IsNotEmpty()
  @IsString()
  content: string;
}
