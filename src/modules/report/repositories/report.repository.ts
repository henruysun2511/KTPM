import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Report } from '../schemas/report.schema';

@Injectable()
export class ReportRepository {
  constructor(@InjectModel(Report.name) private readonly reportRepo: Model<Report>) {}

  async create(reportData: Partial<Report>): Promise<Report> {
    return await this.reportRepo.create(reportData);
  }

  async updateStatus(_id: string, reportData: Partial<Report>) {
    return await this.reportRepo.updateOne({ _id }, { $set: reportData }).exec();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async countDocuments(filter: Record<string, any>): Promise<number> {
    return await this.reportRepo.countDocuments(filter);
  }

  async findAll(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filter: Record<string, any>,
    skip: number,
    size: number,
    sort: Record<string, 1 | -1>,
    select?: string | string[]
  ): Promise<Report[] | []> {
    const reports = this.reportRepo
      .find({ deleted: false, ...filter })
      .sort(sort)
      .skip(skip)
      .limit(size);
    if (select) reports.select(select);
    reports.populate('targetId').lean();
    return await reports.exec();
  }
}
