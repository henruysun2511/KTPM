import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SubscriptionStatus } from 'common/enum/subscription.enum';

import { SubscriptionPlan } from '../schemas/subscription.schema';

@Injectable()
export class SubscriptionRepository {
  constructor(@InjectModel(SubscriptionPlan.name) private readonly subscriptionRepo: Model<SubscriptionPlan>) {}

  async createSubscriptionPlan(subscriptionPlanData: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    return await this.subscriptionRepo.create(subscriptionPlanData);
  }

  async changeStatusWhenExpired(): Promise<void> {
    await this.subscriptionRepo.updateMany({ endDate: { $lt: new Date() } }, { status: SubscriptionStatus.EXPIRED });
  }

  async findExpiredActivePremiumUserIds(): Promise<string[]> {
    const subs = await this.subscriptionRepo
      .find({
        status: SubscriptionStatus.ACTIVE,
        endDate: { $lt: new Date() },
        deleted: false
      })
      .select('userId -_id')
      .lean<{ userId: string | Types.ObjectId }[]>();

    return subs.map((s) => s.userId.toString());
  }
}
