import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Revenue } from '../schemas/revenue.schema';

@Injectable()
export class RevenueRepository {
  constructor(@InjectModel(Revenue.name) private readonly revenueRepo: Model<Revenue>) {}

  async update(startOfMonth: Date, amounts: Record<string, number>): Promise<void> {
    const inc: Record<string, number> = { totalRevenue: 0 };

    for (const [flow, amt] of Object.entries(amounts)) {
      const n = Number(amt) || 0;
      inc.totalRevenue += n;
      inc[`revenueByFlow.${flow}`] = n;
    }

    await this.revenueRepo.updateOne(
      { month: startOfMonth },
      {
        $inc: inc,
        $setOnInsert: {
          month: startOfMonth,
          revenueByFlow: {}
        }
      },
      { upsert: true }
    );
  }

  async getRevenueYear(
    startDate: string,
    endDate: string
  ): Promise<Array<{ year: number; month: number; count: number }>> {
    return await this.revenueRepo
      .aggregate([
        {
          $match: {
            month: { $gte: new Date(startDate), $lte: new Date(endDate) },
            deleted: false
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$month' },
              month: { $month: '$month' }
            },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            year: '$_id.year',
            month: '$_id.month',
            count: 1
          }
        },
        { $sort: { year: 1, month: 1 } }
      ])
      .exec();
  }
}
