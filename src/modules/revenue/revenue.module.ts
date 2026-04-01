import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentModule } from 'modules/payments/payment.module';

import { RevenueService } from './services/revenue.service';
import { RevenueController } from './controllers/revenue.controller';
import { Revenue, RevenueSchema } from './schemas/revenue.schema';
import { RevenueRepository } from './repositories/revenue.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: Revenue.name, schema: RevenueSchema }]), PaymentModule],
  controllers: [RevenueController],
  providers: [RevenueService, RevenueRepository],
  exports: [RevenueService]
})
export class RevenueModule {}
