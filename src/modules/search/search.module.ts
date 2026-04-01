import { Module } from '@nestjs/common';
import { SongModule } from 'modules/songs/song.module';
import { PlaylistModule } from 'modules/playlist/playlist.module';
import { ArtistModule } from 'modules/artist/artist.module';
import { GenreModule } from 'modules/genres/genre.module';
import { AlbumModule } from 'modules/album/album.module';

import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [SongModule, PlaylistModule, ArtistModule, GenreModule, AlbumModule],
  controllers: [SearchController],
  providers: [SearchService]
})
export class SearchModule {}
