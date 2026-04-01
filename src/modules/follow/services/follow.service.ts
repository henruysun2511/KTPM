import { BadRequestException, Injectable } from '@nestjs/common';
import { IUserRequest } from 'shared/interfaces';
import { ArtistService } from 'modules/artist/services/artist.service';
import { NotificationType } from 'common/enum';
import { NotificationService } from 'modules/notification/services/notification.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

import { FollowRepository } from '../repositories/follow.repository';
import { CreateFollowDto, QueryFollowDto } from '../dtos';

@Injectable()
export class FollowService {
  constructor(
    private readonly followRepo: FollowRepository,
    private readonly artistService: ArtistService,
    private readonly notificationService: NotificationService,
    @InjectConnection() private readonly connection: Connection
  ) {}

  async follow(followDto: CreateFollowDto, user: IUserRequest) {
    const { artistId } = followDto;
    const { userId, username } = user;

    // Đảm bảo artist tồn tại rồi
    await this.artistService.ensureExists(artistId);

    const userIdFinal = await this.artistService.getUserIdById(artistId);

    // Không thể follow chính mình (so sánh userId!)
    if (userIdFinal === userId) {
      throw new BadRequestException('Không thể follow chính mình');
    }

    // valid follow trùng
    await this.throwIfFollowed(artistId, userId);

    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const follow = await this.followRepo.create(
        {
          artistId,
          userId
        },
        session
      );

      // Cập nhật follower cho nghệ sĩ và  gửi thông báo đến user là chủ sở hữu artist đó
      await Promise.all([
        this.artistService.incrementFollower(artistId, session),
        this.notificationService.createNotification({
          receiverId: userIdFinal,
          title: 'Bạn có người theo dõi mới',
          message: `${username} vừa follow bạn`,
          type: NotificationType.NEW_FOLLOW
        })
      ]);

      await session.commitTransaction();
      return follow;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
  async unfollow(followDto: CreateFollowDto, userId: string) {
    const { artistId } = followDto;

    // Kiểm tra nghệ sĩ tồn tại
    await this.artistService.ensureExists(artistId);

    // Không thể unfollow chính mình (phòng case artist cũng là user)
    const ownerUserId = await this.artistService.getUserIdById(artistId);
    if (ownerUserId === userId) {
      throw new BadRequestException('Không thể unfollow chính mình');
    }

    // Kiểm tra chắc chắn đã follow
    await this.throwIfNotFollowed(artistId, userId);

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // 1. Xóa follow
      const unfollow = await this.followRepo.unfollow(artistId, userId, session);

      // 2. Giảm follower
      await this.artistService.decrementFollower(artistId, session);

      await session.commitTransaction();
      return unfollow;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async findFollowingUser(artistId: string) {
    return await this.followRepo.findFollowingUser(artistId);
  }

  async findFollowingUserPaged(artistId: string, lastId: string | null, limit: number) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = { artistId: artistId };

    // Nếu có lastId, ta chỉ lấy những bản ghi có _id lớn hơn lastId này
    if (lastId) {
      filter._id = { $gt: lastId };
    }
    return await this.followRepo.findFollowingUserPaged(filter, limit);
  }

  // Lấy danh sách nghệ sĩ user đang follow
  async getFollowedArtists(userId, query: QueryFollowDto) {
    const page = query.page || 1;
    const size = query.size || 10;
    const skip = (page - 1) * size;

    const [totalElements, data] = await Promise.all([
      this.followRepo.countDocuments({ userId }),
      this.followRepo.findFollowedArtists(userId, skip, size)
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

  // // Lấy số follow của 1 artist
  // async getFollowingUser(artistId: string) {
  //   return await this.followRepo.findFollowingUser(artistId);
  // }

  // // Lấy số follow của 1 artist
  // async getFollowerCount(artistId: string) {
  //   const total = await this.followRepo.countDocuments({
  //     followedArtistId: artistId
  //   });

  //   return { totalFollowers: total };
  // }

  async throwIfNotFollowed(artistId: string, userId: string) {
    const follow = await this.followRepo.checkFollow(artistId, userId);
    if (!follow) throw new BadRequestException('Bạn chưa follow nghệ sĩ này');
  }

  async throwIfFollowed(artistId: string, userId: string) {
    const follow = await this.followRepo.checkFollow(artistId, userId);
    if (follow) throw new BadRequestException('Bạn đã follow nghệ sĩ này rồi');
  }
}
