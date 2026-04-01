import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CloudinaryConfig } from 'configs';

import { CloudinaryService } from './cloudinary.service';
import { CloudinaryController } from './cloudinary.controller';

@Module({
  imports: [ConfigModule],
  controllers: [CloudinaryController],
  providers: [
    CloudinaryService,
    {
      provide: 'CLOUDINARY',
      useFactory: (configService: ConfigService) => CloudinaryConfig(configService),
      inject: [ConfigService] // 👈 thêm dòng này để Nest biết cần inject ConfigService
    }
  ],
  exports: [CloudinaryService]
})
export class CloudinaryModule {}
