import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from 'modules/user/user.module';
import { CartModule } from 'modules/cart/cart.module';
import { RedisModule } from 'modules/redis/redis.module';
import { QueueModule } from 'modules/queue/queue.module';

import { SubscriptionModule } from '../subscription/subscription.module';
import { PlanModule } from '../plan/plan.module';
import { ProductModule } from '../product/product.module';
import { PurchaseHistoryModule } from '../purchase-history/purchase-history.module';

import { Payment, PaymentSchema } from './schemas/payment.schema';
import { PaymentRepository } from './repositories/payment.repository';
import { PaymentService } from './services/payment.service';
import { PaymentController } from './controllers/payment.controller';

@Module({
  imports: [
    HttpModule,
    ProductModule,
    PurchaseHistoryModule,
    forwardRef(() => UserModule),
    forwardRef(() => SubscriptionModule),
    PlanModule,
    CartModule,
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    RedisModule,
    QueueModule
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepository],
  exports: [PaymentService]
})
export class PaymentModule {}
