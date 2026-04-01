import { Module } from '@nestjs/common';
import { SongModule } from 'modules/songs/song.module';
import { UserModule } from 'modules/user/user.module';
import { RevenueModule } from 'modules/revenue/revenue.module';
import { RedisModule } from 'modules/redis/redis.module';
import { ProductModule } from 'modules/product/product.module';

import { SubscriptionModule } from '../subscription/subscription.module';
import { PaymentModule } from '../payments/payment.module';

import { TaskService } from './task.service';
import { TaskController } from './task.controller';

@Module({
  imports: [SubscriptionModule, PaymentModule, SongModule, UserModule, RevenueModule, RedisModule, ProductModule],
  controllers: [TaskController],
  providers: [TaskService]
})
export class TaskModule {}
