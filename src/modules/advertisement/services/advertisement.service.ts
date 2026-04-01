import { Injectable, NotFoundException } from '@nestjs/common';
import { checkMongoId } from 'shared/utils/validateMongoId.util';

import { AdvertisementRepository } from '../repositories/advertisement.repository';
import { CreateAdvertisementDto, UpdateAdvertisementDto } from '../dtos';
import { QueryAdvertisementDto } from '../dtos/query-advertisement.dto';
import { buildAdsFilterQuery } from '../queries/advertisement.query';

@Injectable()
export class AdvertisementService {
  constructor(private readonly adsRepo: AdvertisementRepository) {}

  async create(createAdvertisementDto: CreateAdvertisementDto, userId: string) {
    const advertisement = await this.adsRepo.create({
      ...createAdvertisementDto,
      createdBy: userId
    });

    return advertisement;
  }

  async findAllActiveAdvertisements() {
    return await this.adsRepo.findActiveAds();
  }

  async updateAdvertisement(id: string, advertisementDto: UpdateAdvertisementDto, userId: string) {
    checkMongoId(id);
    const advertisement = await this.adsRepo.update(id, {
      ...advertisementDto,
      updatedBy: userId
    });

    if (!advertisement) throw new NotFoundException('Quảng cáo không tồn tại');

    return advertisement;
  }

  async updateAdvertisementMedia(id: string, media: { audioUrl?: string; bannerUrl?: string }) {
    return await this.adsRepo.update(id, media);
  }

  async removeAdvertisement(id: string, userId: string) {
    checkMongoId(id);
    const deleted = await this.adsRepo.delete(id, userId);
    if (!deleted) throw new NotFoundException('Quảng cáo này không tồn tại');
  }

  async activeAdvertisement(id: string) {
    checkMongoId(id);
    const advertisement = await this.adsRepo.activate(id);
    if (!advertisement) throw new NotFoundException('Quảng cáo này không tồn tại');
    return advertisement;
  }

  async deactiveAdvertisement(id: string) {
    checkMongoId(id);
    const advertisement = await this.adsRepo.deactivate(id);
    if (!advertisement) throw new NotFoundException('Quảng cáo này không tồn tại');
    return advertisement;
  }

  async getRandomAds() {
    return await this.adsRepo.getRandomAds();
  }

  async findAllAdvertisements(query: QueryAdvertisementDto) {
    const page = query.page || 1;
    const size = query.size || 10;
    const skip = (page - 1) * size;

    const { filter, sort } = buildAdsFilterQuery(query);

    const [totalElements, data] = await Promise.all([
      this.adsRepo.countDocuments(filter),
      this.adsRepo.findAll(filter, skip, size, sort)
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

  async getDetail(id: string) {
    checkMongoId(id);
    return await this.adsRepo.getDetail(id);
  }
}
