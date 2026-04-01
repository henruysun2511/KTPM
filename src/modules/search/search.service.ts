import { Injectable } from '@nestjs/common';
import { AlbumSearchService } from 'modules/album/services/album.search.service';
import { ArtistSearchService } from 'modules/artist/services/artist.search.service';
import { GenreSearchService } from 'modules/genres/services/genre.search.service';
import { PlaylistSearchService } from 'modules/playlist/services/playlist.search.service';
import { SongSearchService } from 'modules/songs/services/song.search.service';

@Injectable()
export class SearchService {
  constructor(
    private readonly songSearch: SongSearchService,
    private readonly artistSearch: ArtistSearchService,
    private readonly albumSearch: AlbumSearchService,
    private readonly playlistSearch: PlaylistSearchService,
    private readonly genreSearch: GenreSearchService
  ) {}

  async search(keyword: string) {
    const results = await Promise.all([
      this.songSearch.search(keyword),
      this.artistSearch.search(keyword),
      this.albumSearch.search(keyword),
      this.playlistSearch.search(keyword),
      this.genreSearch.search(keyword)
    ]);

    return results;
  }
}
