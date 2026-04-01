import { Injectable, NotFoundException } from '@nestjs/common';
import { AppConfig, FIELDS } from 'common/constants';
import { NewsStatus } from 'common/enum';
import { IUserContext } from 'shared/interfaces/user-context.interface';
import { checkMongoId } from 'shared/utils/validateMongoId.util';

import { CreateNewsDto, QueryNewsDto, UpdateNewsDto } from '../dtos';
import { buildNewsFilterQuery } from '../queries/news.query';
import { NewsRepository } from '../repositories/news.repository';

@Injectable()
export class NewsService {
  constructor(private readonly newsRepo: NewsRepository) {}

  async create(dto: CreateNewsDto, user: IUserContext) {
    return await this.newsRepo.create({
      ...dto,
      createdBy: user.userId
    });
  }

  async update(id: string, dto: UpdateNewsDto, user: IUserContext) {
    checkMongoId(id);
    const updated = await this.newsRepo.updateById(id, {
      ...dto,
      updatedBy: user.userId
    });

    if (!updated) throw new NotFoundException('Tin tức không tồn tại');
    return updated;
  }

  async remove(id: string, deletedBy: string) {
    checkMongoId(id);
    const result = await this.newsRepo.remove(id, deletedBy);
    if (result.matchedCount === 0) throw new NotFoundException('Tin tức không tồn tại');
  }

  async getAll(query: QueryNewsDto) {
    const page = query.page || 1;
    const size = query.size || AppConfig.PAGINATION.SIZE_DEFAUT;
    const skip = (page - 1) * size;

    const { filter, sort } = buildNewsFilterQuery(query);

    const [totalElements, data] = await Promise.all([
      this.newsRepo.countDocuments(filter),
      this.newsRepo.findAll(filter, skip, size, sort, FIELDS.NEWS.CLIENT)
    ]);

    return {
      meta: {
        page,
        size,
        totalPages: Math.ceil(totalElements / size),
        totalElements
      },
      data
    };
  }

  async getDetail(id: string) {
    checkMongoId(id);
    const news = await this.newsRepo.findById(id);
    if (!news) throw new NotFoundException('Tin tức không tồn tại');
    return news;
  }

  async updateStatus(id: string, status: NewsStatus, user: IUserContext) {
    checkMongoId(id);

    const updated = await this.newsRepo.updateStatus(id, status, user.userId);

    if (!updated) {
      throw new NotFoundException('Tin tức không tồn tại hoặc đã bị xóa');
    }

    return updated;
  }
}
