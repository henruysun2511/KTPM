import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ClientSession, Connection } from 'mongoose';
import { TypeLogin } from 'common/enum/login-type.enum';
import { InjectConnection } from '@nestjs/mongoose';
import { CartService } from 'modules/cart/services/cart.service';
import { AppConfig } from 'common/constants/app-config.constant';
import { RoleService } from 'modules/role/services/role.service';
import { hashPassword } from 'shared/utils/password.util';
import { checkMongoId } from 'shared/utils/validateMongoId.util';
import { RoleName } from 'common/enum/role-name.enum';
import { ArtistService } from 'modules/artist/services/artist.service';
import { IUserContext } from 'shared/interfaces/user-context.interface';

import { UserRepository } from '../repositories/user.repository';
import {
  CreateUserGoogleDto,
  CreateUserLocalDto,
  InfoUserDto,
  QueryUserDto,
  UpdateUserGoogleDto,
  UpdateUserLocalDto
} from '../dtos';
import { buildUserFilterQuery } from '../queries/user.query';

@Injectable()
export class UserService {
  constructor(
    private userRepo: UserRepository,
    private roleService: RoleService,
    private readonly artistService: ArtistService,
    private readonly cartService: CartService,
    @InjectConnection() private readonly connection: Connection
  ) {}

  // Lưu thông tin người dùng đăng nhập bằng gg
  async createUserGoodle(userDto: CreateUserGoogleDto) {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const user = await this.userRepo.create(
        { ...userDto, roleId: AppConfig.ROLE.USER, typeLogin: TypeLogin.GOOGLE },
        { session }
      );
      await this.cartService.create({ userId: user._id.toString() }, { session });
      await session.commitTransaction();
      return user;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  // Lưu thông tin người dùng đăng nhập bằng local
  async createUserLocal(userDto: CreateUserLocalDto) {
    const session = await this.connection.startSession();
    session.startTransaction();
    if (!userDto.roleId) userDto.roleId = AppConfig.ROLE.USER;
    else if (!(await this.roleService.checkExist(userDto.roleId))) {
      throw new BadRequestException('Invalid roleId');
    }

    userDto.password = await hashPassword(userDto.password);
    try {
      const user = await this.userRepo.create({ ...userDto, typeLogin: TypeLogin.LOCAL }, { session });
      await this.cartService.create({ userId: user._id.toString() }, { session });
      await session.commitTransaction();
      return user;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  // change status
  async changeStatus(id: string) {
    // tìm user
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const newStatus = String(user.status).toLowerCase() === 'inactive' ? 'active' : 'inactive';
    return await this.userRepo.changeStatus(id, newStatus);
  }

  // Tìm user bằng _id
  async findById(id: string) {
    checkMongoId(id);
    return await this.userRepo.findById(id);
  }

  // Tìm user bằng googleId
  async findByGoogleId(googleId: string) {
    return await this.userRepo.findUserByGoogleId(googleId);
  }

  // Tìm user bằng email
  async findByEmail(email: string) {
    return await this.userRepo.findUserByEmail(email);
  }

  // Tìm user bằng username
  async findByUsername(username: string) {
    return await this.userRepo.findByUsername(username);
  }

  async findPasswordById(id: string) {
    checkMongoId(id);
    return await this.userRepo.findPasswordById(id);
  }

  // Cập nhật thông tin user đăng nhập bằng google
  async updateUserGoogle(id: string, userDto: UpdateUserGoogleDto) {
    return await this.userRepo.update(id, userDto);
  }

  // Cập nhật thông tin cho user đăng nhập bằng local
  async updateUserLocal(id: string, userDto: UpdateUserLocalDto) {
    return await this.userRepo.update(id, userDto);
  }

  // update thông tin cá nhân
  async updateInfo(id: string, infoDto: InfoUserDto) {
    const user = await this.userRepo.update(id, infoDto);
    if (!user) throw new NotFoundException('User không tồn tại');
    return user;
  }

  // update avatar
  async updateAvatar(id: string, avatar: string) {
    const user = await this.userRepo.update(id, { avatar });
    if (!user) throw new NotFoundException('User không tồn tại');
    return user;
  }

  // Cập nhật trạng thái đặc quyền
  async updateIsPremium(id: string, isPremium: boolean, session?: ClientSession) {
    return await this.userRepo.updateIsPremium(id, isPremium, session);
  }

  // Dành cho internal call: assume roleId đã guaranteed tồn tại
  async updateRoleInternal(id: string, roleId: string, updatedBy: string, session?: ClientSession) {
    checkMongoId(id);
    checkMongoId(roleId);
    const user = await this.userRepo.updateRole(id, { roleId, updatedBy }, session);
    if (!user) throw new NotFoundException('User không tồn tại');
    return user;
  }

  // Dành cho public/admin: check role tồn tại
  async updateSystemRole(userId: string, roleId: string, updatedBy: IUserContext, session?: ClientSession) {
    checkMongoId(userId);
    checkMongoId(roleId);

    const roleName = await this.roleService.findNameById(roleId);
    if (!roleName) {
      throw new NotFoundException('Role không tồn tại');
    }

    if (roleName === RoleName.ARTIST) {
      throw new ForbiddenException('Artist không phải system role');
    }

    const hasArtistProfile = await this.artistService.checkExistByUserId(userId);
    if (hasArtistProfile) {
      throw new ForbiddenException('Không thể thay đổi role của tài khoản đã đăng ký artist');
    }

    return this.userRepo.updateRole(userId, { roleId, updatedBy: updatedBy.userId }, session);
  }

  // Kiểm tra xem user có tồn tại hay không qua email
  async existUserByEmail(email: string) {
    return await this.userRepo.existUserByEmail(email);
  }

  // Kiểm tra xem user có tồn tại hay không qua username
  async existUserByUsername(username: string) {
    return await this.userRepo.existUserByUsername(username);
  }

  async checkExist(id: string) {
    checkMongoId(id);
    return await this.userRepo.checkExist(id);
  }

  async updateExpiredPremiumUsers(ids: string[]) {
    return await this.userRepo.updateExpiredPremiumUsers(ids);
  }

  async remove(id: string, userId: string) {
    const deleted = await this.userRepo.remove(id, userId);
    if (deleted.matchedCount === 0) throw new NotFoundException('User không tồn tại');
  }

  async getUsersByYear(year: number): Promise<Array<{ year: number; month: number; count: number }>> {
    const y = Number(year);
    if (!Number.isInteger(y) || y < 1970 || y > 3000) {
      throw new BadRequestException('Invalid year');
    }

    // build UTC range for the year (inclusive)
    const start = new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0)).toISOString();
    const end = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999)).toISOString();

    // repository should return [{ year, month, count }, ...] for months that have users
    const agg = await this.userRepo.getUsersByYear(start, end);

    // normalize to 12 months with zero fill
    const counts = new Map<number, number>();
    for (const item of agg) {
      counts.set(Number(item.month), Number(item.count) || 0);
    }

    const result: Array<{ year: number; month: number; count: number }> = [];
    for (let m = 1; m <= 12; m++) {
      result.push({ year: y, month: m, count: counts.get(m) ?? 0 });
    }

    return result;
  }

  async findAllUser(query: QueryUserDto) {
    const page = query.page || 1;
    const size = query.size || 10;
    const skip = (page - 1) * size;

    const { filter, sort } = buildUserFilterQuery(query);

    const { data, total } = await this.userRepo.findAll(filter, skip, size, sort);
    const totalPages = Math.ceil(total / size);

    return {
      meta: {
        page,
        size,
        totalPages,
        totalElements: total
      },
      data
    };
  }
}
