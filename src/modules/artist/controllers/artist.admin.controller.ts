import { Controller, Get, Query } from '@nestjs/common';
import { ResponseMessage } from 'shared/decorators/customize';

import { QueryArtistDto } from '../dtos';
import { ArtistService } from '../services/artist.service';

@Controller('admin/artists')
export class ArtistAdminController {
  constructor(private readonly artistService: ArtistService) {}
  @Get('')
  @ResponseMessage('Lấy danh sách nghệ sĩ thành công')
  async findAll(@Query() query: QueryArtistDto) {
    return this.artistService.getArtistsForAdmin(query);
  }
}
