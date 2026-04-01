import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PaymentModule } from '../payments/payment.module';

import { SubscriptionService } from './services/subscription.service';
import { SubscriptionRepository } from './repositories/subscription.repository';
import { SubscriptionPlan, SubscriptionPlanSchema } from './schemas/subscription.schema';
import { SubscriptionController } from './controllers/subscription.controller';

@Module({
  imports: [
    forwardRef(() => PaymentModule),
    MongooseModule.forFeature([{ name: SubscriptionPlan.name, schema: SubscriptionPlanSchema }])
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, SubscriptionRepository],
  exports: [SubscriptionService]
})
export class SubscriptionModule {}
