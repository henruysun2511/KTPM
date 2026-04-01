import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ArtistModule } from 'modules/artist/artist.module';
import { NotificationModule } from 'modules/notification/notification.module';
import { RedisModule } from 'modules/redis/redis.module';

import { SongModule } from './../songs/song.module';
import { LikeService } from './services/like.service';
import { LikeController } from './controllers/like.controller';
import { Like, LikeSchema } from './schemas/like.schema';
import { LikeRepository } from './repositories/like.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
    SongModule,
    ArtistModule,
    NotificationModule,
    RedisModule
  ],
  controllers: [LikeController],
  providers: [LikeService, LikeRepository]
})
export class LikeModule {}
