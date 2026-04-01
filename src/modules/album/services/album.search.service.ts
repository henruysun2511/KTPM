import { Injectable } from '@nestjs/common';

import { AlbumRepository } from '../repositories/album.repository';

@Injectable()
export class AlbumSearchService {
  constructor(private readonly albumRepo: AlbumRepository) {}

  async search(keyword: string) {
    return await this.albumRepo.searchByName(keyword, 10);
  }
}
