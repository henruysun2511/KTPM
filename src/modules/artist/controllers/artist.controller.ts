import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { Public, ResponseMessage, User } from 'shared/decorators/customize';
import { IUserRequest } from 'shared/interfaces';

import { UpdateArtistDto } from '../dtos';
import { ArtistService } from '../services/artist.service';

@Controller('artists')
export class ArtistController {
  constructor(private readonly artistService: ArtistService) {}

  @ResponseMessage('Thêm tác giả thành công ')
  @Put('')
  async update(@Body() artistDto: UpdateArtistDto, @User() user: IUserRequest) {
    return await this.artistService.update(artistDto, { userId: user.userId });
  }

  @Get('profile')
  @ResponseMessage('Lấy ra thông tin thành công')
  async getProfile(@User() user: IUserRequest) {
    return await this.artistService.getProfile(user.userId);
  }

  @Get('detail/:id')
  @Public()
  @ResponseMessage('Lấy ra thông tin nghệ sĩ thành công')
  async getDetail(@Param('id') id: string) {
    return await this.artistService.getDetail(id);
  }

  @Public()
  @Get('')
  @ResponseMessage('Lấy danh sách nghệ sĩ thành công')
  async getArtistsForClient(@Query('page') page: number) {
    return this.artistService.getArtistsForClient(page);
  }

  @Get('top10')
  @ResponseMessage('Lấy ra top 10 nghệ sĩ thành công')
  async getTop10ArtistsByFollowers() {
    return await this.artistService.getTop10ArtistsByFollowers();
  }
}
