import { Injectable, NotFoundException } from '@nestjs/common';
import { IUserRequest } from 'shared/interfaces';
import { checkMongoId } from 'shared/utils/validateMongoId.util';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { RoleService } from 'modules/role/services/role.service';
import { UserService } from 'modules/user/services/user.service';
import { ArtistVerificationStatus } from 'common/enum/artist-verification.enum';
import { RoleName } from 'common/enum/role-name.enum';
import { ArtistService } from 'modules/artist/services/artist.service';

import { ArtistVerificationRepository } from '../repositories/artist-verification.repository';
import { CreateArtistVerificationDto, QueryArtistVerificationDto, UpdateArtistVerificationDto } from '../dtos';
import { buildArtistVerificationFilterQuery } from '../queries/artist-verification.query';

@Injectable()
export class ArtistVerificationService {
  constructor(
    private readonly artistVerificationRepo: ArtistVerificationRepository,
    private readonly roleService: RoleService,
    private readonly userService: UserService,
    private readonly artistService: ArtistService,
    @InjectConnection() private readonly connection: Connection
  ) {}

  async create(artistVerificationDto: CreateArtistVerificationDto, user: Partial<IUserRequest>) {
    const artistVerification = await this.artistVerificationRepo.create({
      ...artistVerificationDto,
      userId: user.userId
    });

    return artistVerification;
  }

  async updateIndentity(id: string, identityImages: { front: string; back: string }) {
    checkMongoId(id);
    return await this.artistVerificationRepo.updateIndentity(id, identityImages);
  }

  async updateStatus(id: string, dto: UpdateArtistVerificationDto, approvedBy: string) {
    checkMongoId(id);

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // 1. Cập nhật trạng thái verification request
      const verification = await this.artistVerificationRepo.update(
        id,
        {
          ...dto,
          approvedBy,
          approvedAt: new Date()
        },
        session
      );

      if (!verification) {
        throw new NotFoundException('Yêu cầu xác nhận nghệ sĩ không tồn tại');
      }

      // 2. Nếu không phải APPROVED thì chỉ cần lưu trạng thái rồi return
      if (verification.status !== ArtistVerificationStatus.APPROVED) {
        await session.commitTransaction();
        await session.endSession();
        return verification;
      }

      // 3. Lấy role artist
      const roleId = await this.roleService.findIdByName(RoleName.ARTIST);

      // 4. Đổi role user
      await this.userService.updateRoleInternal(verification.userId.toString(), roleId, approvedBy, session);

      // 5. Kiểm tra xem đã có artist cho user này chưa
      const existed = await this.artistService.checkExistByUserId(verification.userId.toString(), session);
      if (!existed) {
        // Tạo artist (trong transaction)
        await this.artistService.create(
          {
            name: verification.stageName,
            userId: verification.userId.toString()
          },
          { userId: approvedBy },
          session
        );
      }

      // 6. Commit cuối
      await session.commitTransaction();

      return verification;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async findAll(query: QueryArtistVerificationDto) {
    const page = query.page || 1;
    const size = query.size || 10;
    const skip = (page - 1) * size;

    const { filter, sort } = buildArtistVerificationFilterQuery(query);

    const [totalElements, data] = await Promise.all([
      this.artistVerificationRepo.countDocuments(filter),
      this.artistVerificationRepo.findAll(filter, skip, size, sort)
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
}
