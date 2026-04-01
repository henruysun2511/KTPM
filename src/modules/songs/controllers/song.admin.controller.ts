import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { ResponseMessage, User } from 'shared/decorators/customize';
import { IUserRequest } from 'shared/interfaces';

import { SongService } from '../services/song.service';
import { QuerySongDto } from '../dtos';

@Controller('admin/songs')
export class SongAdminController {
  constructor(private readonly songService: SongService) {}

  @Get('')
  @ResponseMessage('Lấy danh sách bài hát cho admin thành công')
  async getAll(@Query() query: QuerySongDto) {
    return this.songService.getSongsForAdmin(query);
  }

  @Delete(':id')
  @ResponseMessage('Xóa thành công')
  async remove(@Param('id') id: string, @User() user: IUserRequest) {
    return await this.songService.removeForAdmin(id, user.userId);
  }
}
