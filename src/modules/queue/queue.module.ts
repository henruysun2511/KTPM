import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueName } from 'common/constants';

import { SendNotificationProducer } from './producers/notification.producer';
import { EmailProducer, FanoutFollowerProducer, PaymentPlanProducer } from './producers';
import { PaymentProductProducer } from './producers/payment-product.producer';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QueueName.EmailQueue },
      { name: QueueName.SendNotificationQueue },
      { name: QueueName.PaymentPlanQueue },
      { name: QueueName.PaymentProductQueue },
      { name: QueueName.FanoutFollowerQueue }
    )
  ],
  providers: [
    SendNotificationProducer,
    EmailProducer,
    PaymentPlanProducer,
    PaymentProductProducer,
    FanoutFollowerProducer
  ],
  exports: [
    SendNotificationProducer,
    EmailProducer,
    PaymentPlanProducer,
    PaymentProductProducer,
    FanoutFollowerProducer
  ]
})
export class QueueModule {}
