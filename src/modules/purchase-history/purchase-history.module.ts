import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PurchaseHistoryService } from './services/purchase-history.service';
import { PurchaseHistory, PurchaseHistorySchema } from './schemas/purchase-history.schema';
import { PurchaseHistoryRepository } from './repositories/purchase-history.repository';
import { PurchaseHistoryController } from './controllers/purchase-history.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: PurchaseHistory.name, schema: PurchaseHistorySchema }])],
  controllers: [PurchaseHistoryController],
  providers: [PurchaseHistoryService, PurchaseHistoryRepository],
  exports: [PurchaseHistoryService]
})
export class PurchaseHistoryModule {}
