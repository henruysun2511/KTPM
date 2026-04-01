import { BadRequestException, Injectable } from '@nestjs/common';
import { ArtistService } from 'modules/artist/services/artist.service';
import { NotificationService } from 'modules/notification/services/notification.service';
import { IUserRequest } from 'shared/interfaces';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { RedisService } from 'modules/redis/services/redis.service';

import { SongService } from '../../songs/services/song.service';
import { LikeRepository } from '../repositories/like.repository';
import { CreateLikeDto, QueryLikeDto } from '../dtos';

@Injectable()
export class LikeService {
  constructor(
    private readonly likeRepo: LikeRepository,
    private readonly songService: SongService,
    private readonly artistService: ArtistService,
    private readonly notificationService: NotificationService,
    private readonly redisService: RedisService,
    @InjectConnection() private readonly connection: Connection
  ) {}

  // Like
  // ...existing code...
  async like(likeDto: CreateLikeDto, user: Partial<IUserRequest>) {
    const { songId } = likeDto;

    // 1. Kiểm tra bài hát tồn tại
    await this.songService.throwIfNotExist(songId);

    // 2. Kiểm tra user đã like chưa
    await this.validLike(songId, user.userId);

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // 3. Tạo like
      const like = await this.likeRepo.create({ songId, userId: user.userId }, session);

      // 4. Tăng số likes; nếu tăng thất bại thì rollback like vừa tạo

      await this.songService.increaseLikes(songId, session);

      await session.commitTransaction();

      try {
        await this.redisService.zincrby('songs:likes', 1, songId);
      } catch {
        /* ignore redis errors */
      }
      return like;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }

    // 5. Gửi notification cho artist (best-effort)
    // try {
    //   const song = await this.songService.getDetail(songId);
    //   const artist = await this.artistService.findOneArtist(String(song.artistId));
    //   if (artist) {
    //     await this.notificationService.createNotification({
    //       userId: String(artist.userId),
    //       title: 'Bài hát của bạn vừa được thích',
    //       message: `Một người dùng đã thích bài hát "${song.name}"`
    //       // nếu service yêu cầu type, thay bằng giá trị thích hợp
    //     } as any);
    //   }
    // } catch {
    //   /* ignore notification errors */
    // }
  }

  // Unlike
  async unlike(createDto: CreateLikeDto, user: Partial<IUserRequest>) {
    const { songId } = createDto;

    // Kiểm tra xem đã like chưa
    await this.validUnlike(songId, user.userId);

    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // unlike
      await this.likeRepo.unlike(songId, user.userId, session);

      // 4. Giảm số likes; nếu giảm thất bại thì rollback

      await this.songService.decreaseLikesIfPossible(songId, session);
      await session.commitTransaction();

      try {
        const newScore = await this.redisService.zincrby('songs:likes', -1, songId);
        if (Number(newScore) <= 0) {
          await this.redisService.zrem('songs:likes', songId);
        }
      } catch {
        /* ignore redis errors */
      }

      return;
    } catch (error) {
      await session.abortTransaction();
    } finally {
      await session.endSession();
    }
  }

  // //Đếm số lượt thích
  // async countLikes(songId: string) {
  //   return this.likeRepo.countDocuments({ songId });
  // }

  // //Lấy danh sách bài hát đã like
  async getLikedSongs(userId: string, query: QueryLikeDto) {
    const page = query.page || 1;
    const size = query.size || 10;
    const skip = (page - 1) * size;

    const [totalElements, data] = await Promise.all([
      this.likeRepo.countDocuments({ userId }),
      this.likeRepo.findLikedSongs(userId, skip, size)
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

  async validLike(songId: string, userId: string) {
    const like = await this.likeRepo.checkLike(songId, userId);
    if (like) throw new BadRequestException('Bạn đã thích bài này rồi');
  }

  async validUnlike(songId: string, userId: string) {
    const like = await this.likeRepo.checkLike(songId, userId);
    if (!like) throw new BadRequestException('Bạn chưa thích bài hát này');
  }
}
