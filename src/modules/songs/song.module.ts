import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AlbumModule } from 'modules/album/album.module';
import { ArtistModule } from 'modules/artist/artist.module';
import { FollowModule } from 'modules/follow/follow.module';
import { GenreModule } from 'modules/genres/genre.module';
import { NotificationModule } from 'modules/notification/notification.module';
import { QueueModule } from 'modules/queue/queue.module';
import { RedisModule } from 'modules/redis/redis.module';

import { SongAdminController } from './controllers/song.admin.controller';
import { SongController } from './controllers/song.controller';
import { SongRepository } from './repositories/song.repository';
import { Song, SongSchema } from './schemas/song.schema';
import { SongSearchService } from './services/song.search.service';
import { SongService } from './services/song.service';
// 1. Import Schema mới vào đây
import { SongListen, SongListenSchema } from './schemas/song-listen.schema';

@Module({
  imports: [
    // 2. Thêm SongListen vào mảng forFeature
    MongooseModule.forFeature([
      { name: Song.name, schema: SongSchema },
      { name: SongListen.name, schema: SongListenSchema }
    ]),
    QueueModule,
    GenreModule,
    ArtistModule,
    AlbumModule,
    FollowModule,
    NotificationModule,
    RedisModule
  ],
  controllers: [SongController, SongAdminController],
  providers: [SongService, SongRepository, SongSearchService],
  exports: [SongService, SongSearchService]
})
export class SongModule {}
