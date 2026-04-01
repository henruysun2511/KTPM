import { Controller, Get, Query } from '@nestjs/common';
import { ResponseMessage } from 'shared/decorators/customize';

import { AlbumService } from '../services/album.service';
import { QueryAlbumDto } from '../dto';

@Controller('admin/albums')
export class AlbumAdminController {
  constructor(private readonly albumService: AlbumService) {}

  @Get('')
  @ResponseMessage('Lấy danh sách album thành công')
  getAll(@Query() query: QueryAlbumDto) {
    return this.albumService.getAlbumsForAdmin(query);
  }
}
