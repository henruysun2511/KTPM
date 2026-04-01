import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Advertisement } from '../schemas/advertisement.schema';

export class AdvertisementRepository {
  constructor(@InjectModel(Advertisement.name) private adsRepo: Model<Advertisement>) {}

  //Lấy danh sách quảng cáo
  async findAll(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filter: Record<string, any>,
    skip: number,
    limit: number,
    sort: Record<string, 1 | -1>
  ): Promise<Advertisement[] | []> {
    return await this.adsRepo
      .find({ deleted: false, ...filter })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
  }

  async findActiveAds(): Promise<Advertisement[] | []> {
    return this.adsRepo.find({ isActived: true }).lean().exec();
  }

  async create(adsData: Partial<Advertisement>): Promise<Advertisement> {
    return this.adsRepo.create(adsData);
  }

  async update(id: string, adsData: Partial<Advertisement>): Promise<Advertisement | null> {
    return await this.adsRepo
      .findByIdAndUpdate(id, { $set: adsData }, { new: true })
      .select('_id title partner description audioUrl bannerUrl')
      .exec();
  }

  async delete(id: string, userId: string): Promise<Advertisement | null> {
    return await this.adsRepo
      .findByIdAndUpdate(id, { deleted: true, deletedAt: new Date(), deletedBy: userId }, { new: true })
      .exec();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async countDocuments(filter: Record<string, any>) {
    return this.adsRepo.countDocuments({ deleted: false, ...filter });
  }

  async activate(id: string): Promise<Advertisement | null> {
    return await this.adsRepo.findByIdAndUpdate(id, { isActived: true }, { new: true });
  }

  async deactivate(id: string): Promise<Advertisement | null> {
    return await this.adsRepo.findByIdAndUpdate(id, { isActived: false }, { new: true });
  }

  async getDetail(_id: string): Promise<Advertisement | null> {
    return await this.adsRepo.findOne({ _id, deleted: false }).lean();
  }

  async getRandomAds(): Promise<Advertisement | null> {
    // chỉ lấy quảng cáo chưa xóa và đang active
    const ads = await this.adsRepo.find({ deleted: false, isActived: true }).lean();
    if (!ads || ads.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * ads.length);
    return ads[randomIndex];
  }
}
