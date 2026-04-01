import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { Public, ResponseMessage, User } from 'shared/decorators/customize';
import { IUserRequest } from 'shared/interfaces';

import { PlaylistService } from '../services/playlist.service';
import { CreatePlaylistDto, UpdatePlaylistDto } from '../dtos';

@Controller('playlists')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @ResponseMessage('Thêm playlist thành công')
  @Post()
  create(@Body() playlistDto: CreatePlaylistDto, @User() user) {
    return this.playlistService.createPlaylist(playlistDto, user);
  }

  @ResponseMessage('Cập nhật playlist thành công')
  @Put(':id')
  update(@Param('id') id: string, @Body() playlistDto: UpdatePlaylistDto) {
    return this.playlistService.update(id, playlistDto);
  }

  @ResponseMessage('Xóa playlist thành công')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.playlistService.remove(id);
  }

  @Patch(':playlistId/add-song')
  addSong(@Param('playlistId') playlistId: string, @Body('songId') songId: string) {
    return this.playlistService.addSongToPlaylist(playlistId, songId);
  }

  @Patch(':playlistId/remove-song')
  removeSong(@Param('playlistId') playlistId: string, @Body('songId') songId: string) {
    return this.playlistService.removeSongFromPlaylist(playlistId, songId);
  }

  @Public()
  @Get('')
  async getPlaylistsForClient(@Query('page') page: number) {
    return await this.playlistService.getPlaylistsForClient(page);
  }

  @Get('me')
  async findAllPlaylistOfUser(@User() user: IUserRequest) {
    return await this.playlistService.findAllPlaylistByUserId(user.userId);
  }

  @Get('songs/:id')
  @ResponseMessage('Lấy danh sách bài hát của playlist thành công')
  async getPlaylistSongs(@Param('id') id: string) {
    return await this.playlistService.getPlaylistSongs(id);
  }

  @Get('detail/:id')
  @ResponseMessage('Lấy ra thông tin chi tiết thành công')
  async getDetail(@Param('id') id: string) {
    return await this.playlistService.getDetail(id);
  }
}
