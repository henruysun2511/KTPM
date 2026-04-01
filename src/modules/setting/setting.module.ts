import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SettingController } from './controllers/setting.controller';
import { SettingRepository } from './repositories/setting.repository';
import { Setting, SettingSchema } from './schemas/setting.schema';
import { SettingService } from './services/setting.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Setting.name, schema: SettingSchema }])],
  controllers: [SettingController],
  providers: [SettingService, SettingRepository],
  exports: [SettingService]
})
export class SettingModule {}
