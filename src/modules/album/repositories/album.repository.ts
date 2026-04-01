/* eslint-disable @typescript-eslint/no-explicit-any */
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { ClientSession, Model, Types } from 'mongoose';
import { SearchPipelineBuilder } from 'shared/utils';

import { Album } from '../schemas/album.schema';

@Injectable()
export class AlbumRepository {
  constructor(@InjectModel(Album.name) private readonly albumRepo: Model<Album>) {}

  async create(albumData: Partial<Album>): Promise<Album | null> {
    return await this.albumRepo.create(albumData);
  }

  async countDocuments(filter: Record<string, any>) {
    const f = this.getFilter(filter);
    return this.albumRepo.countDocuments(f);
  }

  async findAll(
    filter: Record<string, any>,
    skip: number,
    limit: number,
    sort: Record<string, 1 | -1>,
    select?: string | string[]
  ): Promise<Album[] | []> {
    const f = this.getFilter(filter);
    const albums = this.albumRepo.find(f).sort(sort).skip(skip).limit(limit).lean();
    if (select) albums.select(select);
    return await albums.exec();
  }

  private getFilter(filter: Record<string, any>): Record<string, any> {
    const { start, end, ...filterFinal } = filter;
    const f: Record<string, any> = { deleted: false, ...filterFinal };
    // build price filter only if start or end provided
    const releaseDateFilter: Record<string, any> = {};
    if (start !== undefined && start !== null && start !== '') releaseDateFilter.$gte = start;
    if (end !== undefined && end !== null && end !== '') releaseDateFilter.$lte = end;
    if (Object.keys(releaseDateFilter).length) f.release_date = releaseDateFilter;
    return f;
  }

  async getAlbumsForClient(skip: number, size: number, select?: string | string[]): Promise<Album[]> {
    const albums = this.albumRepo.find({ deleted: false }).skip(skip).limit(size).lean();
    if (select) albums.select(select);
    return await albums.exec();
  }

  async findById(_id: string): Promise<Album | null> {
    return await this.albumRepo.findOne({ _id, deleted: false }).lean().exec();
  }

  async update(id: string, albumData: Partial<Album>): Promise<Album | null> {
    return await this.albumRepo.findByIdAndUpdate(id, { $set: albumData }, { new: true, runValidators: true }).exec();
  }

  async incrementTotalSongs(albumId: string, delta = 1) {
    return this.albumRepo.findByIdAndUpdate(albumId, { $inc: { total_songs: delta } }, { new: true }).exec();
  }

  async recalcTotalSongs(albumId: string) {
    // caller should pass count computed from Song collection (or use aggregation here)
    const count = await this.albumRepo.aggregate([
      { $match: { _id: new Types.ObjectId(albumId) } },
      { $project: { total_songs: { $size: { $ifNull: ['$songs', []] } } } }
    ]);
    const total = count?.[0]?.total_songs ?? 0;
    return this.albumRepo.findByIdAndUpdate(albumId, { $set: { total_songs: total } }, { new: true }).exec();
  }

  async addSongToAlbum(albumId: string, songId: string, session?: ClientSession) {
    // conditional update: only match if songId is not already in songs => safe $inc
    const opts = session ? { session } : undefined;
    await this.albumRepo
      .updateOne(
        { _id: albumId, songs: { $ne: songId } },
        { $addToSet: { songs: songId }, $inc: { total_songs: 1 } },
        opts
      )
      .exec();
  }

  async removeSongFromAlbum(_id: string, songId: string, session?: ClientSession): Promise<void> {
    const opts = session ? { session } : undefined;
    await this.albumRepo
      .updateOne({ _id, songs: songId }, { $pull: { songs: songId }, $inc: { total_songs: -1 } }, opts)
      .exec();
  }

  async checkExist(_id: string): Promise<boolean> {
    const exist = await this.albumRepo.exists({ _id, deleted: false });
    return !!exist;
  }

  async findAllAlbumByArtistId(artistId: string): Promise<Album[] | []> {
    return await this.albumRepo.find({ artist: artistId, deleted: false }).lean().exec();
  }

  async getAlbumSongs(_id: string): Promise<Types.ObjectId[] | string[] | null> {
    const album = await this.albumRepo
      .findOne({ _id, deleted: false })
      .select('songs')
      .populate({
        path: 'songs',
        select: 'name duration duration'
      })
      .lean()
      .exec();
    return album?.songs ?? null;
  }

  async searchByName(keyword: string, limit = 20): Promise<Album[] | []> {
    if (!keyword?.trim()) return [];

    return this.albumRepo.aggregate(SearchPipelineBuilder.textSearch(keyword, { limit }));
  }
}
