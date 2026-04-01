import { Controller, Get } from '@nestjs/common';
import { ResponseMessage } from 'shared/decorators/customize';

import { PlaylistService } from '../services/playlist.service';

@Controller('admin/playlists')
export class PlaylistAdminController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Get('')
  @ResponseMessage('Lấy ra danh sách playlist thành công')
  async getAllPlaylist() {
    return await this.playlistService.getAllPlaylist();
  }
}
