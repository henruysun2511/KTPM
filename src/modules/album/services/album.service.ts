import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRequest } from 'shared/interfaces';
import { AppConfig, FIELDS, QueueName } from 'common/constants';
import { checkMongoId } from 'shared/utils/validateMongoId.util';
import { ClientSession } from 'mongoose';
import { ArtistService } from 'modules/artist/services/artist.service';
import { IUserContext } from 'shared/interfaces/user-context.interface';

import { AlbumRepository } from '../repositories/album.repository';
import { CreateAlbumDto, QueryAlbumDto, UpdateAlbumDto } from '../dto';
import { buildAlbumFilterQuery } from '../queries/album.query';

@Injectable()
export class AlbumService {
  constructor(
    private readonly albumRepo: AlbumRepository,
    private readonly artistService: ArtistService
  ) {}

  async create(albumDto: CreateAlbumDto, user: Partial<IUserRequest>) {
    const artistId = await this.artistService.getIdByUserId(user.userId);
    if (!artistId) throw new BadRequestException('Bạn không phải là nghệ sĩ');

    const album = await this.albumRepo.create({
      ...albumDto,
      artist: artistId,
      createdBy: user.userId
    });
    return album;
  }

  async update(id: string, albumDto: UpdateAlbumDto, user?: IUserContext) {
    checkMongoId(id);
    const album = await this.albumRepo.update(id, {
      ...albumDto,
      createdBy: user?.userId
    });
    if (!album) throw new NotFoundException('Album không tồn tại');

    return album;
  }

  async updateImage(id: string, img: string) {
    return await this.albumRepo.update(id, { img });
  }

  async findById(id: string) {
    checkMongoId(id);
    return await this.albumRepo.findById(id);
  }

  async addSongToAlbum(albumId: string, songId: string, session?: ClientSession) {
    checkMongoId(albumId);
    checkMongoId(songId);
    return await this.albumRepo.addSongToAlbum(albumId, songId, session);
  }

  async removeSongFromAlbum(id: string, songId: string, session?: ClientSession) {
    checkMongoId(id);
    checkMongoId(songId);
    return await this.albumRepo.removeSongFromAlbum(id, songId, session);
  }

  async getAlbumsForAdmin(query: QueryAlbumDto) {
    const page = query.page || 1;
    const size = query.size || 10;
    const skip = (page - 1) * size;

    const { filter, sort } = buildAlbumFilterQuery(query);

    const [totalElements, data] = await Promise.all([
      this.albumRepo.countDocuments(filter),
      this.albumRepo.findAll(filter, skip, size, sort)
    ]);
    const totalPages = Math.ceil(totalElements / size);

    return {
      meta: {
        page,
        size,
        totalPages,
        totalElements
      },
      data
    };
  }

  async GetAlbumsForClient(page: number = 1) {
    const size = AppConfig.PAGINATION.SIZE_DEFAUT;
    const p = Math.max(1, Number(page) || 1);
    const skip = (p - 1) * size;
    const data = await this.albumRepo.getAlbumsForClient(skip, size, FIELDS.ALBUM.CLIENT);
    return {
      meta: {
        page,
        size
      },
      data
    };
  }

  async checkExist(id: string) {
    checkMongoId(id);
    return await this.albumRepo.checkExist(id);
  }

  async findAllAlbumByArtistId(artistId: string) {
    checkMongoId(artistId);
    return await this.albumRepo.findAllAlbumByArtistId(artistId);
  }

  async getDetail(id: string) {
    checkMongoId(id);
    const album = await this.albumRepo.findById(id);
    if (!album) throw new NotFoundException('Album không tồn tại');
    return album;
  }

  async getAlbumSongs(id: string) {
    checkMongoId(id);
    const songs = await this.albumRepo.getAlbumSongs(id);
    if (!songs) throw new NotFoundException('Album không tồn tại');
    return songs;
  }
}
