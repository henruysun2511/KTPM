import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QueueModule } from 'modules/queue/queue.module';

import { AdvertisementService } from './services/advertisement.service';
import { AdvertisementController } from './controllers/advertisement.controller';
import { Advertisement, AdvertisementSchema } from './schemas/advertisement.schema';
import { AdvertisementRepository } from './repositories/advertisement.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: Advertisement.name, schema: AdvertisementSchema }])],
  controllers: [AdvertisementController],
  providers: [AdvertisementService, AdvertisementRepository],
  exports: [AdvertisementService]
})
export class AdvertisementModule {}
