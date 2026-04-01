import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AppConfig, FIELDS } from 'common/constants';
import { checkMongoId } from 'shared/utils/validateMongoId.util';
import { ClientSession } from 'mongoose';
import { GenreService } from 'modules/genres/services/genre.service';
import { IUserContext } from 'shared/interfaces/user-context.interface';

import { ArtistRepository } from '../repositories/artist.repository';
import { CreateArtistDto } from '../dtos/create-artist.dto';
import { UpdateArtistDto } from '../dtos/update-artist.dto';
import { QueryArtistDto } from '../dtos';
import { buildArtistFilterQuery } from '../queries/artist.query';

@Injectable()
export class ArtistService {
  constructor(
    private readonly artistRepo: ArtistRepository,
    private readonly genreService: GenreService
  ) {}

  async create(artistDto: CreateArtistDto, user: IUserContext, session?: ClientSession) {
    if (await this.checkExistByUserId(artistDto.userId)) throw new BadRequestException('Nghệ sĩ này tồn tại rồi');
    artistDto.genreNames = await this.validateGenreNamesStrict(artistDto.genreNames);
    const artist = await this.artistRepo.create(
      {
        ...artistDto,
        createdBy: user.userId
      },
      session
    );

    return artist;
  }

  async update(artistDto: UpdateArtistDto, user: IUserContext) {
    artistDto.genreNames = await this.validateGenreNamesStrict(artistDto.genreNames);

    const artist = await this.artistRepo.updateByUserId(user.userId, {
      ...artistDto,
      updatedBy: user?.userId
    });

    if (!artist) {
      throw new NotFoundException('Không tìm thấy tác giả');
    }

    return artist;
  }

  async updateImgUrl(id: string, imgUrl: { avatarUrl?: string; bannerUrl?: string }) {
    checkMongoId(id);
    const payload: Record<string, string> = {};
    if (imgUrl.avatarUrl) payload.avatarUrl = imgUrl.avatarUrl;
    if (imgUrl.bannerUrl) payload.bannerUrl = imgUrl.bannerUrl;
    if (Object.keys(payload).length === 0) throw new BadRequestException('No image url provided');

    const updated = await this.artistRepo.updateById(id, payload);
    if (!updated) throw new NotFoundException('Nghệ sĩ không tồn tại');
    return updated;
  }

  async remove(userId: string, deletedBy: string) {
    const deleted = await this.artistRepo.remove(userId, deletedBy);
    if (deleted.matchedCount === 0) throw new NotFoundException('Tác giả không tồn tại');
  }

  async findByIds(_ids: string[]) {
    return await this.artistRepo.findByIds(_ids);
  }

  async getCountArtistsByIds(artistIds: string[]) {
    return await this.artistRepo.getCountArtistsByIds(artistIds);
  }

  async getIdByUserId(userId: string) {
    return await this.artistRepo.getIdByUserId(userId);
  }

  async getUserIdById(id: string) {
    return await this.artistRepo.getUserIdById(id);
  }

  async getProfile(userId: string) {
    const artist = await this.artistRepo.getProfile(userId);
    if (!artist) throw new NotFoundException('Bạn không phải là nghệ sĩ');
    return artist;
  }

  async checkExist(id: string) {
    checkMongoId(id);
    return await this.artistRepo.checkExist(id);
  }

  async ensureNotExists(artistId: string) {
    if (await this.checkExist(artistId)) {
      throw new BadRequestException('Nghệ sĩ đã tồn tại rồi');
    }
  }

  async ensureExists(artistId: string) {
    if (!(await this.checkExist(artistId))) {
      throw new NotFoundException('Nghệ sĩ không tồn tại');
    }
  }

  // Tăng fl
  async incrementFollower(id: string, session?: ClientSession) {
    return await this.artistRepo.incrementFollower(id, session);
  }

  // Giảm fl
  async decrementFollower(id: string, session?: ClientSession) {
    return this.artistRepo.decrementFollower(id, session);
  }

  async getArtistsForAdmin(query: QueryArtistDto) {
    const page = query.page || 1;
    const size = query.size || 10;
    const skip = (page - 1) * size;

    const { filter, sort } = buildArtistFilterQuery(query);

    const [totalElements, data] = await Promise.all([
      this.artistRepo.countDocuments(filter),
      this.artistRepo.findAll(filter, skip, size, sort)
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

  async getArtistsForClient(page: number = 1) {
    const size = AppConfig.PAGINATION.SIZE_DEFAUT;
    const p = Math.max(1, Number(page) || 1);
    const skip = (p - 1) * size;
    const data = await this.artistRepo.getArtistsForClient(skip, size, FIELDS.ARTIST.CLIENT);
    return {
      meta: {
        page,
        size
      },
      data
    };
  }

  private async validateGenreNamesStrict(genreNames: string[]) {
    if (!genreNames || genreNames.length === 0) return [];
    return await this.genreService.getGenreNamesByGenreNames(genreNames);
  }

  async checkExistByUserId(userId: string, session?: ClientSession) {
    checkMongoId(userId);
    return await this.artistRepo.checkExistByUserId(userId, session);
  }

  async getDetail(id: string) {
    checkMongoId(id);
    const artist = await this.artistRepo.getDetail(id);
    if (!artist) throw new NotFoundException('Nghệ sĩ không tồn tại');
    return artist;
  }

  async getTop10ArtistsByFollowers() {
    return await this.artistRepo.getTop10ArtistsByFollowers();
  }

  async getArtistsByYear(year: number): Promise<Array<{ year: number; month: number; count: number }>> {
    const y = Number(year);
    if (!Number.isInteger(y) || y < 1970 || y > 3000) {
      throw new BadRequestException('Invalid year');
    }

    // build UTC range for the year (inclusive)
    const start = new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0)).toISOString();
    const end = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999)).toISOString();

    // repository should return [{ year, month, count }, ...] for months that have users
    const agg = await this.artistRepo.getArtistsByYear(start, end);

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
}
