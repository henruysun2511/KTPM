import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentService } from 'modules/payments/services/payment.service';

import { RevenueRepository } from '../repositories/revenue.repository';

@Injectable()
export class RevenueService {
  constructor(
    private readonly revenueRepo: RevenueRepository,
    private readonly paymentService: PaymentService
  ) {}

  async create() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const totalPrice = await this.paymentService.getRevenueTotalsByDate(date, ['buy-plan']);
    await this.revenueRepo.update(startOfMonth, totalPrice);
  }

  async getRevenueByYear(year: number): Promise<Array<{ year: number; month: number; count: number }>> {
    const y = Number(year);
    if (!Number.isInteger(y) || y < 1970 || y > 3000) {
      throw new BadRequestException('Invalid year');
    }

    // build UTC range for the year (inclusive)
    const start = new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0)).toISOString();
    const end = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999)).toISOString();

    // repository should return [{ year, month, count }, ...] for months that have users
    const agg = await this.revenueRepo.getRevenueYear(start, end);

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
