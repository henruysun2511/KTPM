import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Public, ResponseMessage, User } from 'shared/decorators/customize';
import { IUserRequest } from 'shared/interfaces';

import { CreateAlbumDto, UpdateAlbumDto } from '../dto';
import { AlbumService } from '../services/album.service';

@Controller('albums')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  @Post('')
  @ResponseMessage('Tạo album thành công')
  create(@Body() albumDto: CreateAlbumDto, @User() user: IUserRequest) {
    return this.albumService.create(albumDto, user);
  }

  @Put(':id')
  @ResponseMessage('Cập nhật thành công')
  update(@Param('id') id: string, @Body() albumDto: UpdateAlbumDto, @User() user: IUserRequest) {
    return this.albumService.update(id, albumDto, { userId: user.userId });
  }

  @Public()
  @Get('')
  @ResponseMessage('Lấy danh sách album thành công')
  async getAlbumsForClient(@Query('page') page: number) {
    return await this.albumService.GetAlbumsForClient(page);
  }

  @Public()
  @Get(':artistId')
  @Public()
  @ResponseMessage('Lấy ra danh sách album của nghệ sĩ thành công')
  async findAllAlbumByArtistId(@Param('artistId') artistId: string) {
    return await this.albumService.findAllAlbumByArtistId(artistId);
  }

  @Get('detail/:id')
  @Public()
  @ResponseMessage('Lấy ra thông tin chi tiết thành công')
  async getDetail(@Param('id') id: string) {
    return await this.albumService.getDetail(id);
  }

  @Get('songs/:id')
  @Public()
  @ResponseMessage('Lấy ra danh sách bài hát của album thành công')
  async getAlbumSongs(@Param('id') id: string) {
    return await this.albumService.getAlbumSongs(id);
  }
}
