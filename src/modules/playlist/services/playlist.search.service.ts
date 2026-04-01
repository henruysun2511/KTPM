import { Injectable } from '@nestjs/common';

import { PlaylistRepository } from '../repositories/playlist.repository';

@Injectable()
export class PlaylistSearchService {
  constructor(private readonly playlistRepo: PlaylistRepository) {}

  async search(keyword: string) {
    return await this.playlistRepo.searchByName(keyword, 10);
  }
}
