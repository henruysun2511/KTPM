import { Controller, Param } from '@nestjs/common';
import { User } from 'shared/decorators/customize';
import { IUserRequest } from 'shared/interfaces';

import { SubscriptionService } from '../services/subscription.service';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  async extendThePackage(@Param('id') planId: string, @User() user: IUserRequest) {
    return await this.subscriptionService.extendThePackage(planId, user);
  }
}
