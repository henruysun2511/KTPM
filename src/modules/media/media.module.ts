import { Module } from '@nestjs/common';
import { CloudinaryModule } from 'modules/cloudinary/cloudinary.module';

import { MediaService } from './media.service';
import { MediaController } from './media.controller';

@Module({
  imports: [CloudinaryModule],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService]
})
export class MediaModule {}
