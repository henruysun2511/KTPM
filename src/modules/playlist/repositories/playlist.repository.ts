import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SearchPipelineBuilder } from 'shared/utils';

import { Playlist } from '../schemas/playlist.schema';

export class PlaylistRepository {
  constructor(@InjectModel(Playlist.name) private playlistRepo: Model<Playlist>) {}

  async create(playListData: Partial<Playlist>): Promise<Playlist> {
    return await this.playlistRepo.create(playListData);
  }
  //Hiển thị theo người dùng
  // async findByUserId(userId: string) {
  //   return await this.playlistModel
  //     .findOne({
  //       userId: new mongoose.Types.ObjectId(userId)
  //     })
  //     .select('_id name')
  //     .lean()
  //     .exec();
  // }

  //Hiển thị chi tiết playlist
  async findById(_id: string): Promise<Playlist | null> {
    return await this.playlistRepo.findOne({ _id, deleted: false });
  }

  async findAllPlaylistByUserId(userId: string): Promise<Playlist[] | []> {
    return await this.playlistRepo.find({ deleted: false, userId }).select('name songIds');
  }

  async update(_id: string, playlistData: Partial<Playlist | null>): Promise<Playlist | null> {
    const updated = await this.playlistRepo
      .findByIdAndUpdate(_id, { $set: playlistData }, { new: true })
      .populate({
        path: 'songIds',
        select: '_id name imageUrl albumId duration',
        populate: { path: 'albumId', select: '_id name' }
      })
      .lean()
      .exec();

    return updated;
  }

  async remove(_id: string) {
    await this.playlistRepo.updateOne({ _id }, { deleted: true, deletedAt: new Date() });
  }

  async getSongIdsById(_id: string): Promise<string[] | Types.ObjectId[] | []> {
    const playlist = await this.playlistRepo
      .findOne({ _id, deleted: false })
      .select('songIds')
      .lean<{ songIds: string[] | Types.ObjectId[] }>();
    return playlist?.songIds ?? [];
  }

  async addSongToPlaylist(_id: string, songId: string): Promise<Playlist | null> {
    await this.playlistRepo.updateOne({ _id, songIds: { $ne: songId } }, { $addToSet: { songIds: songId } }).exec();

    return this.findById(_id);
  }

  async removeSongFromPlaylist(_id: string, songId: string): Promise<Playlist | null> {
    await this.playlistRepo.updateOne({ _id, songIds: songId }, { $pull: { songIds: songId } }).exec();

    return this.findById(_id);
  }

  async getSongIdsOfPlaylistById(_id: string): Promise<{
    songIds: string[];
  }> {
    return await this.playlistRepo.findOne({ _id, deleted: false }).select('songIds').lean<{ songIds: string[] }>();
  }

  async getAllPlaylist() {
    return await this.playlistRepo.find({ deleted: false });
  }

  async checkExist(_id: string): Promise<boolean> {
    const exist = await this.playlistRepo.exists({ _id, deleted: false });
    return !!exist;
  }

  async getPlaylistsForClient(
    skip: number,
    size: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _select?: string | string[]
  ): Promise<Partial<Playlist[]> | []> {
    const playlists = await this.playlistRepo.aggregate([
      { $match: { deleted: false } },
      { $skip: skip },
      { $limit: size },
      {
        $lookup: {
          from: 'songs',
          localField: 'songIds',
          foreignField: '_id',
          as: 'songData',
          pipeline: [{ $limit: 3 }, { $project: { imageUrl: 1 } }]
        }
      },
      {
        $addFields: {
          songImages: '$songData.imageUrl'
        }
      },
      {
        $project: {
          name: 1,
          description: 1,
          userId: 1,
          img: 1,
          songImages: 1
        }
      }
    ]);
    return playlists;
  }

  async getPlaylistSongs(_id: string) {
    const result = await this.playlistRepo.aggregate([
      { $match: { _id: new Types.ObjectId(_id), deleted: false } },

      {
        $lookup: {
          from: 'songs',
          localField: 'songIds',
          foreignField: '_id',
          as: 'songs',
          pipeline: [
            {
              $project: {
                name: 1,
                imageUrl: 1,
                duration: 1,
                artists: 1
              }
            },
            {
              $lookup: {
                from: 'artists',
                localField: 'artists',
                foreignField: '_id',
                as: 'artists',
                pipeline: [
                  {
                    $project: { name: 1 }
                  }
                ]
              }
            }
          ]
        }
      },

      { $project: { songs: 1 } }
    ]);

    return result[0]?.songs ?? null;
  }

  async searchByName(keyword: string, limit = 20): Promise<Playlist[] | []> {
    if (!keyword?.trim()) return [];

    return this.playlistRepo.aggregate(SearchPipelineBuilder.textSearch(keyword, { limit }));
  }

  async getDetai(_id: string): Promise<Playlist | null> {
    return await this.playlistRepo.findOne({ _id, deleted: false }).lean().exec();
  }
}
