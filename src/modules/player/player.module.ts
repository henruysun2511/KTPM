import { Module } from '@nestjs/common';
import { SongModule } from 'modules/songs/song.module';
import { PlaylistModule } from 'modules/playlist/playlist.module';
import { AdvertisementModule } from 'modules/advertisement/advertisement.module';
import { AlbumModule } from 'modules/album/album.module';

import { PlayerController } from './controllers/player.controller';
import { PlayerService } from './services/player.service';

@Module({
  imports: [SongModule, PlaylistModule, AdvertisementModule, AlbumModule],
  controllers: [PlayerController],
  providers: [PlayerService]
})
export class PlayerModule {}
