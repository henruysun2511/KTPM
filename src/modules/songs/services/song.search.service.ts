import { Injectable } from '@nestjs/common';

import { SongRepository } from '../repositories/song.repository';

@Injectable()
export class SongSearchService {
  constructor(private readonly songRepo: SongRepository) {}

  async search(keyword: string) {
    return await this.songRepo.searchByName(keyword, 10);
  }
}
