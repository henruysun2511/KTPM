import { Module } from '@nestjs/common';
import { EmailModule } from 'modules/email/email.module';
import { NotificationModule } from 'modules/notification/notification.module';
import { QueueModule } from 'modules/queue/queue.module';
import { PaymentModule } from 'modules/payments/payment.module';
import { FollowModule } from 'modules/follow/follow.module';

import { EmailConsumer } from './email.consumer';
import { SendNotificationConsumer } from './notification.consumer';
import { PaymentPlanConsumer } from './payment-plan.consumer';
import { PaymentProductConsumer } from './payment-product.consumer';
import { FanoutFollowerConsumer } from './fanout-follower.consumer';

@Module({
  imports: [QueueModule, EmailModule, NotificationModule, PaymentModule, FollowModule],
  providers: [
    EmailConsumer,
    SendNotificationConsumer,
    PaymentPlanConsumer,
    PaymentProductConsumer,
    FanoutFollowerConsumer
  ]
})
export class WorkerModule {}
