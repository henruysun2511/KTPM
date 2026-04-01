import { Injectable } from '@nestjs/common';
import { PaymentService } from 'modules/payments/services/payment.service';
import { IUserRequest } from 'shared/interfaces';

import { SubscriptionRepository } from '../repositories/subscription.repository';
import { SubscriptionPlan } from '../schemas/subscription.schema';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly subscriptionRepo: SubscriptionRepository,
    private readonly paymentService: PaymentService
  ) {}

  async createSubscriptionPlan(subscriptionPlanData: Partial<SubscriptionPlan>) {
    return await this.subscriptionRepo.createSubscriptionPlan(subscriptionPlanData);
  }

  async extendThePackage(planId: string, user: IUserRequest) {
    return await this.paymentService.createPaymentPlan({ planId }, user);
  }

  async changeStatusWhenExpired() {
    return await this.subscriptionRepo.changeStatusWhenExpired();
  }

  async findExpiredActivePremiumUserIds() {
    return await this.subscriptionRepo.findExpiredActivePremiumUserIds();
  }
}
