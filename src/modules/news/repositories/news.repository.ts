import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NewsStatus } from 'common/enum';
import { Model, UpdateWriteOpResult } from 'mongoose';

import { News } from '../schemas/news.schema';

@Injectable() // Thêm decorator Injectable
export class NewsRepository {
  constructor(@InjectModel(News.name) private newsRepo: Model<News>) {}

  async create(newsData: Partial<News>): Promise<News> {
    const news = new this.newsRepo(newsData);
    return news.save();
  }

  // Đồng bộ: Trả về lean() và filter deleted: false
  async findById(_id: string): Promise<News | null> {
    return await this.newsRepo
      .findOne({ _id, deleted: false })
      .populate({
        path: 'createdBy',
        select: 'username avatar'
      })
      .lean()
      .exec();
  }

  async findAll(
    filter: Record<string, any>,
    skip: number,
    size: number,
    sort: Record<string, 1 | -1>,
    select?: string | string[]
  ) {
    const query = this.newsRepo
      .find({ ...filter, deleted: false })
      .sort(sort)
      .skip(skip)
      .limit(size)
      .lean();

    if (select) query.select(select);
    return await query.exec();
  }

  async countDocuments(filter: Record<string, any>): Promise<number> {
    return this.newsRepo.countDocuments({ ...filter, deleted: false }).exec();
  }

  async updateById(id: string, newsData: Partial<News>): Promise<News | null> {
    return this.newsRepo
      .findOneAndUpdate({ _id: id, deleted: false }, { $set: newsData }, { new: true, runValidators: true })
      .exec();
  }

  async checkExist(_id: string): Promise<boolean> {
    const exist = await this.newsRepo.exists({ _id, deleted: false });
    return !!exist;
  }

  async remove(id: string, deletedBy: string): Promise<UpdateWriteOpResult> {
    return await this.newsRepo.updateOne(
      { _id: id, deleted: false },
      { deleted: true, deletedBy, deletedAt: new Date() }
    );
  }

  async updateStatus(id: string, status: NewsStatus, updatedBy: string): Promise<News | null> {
    return this.newsRepo
      .findOneAndUpdate(
        { _id: id, deleted: false },
        {
          $set: {
            status,
            updatedBy,
            updatedAt: new Date()
          }
        },
        { new: true }
      )
      .exec();
  }
}
