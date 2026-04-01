import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRequest } from 'shared/interfaces';
import { SongService } from 'modules/songs/services/song.service';
import { checkMongoId } from 'shared/utils/validateMongoId.util';
import { AppConfig, FIELDS } from 'common/constants';

import { CreatePlaylistDto } from '../dtos/create-playlist.dto';
import { PlaylistRepository } from '../repositories/playlist.repository';
import { UpdatePlaylistDto } from '../dtos';

@Injectable()
export class PlaylistService {
  constructor(
    private playlistRepo: PlaylistRepository,
    private readonly songService: SongService
  ) {}

  async createPlaylist(createPlaylistDto: CreatePlaylistDto, user: IUserRequest) {
    // Kiểm tra tồn tại song
    await this.validSongIds(createPlaylistDto.songIds);

    return await this.playlistRepo.create({
      ...createPlaylistDto,
      userId: user.userId
    });
  }

  // async findAllPlayLists(query: QueryPlaylistDto) {
  //   const page = query.page || 1;
  //   const limit = query.limit || 10;
  //   const skip = (page - 1) * limit;

  //   const filter: any = {};

  //   if (query.name) {
  //     filter.name = { $regex: query.name, $options: 'i' };
  //   }

  //   let sort: Record<string, 1 | -1> = { name: 1 };
  //   if (query.sort) {
  //     const field = query.sort.startsWith('-') ? query.sort.substring(1) : query.sort;
  //     const order = query.sort.startsWith('-') ? -1 : 1;
  //     sort = { [field]: order };
  //   }

  //   const totalItems = await this.playlistRepo.countDocuments(filter);
  //   const totalPages = Math.ceil(totalItems / limit);
  //   const result = await this.playlistRepo.findAll(filter, skip, limit, sort);

  //   return {
  //     meta: {
  //       current: page,
  //       pageSize: limit,
  //       pages: totalPages,
  //       total: totalItems
  //     },
  //     result
  //   };
  // }

  async addSongToPlaylist(id: string, songId: string) {
    checkMongoId(id);
    checkMongoId(songId);
    if (!(await this.songService.checkExist(songId))) {
      throw new BadRequestException('Bài hát không tồn tại');
    }
    const updated = await this.playlistRepo.addSongToPlaylist(id, songId);

    if (!updated) throw new NotFoundException('Playlist không tồn tại');

    return updated;
  }

  async removeSongFromPlaylist(id: string, songId: string) {
    checkMongoId(id);
    checkMongoId(songId);
    const updated = await this.playlistRepo.removeSongFromPlaylist(id, songId);

    if (!updated) throw new NotFoundException('Playlist không tồn tại');

    return updated;
  }

  async findOnePlaylist(id: string) {
    const playlist = await this.playlistRepo.findById(id);
    if (!playlist) {
      throw new NotFoundException(`Không tìm thấy playlist`);
    }
    return playlist;
  }

  async update(id: string, updatePlaylistDto: UpdatePlaylistDto) {
    // check định dạng id
    checkMongoId(id);

    // Kiểm tra tồn tại song
    await this.validSongIds(updatePlaylistDto.songIds);

    const updated = await this.playlistRepo.update(id, {
      ...updatePlaylistDto
    });

    if (!updated) throw new NotFoundException('Playlist không tồn tại');
    return updated;
  }

  async remove(id: string) {
    return await this.playlistRepo.remove(id);
  }

  private async validSongIds(songIds: string[]) {
    if (songIds && songIds.length > 0) {
      const songCount = await this.songService.getCountSongsByIds(songIds);
      if (songCount !== songIds.length) throw new BadRequestException('Có bài hát không tồn tại');
    }
  }

  async getSongIdsOfPlaylistById(id: string) {
    const songIds = await this.playlistRepo.getSongIdsOfPlaylistById(id);
    return songIds;
  }

  async getAllPlaylist() {
    return await this.playlistRepo.getAllPlaylist();
  }

  async checkExist(id: string) {
    checkMongoId(id);
    return await this.playlistRepo.checkExist(id);
  }

  async findAllPlaylistByUserId(userId: string) {
    return await this.playlistRepo.findAllPlaylistByUserId(userId);
  }

  async getPlaylistSongs(id: string) {
    checkMongoId(id);
    const songs = await this.playlistRepo.getPlaylistSongs(id);
    if (!songs) throw new NotFoundException('Playlist không tồn tại');
    return songs;
  }

  async getPlaylistsForClient(page: number = 1) {
    const size = AppConfig.PAGINATION.SIZE_DEFAUT;
    const p = Math.max(1, Number(page) || 1);

    const skip = (p - 1) * size;
    const data = await this.playlistRepo.getPlaylistsForClient(skip, size, FIELDS.PLAYLIST.CLIENT);
    return {
      meta: {
        page,
        size
      },
      data
    };
  }

  async getDetail(id: string) {
    checkMongoId(id);
    const playlist = await this.playlistRepo.getDetai(id);
    if (!playlist) throw new NotFoundException('Playlist không tồn tại');
    return playlist;
  }
}
