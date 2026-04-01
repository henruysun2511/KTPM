import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { PaymentStatus } from 'common/enum';

import { Payment } from '../schemas/payment.schema';

@Injectable()
export class PaymentRepository {
  constructor(@InjectModel(Payment.name) private readonly paymentRepo: Model<Payment>) {}

  async create(paymentData: Partial<Payment>, session?: ClientSession): Promise<Payment> {
    const [payment] = await this.paymentRepo.create([paymentData], { session });
    return payment;
  }

  async changeStatus(transactionId: number, status: PaymentStatus) {
    return await this.paymentRepo.updateOne({ transactionId }, { $set: { status } });
  }

  async findPaymentCancelledById(transactionId: number) {
    return await this.paymentRepo.findOne({ transactionId, status: PaymentStatus.CANCELLED }).lean().exec();
  }

  async findByTransactionId(transactionId: number) {
    return await this.paymentRepo.findOne({ transactionId }).lean().exec();
  }

  async findById(_id: string): Promise<Payment | null> {
    return await this.paymentRepo.findOne({ _id, deleted: false });
  }

  async removePaymentWhenExpried() {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    await this.paymentRepo.updateMany(
      { createdAt: { $lt: tenMinutesAgo }, deleted: false, status: PaymentStatus.PENDING },
      { deleted: true, deletedAt: new Date() }
    );
  }

  async getRevenueTotalsByDate(date: Date, flows?: string[]): Promise<Record<string, number>> {
    if (Number.isNaN(date.getTime())) throw new Error('Invalid date');

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const match: any = {
      updatedAt: { $gte: start, $lt: end },
      deleted: false,
      status: PaymentStatus.SUCCEEDED
    };

    if (flows && flows.length > 0) match.flow = { $in: flows };

    const res = await this.paymentRepo
      .aggregate([
        { $match: match },
        { $group: { _id: '$flow', total: { $sum: { $ifNull: ['$amount', 0] } } } },
        { $project: { _id: 0, flow: '$_id', total: 1 } }
      ])
      .exec();

    const map: Record<string, number> = {};
    for (const r of res) {
      if (r && r.flow) map[r.flow] = Number(r.total) || 0;
    }
    return map;
  }
}
