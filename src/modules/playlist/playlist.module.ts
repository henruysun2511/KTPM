import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SongModule } from 'modules/songs/song.module';

import { PlaylistController } from './controllers/playlist.controller';
import { PlaylistService } from './services/playlist.service';
import { Playlist, PlaylistSchema } from './schemas/playlist.schema';
import { PlaylistRepository } from './repositories/playlist.repository';
import { PlaylistSearchService } from './services/playlist.search.service';
import { PlaylistAdminController } from './controllers/playlist.admin.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Playlist.name, schema: PlaylistSchema }]), SongModule],
  controllers: [PlaylistController, PlaylistAdminController],
  providers: [PlaylistService, PlaylistRepository, PlaylistSearchService],
  exports: [PlaylistService, PlaylistSearchService]
})
export class PlaylistModule {}
