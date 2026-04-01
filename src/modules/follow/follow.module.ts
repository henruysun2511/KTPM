import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ArtistModule } from 'modules/artist/artist.module';
import { NotificationModule } from 'modules/notification/notification.module';

import { FollowService } from './services/follow.service';
import { FollowController } from './controllers/follow.controller';
import { Follow, FollowSchema } from './schemas/follow.schema';
import { FollowRepository } from './repositories/follow.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: Follow.name, schema: FollowSchema }]), ArtistModule, NotificationModule],
  controllers: [FollowController],
  providers: [FollowService, FollowRepository],
  exports: [FollowService]
})
export class FollowModule {}
